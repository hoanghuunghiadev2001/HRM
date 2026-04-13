/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CreateProposalFormData } from "@/components/api";
import { FileService } from "./file-service";
import { EmailService } from "./email-prososal-service";
import { prisma } from "./prisma";
import type { Prisma } from "../../generated/prisma/client";
import { generateActionToken } from "@/utils/actionLink";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function sendWithRetry(
  fn: () => Promise<any>,
  retries = 3,
  delay = 1000,
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`❌ Email attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error("❌ Email failed completely after retries");
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export class ProposalService {
  /**
   * SAFE SELECT cho Employee
   * - Lưu ý: Employee không có field `email` trực tiếp (theo lỗi bạn gửi).
   *   Email/phone nằm trong relation `contactInfo` — mình chọn lấy từ đó.
   * - Nếu schema của bạn khác, chỉnh `contactInfo.select` cho khớp.
   */
  static FULL_EMPLOYEE_SELECT: Prisma.EmployeeSelect = {
    id: true,
    name: true,
    employeeCode: true,
    avatar: true,
    // Contact info relation — chứa email/phone theo schema bạn đã show.
    contactInfo: {
      select: {
        phoneNumber: true,
        companyPhone: true,
        relativePhone: true,
        zalo_user_id: true,
        email: true,
      },
    },
    // workInfo relation (position, department)
    workInfo: {
      select: {
        position: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    // manager relation (basic fields)
    manager: {
      select: {
        id: true,
        name: true,
        employeeCode: true,
        avatar: true,
      },
    },
  } as Prisma.EmployeeSelect;

  /**
   * Proposal include — chỉ include những gì cần (với select cho employee nested)
   */
  static FULL_PROPOSAL_INCLUDE: Prisma.ProposalInclude = {
    files: true,
    vehicle: true,
    proposer: { select: ProposalService.FULL_EMPLOYEE_SELECT },
    createdBy: { select: ProposalService.FULL_EMPLOYEE_SELECT },
    signers: {
      select: {
        id: true,
        level: true,
        status: true,
        signerId: true,
        signedAt: true,
        reason: true,
        signer: { select: ProposalService.FULL_EMPLOYEE_SELECT },
      },
    },
    approvers: {
      select: {
        id: true,
        level: true,
        status: true,
        approverId: true,
        approvedAt: true,
        reason: true,
        approver: { select: ProposalService.FULL_EMPLOYEE_SELECT },
      },
    },
  } as Prisma.ProposalInclude;

  static getFullIncludeObject() {
    return this.FULL_PROPOSAL_INCLUDE;
  }

  // -------------------- Create proposal --------------------
  static async createProposal(
    proposalData: CreateProposalFormData,
    files: File[] | null,
    createdById: number,
  ) {
    try {
      const uploadedFileIds: number[] = [];
      const fileUrls: string[] = [];

      // 1. Duyệt và upload danh sách file đính kèm
      if (files && files.length > 0) {
        for (const file of files) {
          const { valid, error } = FileService.validateFile(file);
          if (!valid) {
            return {
              success: false,
              error: `File ${file.name} không hợp lệ: ${error}`,
            };
          }

          // Upload file vào bảng File (lưu dạng Bytes như Schema của bạn)
          const { fileId } = await FileService.uploadFile(file);
          uploadedFileIds.push(fileId);
          fileUrls.push(`${baseUrl}/api/files/${fileId}`);
        }
      }

      // 2. Tạo bản ghi Proposal và các quan hệ Signer/Approver/File
      const newProposal = await prisma.proposal.create({
        data: {
          name: proposalData.name,
          title: proposalData.title,
          description: proposalData.description,
          proposerId: proposalData.proposerId,
          createdById,
          proposalType: proposalData.proposalType || "REGULAR",
          vehicleId: proposalData.vehicleId || null,
          startAt: proposalData.startAt || null,
          endAt: proposalData.endAt || null,
          dropoffPlace: proposalData.dropoffPlace || null,

          // Kết nối mảng file vừa upload
          files: {
            connect: uploadedFileIds.map((id) => ({ id })),
          },

          // Tạo danh sách người ký (theo thứ tự level)
          signers: {
            create: proposalData.signerIds.map((id, idx) => ({
              level: idx + 1,
              status: "pending",
              signer: { connect: { id } },
            })),
          },

          // Tạo danh sách người phê duyệt
          approvers: {
            create: proposalData.approverIds.map((id, idx) => ({
              level: idx + 1,
              status: "pending",
              approver: { connect: { id } },
            })),
          },
        },
        include: {
          ...this.FULL_PROPOSAL_INCLUDE,
          files: true, // Lấy thông tin file để gửi email
          proposer: {
            include: {
              contactInfo: {
                select: {
                  email: true, // Chỉ lấy email từ contactInfo
                },
              },
            },
          },
        },
      });

      // 3. Chuẩn bị thông tin file gửi kèm Email
      const filePayload = {
        fileUrl: fileUrls.length > 0 ? fileUrls[0] : null, // File đầu tiên làm đại diện
        allFiles: fileUrls, // Danh sách tất cả link file để loop trong template email
      };

      // 4. Gửi email xác nhận cho người tạo (Proposer)
      try {
        await sendWithRetry(() =>
          EmailService.sendProposalCreatedConfirmation(newProposal.proposer, {
            ...newProposal,
            ...filePayload,
          }),
        );
      } catch (err) {
        console.error("❌ Email xác nhận proposer thất bại:", err);
      }

      // 5. Thông báo cho người ký đầu tiên (Level 1)
      const firstSignerRecord = (newProposal.signers || [])
        .filter((s: any) => s.status === "pending")
        .sort((a: any, b: any) => a.level - b.level)[0];

      if (firstSignerRecord) {
        const signerInfo = await prisma.employee.findUnique({
          where: { id: firstSignerRecord.signerId },
          select: this.FULL_EMPLOYEE_SELECT,
        });

        if (signerInfo) {
          // Tạo token để ký nhanh qua Email (không cần login lại)
          const approveAction = generateActionToken({
            proposalId: newProposal.id,
            actorId: signerInfo.id,
            role: "signer",
            action: "approve",
          });
          const rejectAction = generateActionToken({
            proposalId: newProposal.id,
            actorId: signerInfo.id,
            role: "signer",
            action: "reject",
          });

          try {
            await sendWithRetry(() =>
              EmailService.sendSignatureRequest(signerInfo, {
                ...newProposal,
                ...filePayload,
                approveLink: approveAction.directApi,
                rejectLink: rejectAction.directApi,
              }),
            );
          } catch (err) {
            console.error("❌ Email gửi signer level 1 thất bại:", err);
          }
        }
      }

      return { success: true, data: newProposal };
    } catch (error) {
      console.error("[ProposalService] ❌ createProposal error:", error);
      return {
        success: false,
        error: "Không thể tạo đề xuất, vui lòng kiểm tra lại dữ liệu.",
      };
    }
  }

  // -------------------- Get proposal --------------------
  static async getProposal(proposalId: number, userId?: string) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          ...this.getFullIncludeObject(),
          // Đảm bảo include cả quan hệ files (1-N) và file (1-1 cũ nếu có)
          files: true,
        },
      });

      if (!proposal) return { success: false, error: "Không tìm thấy đề xuất" };

      // --- LOGIC XỬ LÝ FILE DỰ PHÒNG ---
      let finalFiles = proposal.files || [];

      // Nếu mảng files trống nhưng có fileId (dữ liệu cũ), hãy đi tìm file đó
      if (finalFiles.length === 0 && proposal.fileId) {
        const legacyFile = await prisma.file.findUnique({
          where: { id: proposal.fileId },
        });
        if (legacyFile) {
          finalFiles = [legacyFile];
        }
      }
      // --------------------------------

      const sortedSigners = (proposal.signers || [])
        .slice()
        .sort((a: any, b: any) => a.level - b.level);
      const sortedApprovers = (proposal.approvers || [])
        .slice()
        .sort((a: any, b: any) => a.level - b.level);

      const isRejected =
        sortedSigners.some((s: any) => s.status === "rejected") ||
        sortedApprovers.some((a: any) => a.status === "rejected");

      const nextSignerIndex = !isRejected
        ? sortedSigners.findIndex(
            (s: any, idx: number) =>
              s.status === "pending" &&
              sortedSigners
                .slice(0, idx)
                .every((p: any) => p.status === "approved"),
          )
        : -1;

      const allSignersApproved = sortedSigners.every(
        (s: any) => s.status === "approved",
      );

      const nextApproverIndex =
        !isRejected && allSignersApproved
          ? sortedApprovers.findIndex(
              (a: any, idx: number) =>
                a.status === "pending" &&
                sortedApprovers
                  .slice(0, idx)
                  .every((p: any) => p.status === "approved"),
            )
          : -1;

      const signers = sortedSigners.map((s: any, i: number) => ({
        ...s,
        isCurrent: i === nextSignerIndex,
      }));
      const approvers = sortedApprovers.map((a: any, i: number) => ({
        ...a,
        isCurrent: i === nextApproverIndex,
      }));

      let currentStep: { step: string; userId: string | null } = {
        step: "done",
        userId: null,
      };
      if (isRejected) currentStep = { step: "rejected", userId: null };
      else if (nextSignerIndex >= 0)
        currentStep = {
          step: "sign",
          userId: String(signers[nextSignerIndex].signerId),
        };
      else if (nextApproverIndex >= 0)
        currentStep = {
          step: "approve",
          userId: String(approvers[nextApproverIndex].approverId),
        };

      const statusSign = signers.some(
        (s: any) => s.isCurrent && String(s.signerId) === String(userId),
      );
      const statusApprove = approvers.some(
        (a: any) => a.isCurrent && String(a.approverId) === String(userId),
      );

      return {
        success: true,
        data: {
          ...proposal,
          files: finalFiles, // Trả về danh sách file đã được xử lý dự phòng
          signers,
          approvers,
          currentStep,
          statusSign,
          statusApprove,
        },
      };
    } catch (error) {
      console.error("[ProposalService] ❌ getProposal error:", error);
      return { success: false, error: "Lỗi khi lấy thông tin đề xuất" };
    }
  }

  // -------------------- Sign proposal --------------------
  static async signProposal(
    proposalId: number,
    employeeId: number,
    status: "approved" | "rejected",
    reason?: string,
  ) {
    try {
      // 1. Tìm bản ghi signer cụ thể để kiểm tra quyền nhanh (Không include linh tinh)
      const currentSigner = await prisma.proposalSigner.findFirst({
        where: {
          proposalId: proposalId,
          signerId: employeeId,
          status: "pending",
        },
      });

      if (!currentSigner) {
        return {
          success: false,
          error: "Bạn không có quyền ký hoặc đề xuất đã được xử lý.",
        };
      }

      // 2. Thực hiện cập nhật Database trong Transaction (Càng nhanh càng tốt)
      const updatedProposal = await prisma.$transaction(async (tx) => {
        // Cập nhật trạng thái người ký
        await tx.proposalSigner.update({
          where: { id: currentSigner.id },
          data: {
            status,
            signedAt: new Date(),
            reason: reason || null,
          },
        });

        // Nếu bị từ chối, cập nhật luôn trạng thái Proposal
        if (status === "rejected") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { status: "rejected" },
          });
        }

        // Lấy lại data tối thiểu để phục vụ logic gửi email tiếp theo
        return tx.proposal.findUnique({
          where: { id: proposalId },
          include: {
            proposer: { include: { contactInfo: true } },
            signers: { orderBy: { level: "asc" } },
            approvers: { orderBy: { level: "asc" } },
          },
        });
      });

      if (!updatedProposal) {
        return { success: false, error: "Lỗi khi cập nhật dữ liệu." };
      }

      // 3. XỬ LÝ HẬU KỲ (Gửi mail ngầm - KHÔNG DÙNG await ĐỂ TRÁNH TIMEOUT)
      // Tách riêng logic này để API trả kết quả cho người dùng ngay lập tức
      this.handleEmailNotifications(
        updatedProposal,
        status,
        employeeId,
        reason,
      ).catch((err) => console.error("Critical Email Background Error:", err));

      return {
        success: true,
        message:
          status === "approved"
            ? "Ký duyệt thành công."
            : "Đã từ chối đề xuất.",
      };
    } catch (error) {
      console.error("[ProposalService] ❌ signProposal error:", error);
      return { success: false, error: "Hệ thống gặp lỗi khi xử lý ký duyệt." };
    }
  }

  /**
   * Hàm hỗ trợ xử lý logic gửi mail chạy ngầm
   */
  private static async handleEmailNotifications(
    proposal: any,
    status: string,
    actorId: number,
    reason?: string,
  ) {
    // TRƯỜNG HỢP 1: Bị từ chối -> Gửi mail cho người tạo ngay
    if (status === "rejected") {
      const actor = proposal.signers.find((s: any) => s.signerId === actorId);
      sendWithRetry(() =>
        EmailService.sendProposalRejectedBySigner(
          proposal.proposer,
          proposal,
          actor,
          reason || "",
        ),
      ).catch((e) => console.error("Email rejected notify fail:", e));
      return;
    }

    // TRƯỜNG HỢP 2: Được duyệt -> Tìm người tiếp theo
    const nextSigner = proposal.signers.find(
      (s: any) => s.status === "pending",
    );

    if (nextSigner) {
      // Gửi mail cho người ký tiếp theo
      const signerInfo = await prisma.employee.findUnique({
        where: { id: nextSigner.signerId },
        select: this.FULL_EMPLOYEE_SELECT,
      });

      if (signerInfo) {
        const approveAction = generateActionToken({
          proposalId: proposal.id,
          actorId: signerInfo.id,
          role: "signer",
          action: "approve",
        });
        const rejectAction = generateActionToken({
          proposalId: proposal.id,
          actorId: signerInfo.id,
          role: "signer",
          action: "reject",
        });

        sendWithRetry(() =>
          EmailService.sendSignatureRequest(signerInfo, {
            ...proposal,
            approveLink: approveAction.directApi,
            rejectLink: rejectAction.directApi,
          }),
        ).catch((e) => console.error("Email next signer fail:", e));
      }
    } else {
      // Hết người ký -> Chuyển sang người duyệt (Approver) đầu tiên
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: "waiting_approval" },
      });

      const firstApprover = proposal.approvers.find(
        (a: any) => a.status === "pending",
      );
      if (firstApprover) {
        const approverInfo = await prisma.employee.findUnique({
          where: { id: firstApprover.approverId },
          select: this.FULL_EMPLOYEE_SELECT,
        });

        if (approverInfo) {
          const approveAction = generateActionToken({
            proposalId: proposal.id,
            actorId: approverInfo.id,
            role: "approver",
            action: "approve",
          });
          const rejectAction = generateActionToken({
            proposalId: proposal.id,
            actorId: approverInfo.id,
            role: "approver",
            action: "reject",
          });

          sendWithRetry(() =>
            EmailService.sendApprovalRequest(approverInfo, {
              ...proposal,
              approveLink: approveAction.directApi,
              rejectLink: rejectAction.directApi,
            }),
          ).catch((e) => console.error("Email first approver fail:", e));
        }
      }
    }
  }

  // -------------------- Approve proposal --------------------
  static async approveProposal(
    proposalId: number,
    employeeId: number,
    status: "approved" | "rejected",
    reason?: string,
  ) {
    try {
      // 1. Kiểm tra quyền duyệt nhanh (Chỉ lấy field cần thiết, không include bừa bãi)
      const currentApprover = await prisma.proposalApprover.findFirst({
        where: {
          proposalId,
          approverId: employeeId,
          status: "pending",
        },
      });

      if (!currentApprover) {
        return {
          success: false,
          error: "Bạn không có quyền duyệt hoặc đề xuất đã được xử lý.",
        };
      }

      // 2. Kiểm tra lượt duyệt (Level thấp nhất đang pending)
      const minPending = await prisma.proposalApprover.aggregate({
        where: { proposalId, status: "pending" },
        _min: { level: true },
      });

      if (currentApprover.level !== minPending._min.level) {
        return { success: false, error: "Chưa đến lượt duyệt của bạn." };
      }

      // 3. Thực hiện cập nhật Database nhanh trong Transaction
      const updated = await prisma.$transaction(async (tx) => {
        await tx.proposalApprover.update({
          where: { id: currentApprover.id },
          data: { status, approvedAt: new Date(), reason: reason || null },
        });

        if (status === "rejected") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { status: "rejected" },
          });
        }

        // Lấy data gọn nhẹ để xử lý email tiếp theo
        return tx.proposal.findUnique({
          where: { id: proposalId },
          include: {
            proposer: { include: { contactInfo: true } },
            approvers: { orderBy: { level: "asc" } },
          },
        });
      });

      if (!updated) return { success: false, error: "Lỗi đồng bộ dữ liệu." };

      // 4. CHẠY NGẦM THÔNG BÁO (Không dùng await)
      this.handleApprovalNotifications(
        updated,
        status,
        employeeId,
        reason,
      ).catch((err) =>
        console.error("Async Approval Notification Error:", err),
      );

      return {
        success: true,
        message:
          status === "approved"
            ? "Phê duyệt thành công."
            : "Đã từ chối đề xuất.",
      };
    } catch (error) {
      console.error("[ProposalService] ❌ approveProposal error:", error);
      return { success: false, error: "Lỗi hệ thống khi phê duyệt." };
    }
  }

  /**
   * Logic xử lý email ngầm cho Approver
   */
  private static async handleApprovalNotifications(
    proposal: any,
    status: string,
    actorId: number,
    reason?: string,
  ) {
    // TH1: Từ chối -> Báo ngay cho người tạo
    if (status === "rejected") {
      sendWithRetry(() =>
        EmailService.sendStatusUpdate(
          proposal.proposer,
          proposal,
          "rejected",
          reason || "",
        ),
      ).catch((e) => console.error("Email fail:", e));
      return;
    }

    // TH2: Chấp thuận -> Tìm người duyệt tiếp theo
    const nextApprover = proposal.approvers.find(
      (a: any) => a.status === "pending",
    );

    if (nextApprover) {
      const approverInfo = await prisma.employee.findUnique({
        where: { id: nextApprover.approverId },
        select: this.FULL_EMPLOYEE_SELECT,
      });

      if (approverInfo) {
        const approveAction = generateActionToken({
          proposalId: proposal.id,
          actorId: approverInfo.id,
          role: "approver",
          action: "approve",
        });
        const rejectAction = generateActionToken({
          proposalId: proposal.id,
          actorId: approverInfo.id,
          role: "approver",
          action: "reject",
        });

        sendWithRetry(() =>
          EmailService.sendApprovalRequest(approverInfo, {
            ...proposal,
            approveLink: approveAction.directApi,
            rejectLink: rejectAction.directApi,
          }),
        ).catch((e) => console.error("Email next approver fail:", e));
      }
    } else {
      // TH3: Không còn ai duyệt -> Đề xuất CHÍNH THỨC HOÀN TẤT
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: "approved" },
      });

      sendWithRetry(() =>
        EmailService.sendStatusUpdate(proposal.proposer, proposal, "approved"),
      ).catch((e) => console.error("Email final success fail:", e));
    }
  }

  // -------------------- Delete proposal --------------------
  static async deleteProposal(proposalId: number) {
    try {
      // 1. Kiểm tra sự tồn tại của đề xuất và lấy danh sách file kèm theo
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          files: true,
          signers: true,
          approvers: true,
        },
      });

      if (!proposal) {
        return {
          success: false,
          error: "Đề xuất không tìm thấy hoặc đã bị xóa trước đó.",
        };
      }

      // 2. Dọn dẹp dữ liệu file đính kèm
      // Vì Schema của bạn dùng onDelete: Cascade, các bản ghi trong bảng File sẽ tự mất khi Proposal mất.
      // Tuy nhiên, nếu FileService của bạn xử lý xóa file vật lý trên Disk, ta cần gọi nó.
      if (proposal.files && proposal.files.length > 0) {
        await Promise.all(
          proposal.files.map((file) => FileService.deleteFile(file.id)),
        );
      }

      // 3. Xóa Proposal
      // Do quan hệ Cascade trong Prisma: Signer, Approver và File record sẽ tự động bị xóa.
      await prisma.proposal.delete({
        where: { id: proposalId },
      });

      return {
        success: true,
        message: "Đề xuất đã được xóa thành công cùng các tài liệu đính kèm.",
      };
    } catch (error) {
      console.error("[ProposalService] ❌ deleteProposal error:", error);
      return { success: false, error: "Lỗi hệ thống khi xóa đề xuất." };
    }
  }
}
