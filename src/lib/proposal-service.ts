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
          proposer: true,
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
        include: this.getFullIncludeObject(),
      });
      if (!proposal) return { success: false, error: "Không tìm thấy đề xuất" };

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
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.FULL_PROPOSAL_INCLUDE,
      });
      if (!proposal) return { success: false, error: "Không tìm thấy đề xuất" };

      const signer = (proposal.signers || []).find(
        (s: any) => s.signerId === employeeId,
      );
      if (!signer)
        return { success: false, error: "Bạn không có quyền ký đề xuất này" };
      if (signer.status !== "pending")
        return { success: false, error: "Bạn đã xử lý đề xuất này rồi" };

      const updated = await prisma.$transaction(async (tx) => {
        await tx.proposalSigner.update({
          where: { id: signer.id },
          data: {
            status,
            signedAt: new Date(),
            reason: reason,
          },
        });
        if (status === "rejected")
          await tx.proposal.update({
            where: { id: proposalId },
            data: { status: "rejected" },
          });
        return tx.proposal.findUnique({
          where: { id: proposalId },
          include: this.FULL_PROPOSAL_INCLUDE,
        });
      });

      if (!updated)
        return { success: false, error: "Không thể tải lại đề xuất" };

      if (status === "rejected") {
        try {
          await sendWithRetry(() =>
            EmailService.sendProposalRejectedBySigner(
              updated.proposer,
              updated,
              signer,
              reason || "",
            ),
          );
        } catch (err) {
          console.error("Email notify proposer failed:", err);
        }
        return { success: true, message: "Đề xuất đã bị từ chối." };
      }

      const nextSigner = (updated.signers || [])
        .filter((s: any) => s.status === "pending")
        .sort((a: any, b: any) => a.level - b.level)[0];
      if (nextSigner) {
        const signerInfo = await prisma.employee.findUnique({
          where: { id: nextSigner.signerId },
          select: this.FULL_EMPLOYEE_SELECT,
        });
        if (signerInfo) {
          const approveAction = generateActionToken({
            proposalId: updated.id,
            actorId: signerInfo.id,
            role: "signer",
            action: "approve",
          });
          const rejectAction = generateActionToken({
            proposalId: updated.id,
            actorId: signerInfo.id,
            role: "signer",
            action: "reject",
          });
          try {
            await sendWithRetry(() =>
              EmailService.sendSignatureRequest(signerInfo, {
                ...updated,
                approveLink: approveAction.directApi,
                rejectLink: rejectAction.directApi,
              }),
            );
          } catch (err) {
            console.error("Email to next signer failed:", err);
          }
        }
      } else {
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "waiting_approval" },
        });
        const firstApprover = (updated.approvers || [])
          .filter((a: any) => a.status === "pending")
          .sort((a: any, b: any) => a.level - b.level)[0];
        if (firstApprover) {
          const approverInfo = await prisma.employee.findUnique({
            where: { id: firstApprover.approverId },
            select: this.FULL_EMPLOYEE_SELECT,
          });
          if (approverInfo) {
            const approveAction = generateActionToken({
              proposalId: updated.id,
              actorId: approverInfo.id,
              role: "approver",
              action: "approve",
            });
            const rejectAction = generateActionToken({
              proposalId: updated.id,
              actorId: approverInfo.id,
              role: "approver",
              action: "reject",
            });
            try {
              await sendWithRetry(() =>
                EmailService.sendApprovalRequest(approverInfo, {
                  ...updated,
                  approveLink: approveAction.directApi,
                  rejectLink: rejectAction.directApi,
                }),
              );
            } catch (err) {
              console.error("Email to first approver failed:", err);
            }
          }
        }
      }

      return { success: true, message: "Đã ký đề xuất thành công." };
    } catch (error) {
      console.error("[ProposalService] ❌ signProposal error:", error);
      return { success: false, error: "Không thể ký đề xuất" };
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
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.FULL_PROPOSAL_INCLUDE,
      });
      if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" };

      const approver = (proposal.approvers || []).find(
        (a: any) => a.approverId === employeeId,
      );
      if (!approver)
        return {
          success: false,
          error: "Bạn không có quyền duyệt đề xuất này",
        };
      if (approver.status !== "pending")
        return { success: false, error: "Bạn đã xử lý đề xuất này rồi" };

      const minPendingLevel = Math.min(
        ...(proposal.approvers || [])
          .filter((a: any) => a.status === "pending")
          .map((a: any) => a.level),
      );
      if (approver.level !== minPendingLevel)
        return { success: false, error: "Chưa đến lượt duyệt của bạn" };

      const now = new Date();
      const updatedProposal = await prisma.$transaction(async (tx) => {
        await tx.proposalApprover.update({
          where: { id: approver.id },
          data: { status, approvedAt: now, reason: reason || null },
        });
        if (status === "rejected")
          await tx.proposal.update({
            where: { id: proposalId },
            data: { status: "rejected" },
          });
        return tx.proposal.findUnique({
          where: { id: proposalId },
          include: this.FULL_PROPOSAL_INCLUDE,
        });
      });

      if (!updatedProposal)
        return { success: false, error: "Không thể tải lại đề xuất" };

      if (status === "rejected") {
        try {
          await sendWithRetry(() =>
            EmailService.sendStatusUpdate(
              updatedProposal.proposer,
              updatedProposal,
              "rejected",
              reason || "",
            ),
          );
        } catch (err) {
          console.error("Email notify rejected failed:", err);
        }
        return { success: true, message: "Đề xuất đã bị từ chối." };
      }

      const nextApprover = (updatedProposal.approvers || [])
        .filter((a: any) => a.status === "pending")
        .sort((a: any, b: any) => a.level - b.level)[0];
      if (nextApprover) {
        const approverInfo = await prisma.employee.findUnique({
          where: { id: nextApprover.approverId },
          select: this.FULL_EMPLOYEE_SELECT,
        });
        if (approverInfo) {
          const approveAction = generateActionToken({
            proposalId: updatedProposal.id,
            actorId: approverInfo.id,
            role: "approver",
            action: "approve",
          });
          const rejectAction = generateActionToken({
            proposalId: updatedProposal.id,
            actorId: approverInfo.id,
            role: "approver",
            action: "reject",
          });
          try {
            await sendWithRetry(() =>
              EmailService.sendApprovalRequest(approverInfo, {
                ...updatedProposal,
                approveLink: approveAction.directApi,
                rejectLink: rejectAction.directApi,
              }),
            );
          } catch (err) {
            console.error("Email to next approver failed:", err);
          }
        }
      } else {
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "approved" },
        });
        try {
          await sendWithRetry(() =>
            EmailService.sendStatusUpdate(
              updatedProposal.proposer,
              updatedProposal,
              "approved",
            ),
          );
        } catch (err) {
          console.error("Email notify approved failed:", err);
        }
      }

      return { success: true, message: "Đã phê duyệt đề xuất." };
    } catch (error) {
      console.error("[ProposalService] ❌ approveProposal error:", error);
      return { success: false, error: "Không thể phê duyệt đề xuất" };
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
