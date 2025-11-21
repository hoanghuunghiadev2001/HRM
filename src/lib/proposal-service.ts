/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CreateProposalFormData } from "@/components/api";
import { FileService } from "./file-service";
import { EmailService } from "./email-prososal-service";
import { prisma } from "./prisma";
import type { Prisma } from "../../generated/prisma/client";
import { generateActionToken } from "@/utils/actionLink";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function sendWithRetry(
  fn: () => Promise<any>,
  retries = 3,
  delay = 1000
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
   * 🟩 Tạo đề xuất mới
   */
  static async createProposal(
    proposalData: CreateProposalFormData,
    file: File | null,
    createdById: number
  ) {
    try {
      let fileId: number | null = null;
      let fileUrl: string | undefined;

      // Upload file nếu có
      if (file) {
        const { valid, error } = FileService.validateFile(file);
        if (!valid)
          return { success: false, error: error || "File không hợp lệ" };

        const { fileId: uploadedId } = await FileService.uploadFile(file);
        fileId = uploadedId;
        fileUrl = `${baseUrl}/api/files/${fileId}`;
      }

      // Tạo proposal
      const newProposal = await prisma.proposal.create({
        data: {
          name: proposalData.name,
          title: proposalData.title,
          description: proposalData.description,
          proposerId: proposalData.proposerId,
          createdById,
          fileId,
          proposalType: proposalData.proposalType || "REGULAR",
          vehicleId: proposalData.vehicleId || null,
          startAt: proposalData.startAt || null,
          endAt: proposalData.endAt || null,
          dropoffPlace: proposalData.dropoffPlace || null,
          signers: {
            create: proposalData.signerIds.map((id, idx) => ({
              level: idx + 1,
              status: "pending",
              signer: { connect: { id } },
            })),
          },
          approvers: {
            create: proposalData.approverIds.map((id, idx) => ({
              level: idx + 1,
              status: "pending",
              approver: { connect: { id } },
            })),
          },
        },
        include: this.FULL_PROPOSAL_INCLUDE,
      });

      const filePayload = fileUrl ? { fileUrl } : {};

      // Gửi email xác nhận cho người tạo
      await sendWithRetry(() =>
        EmailService.sendProposalCreatedConfirmation(newProposal.proposer, {
          ...newProposal,
          ...filePayload,
        })
      );

      // Gửi email cho signer đầu tiên
      const firstSigner = newProposal.signers
        .filter((s) => s.status === "pending")
        .sort((a, b) => a.level - b.level)[0];

      if (firstSigner) {
        const signerInfo = await prisma.employee.findUnique({
          where: { id: firstSigner.signerId },
          include: this.FULL_EMPLOYEE_INCLUDE,
        });

        if (signerInfo) {
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

          await sendWithRetry(() =>
            EmailService.sendSignatureRequest(signerInfo, {
              ...newProposal,
              ...filePayload,
              approveLink: approveAction.directApi,
              rejectLink: rejectAction.directApi,
            })
          );
        }
      }

      return { success: true, data: newProposal };
    } catch (error) {
      console.error("[ProposalService] ❌ createProposal error:", error);
      return { success: false, error: "Không thể tạo đề xuất" };
    }
  }

  static async getProposal(proposalId: number, userId?: string) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(),
      });
      if (!proposal) return { success: false, error: "Không tìm thấy đề xuất" };

      const sortedSigners = proposal.signers.sort((a, b) => a.level - b.level);
      const sortedApprovers = proposal.approvers.sort(
        (a, b) => a.level - b.level
      );

      const isRejected =
        sortedSigners.some((s) => s.status === "rejected") ||
        sortedApprovers.some((a) => a.status === "rejected");

      const nextSignerIndex = !isRejected
        ? sortedSigners.findIndex(
            (s, idx) =>
              s.status === "pending" &&
              sortedSigners.slice(0, idx).every((p) => p.status === "approved")
          )
        : -1;

      const allSignersApproved = sortedSigners.every(
        (s) => s.status === "approved"
      );
      const nextApproverIndex =
        !isRejected && allSignersApproved
          ? sortedApprovers.findIndex(
              (a, idx) =>
                a.status === "pending" &&
                sortedApprovers
                  .slice(0, idx)
                  .every((p) => p.status === "approved")
            )
          : -1;

      const signers = sortedSigners.map((s, i) => ({
        ...s,
        isCurrent: i === nextSignerIndex,
      }));
      const approvers = sortedApprovers.map((a, i) => ({
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
        (s) => s.isCurrent && String(s.signerId) === String(userId)
      );
      const statusApprove = approvers.some(
        (a) => a.isCurrent && String(a.approverId) === String(userId)
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

  /**
   * 🟩 Ký đề xuất
   */
  static async signProposal(
    proposalId: number,
    employeeId: number,
    status: "approved" | "rejected",
    reason?: string
  ) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.FULL_PROPOSAL_INCLUDE,
      });
      if (!proposal) return { success: false, error: "Không tìm thấy đề xuất" };

      const signer = proposal.signers.find((s) => s.signerId === employeeId);
      if (!signer)
        return { success: false, error: "Bạn không có quyền ký đề xuất này" };
      if (signer.status !== "pending")
        return { success: false, error: "Bạn đã xử lý đề xuất này rồi" };

      const updated = await prisma.$transaction(async (tx) => {
        // Cập nhật trạng thái + signedAt + reason nếu từ chối
        await tx.proposalSigner.update({
          where: { id: signer.id },
          data: {
            status,
            signedAt: new Date(),
            reason: status === "rejected" ? reason : null,
          },
        });

        // Nếu bị từ chối → đổi status proposal
        if (status === "rejected") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { status: "rejected" },
          });
        }

        return tx.proposal.findUnique({
          where: { id: proposalId },
          include: this.FULL_PROPOSAL_INCLUDE,
        });
      });

      if (!updated)
        return { success: false, error: "Không thể tải lại đề xuất" };

      // Nếu bị từ chối
      if (status === "rejected") {
        await sendWithRetry(() =>
          EmailService.sendProposalRejectedBySigner(
            updated.proposer,
            updated,
            signer,
            reason || "" // <-- gửi kèm lý do
          )
        );
        return { success: true, message: "Đề xuất đã bị từ chối." };
      }

      // Người ký tiếp theo
      const nextSigner = updated.signers
        .filter((s) => s.status === "pending")
        .sort((a, b) => a.level - b.level)[0];

      if (nextSigner) {
        const signerInfo = await prisma.employee.findUnique({
          where: { id: nextSigner.signerId },
          include: this.FULL_EMPLOYEE_INCLUDE,
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

          await sendWithRetry(() =>
            EmailService.sendSignatureRequest(signerInfo, {
              ...updated,
              approveLink: approveAction.directApi,
              rejectLink: rejectAction.directApi,
            })
          );
        }
      } else {
        // Hết người ký → chuyển sang phê duyệt
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "waiting_approval" },
        });

        const firstApprover = updated.approvers
          .filter((a) => a.status === "pending")
          .sort((a, b) => a.level - b.level)[0];

        if (firstApprover) {
          const approverInfo = await prisma.employee.findUnique({
            where: { id: firstApprover.approverId },
            include: this.FULL_EMPLOYEE_INCLUDE,
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

            await sendWithRetry(() =>
              EmailService.sendApprovalRequest(approverInfo, {
                ...updated,
                approveLink: approveAction.directApi,
                rejectLink: rejectAction.directApi,
              })
            );
          }
        }
      }

      return { success: true, message: "Đã ký đề xuất thành công." };
    } catch (error) {
      console.error("[ProposalService] ❌ signProposal error:", error);
      return { success: false, error: "Không thể ký đề xuất" };
    }
  }

  /**
   * 🟩 Phê duyệt đề xuất
   */
  static async approveProposal(
    proposalId: number,
    employeeId: number,
    status: "approved" | "rejected",
    reason?: string
  ) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.FULL_PROPOSAL_INCLUDE,
      });
      if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" };

      const approver = proposal.approvers.find(
        (a) => a.approverId === employeeId
      );
      if (!approver)
        return {
          success: false,
          error: "Bạn không có quyền duyệt đề xuất này",
        };
      if (approver.status !== "pending")
        return { success: false, error: "Bạn đã xử lý đề xuất này rồi" };

      const minPendingLevel = Math.min(
        ...proposal.approvers
          .filter((a) => a.status === "pending")
          .map((a) => a.level)
      );

      if (approver.level !== minPendingLevel)
        return { success: false, error: "Chưa đến lượt duyệt của bạn" };

      const now = new Date();

      const updatedProposal = await prisma.$transaction(async (tx) => {
        await tx.proposalApprover.update({
          where: { id: approver.id },
          data: { status, approvedAt: now, reason: reason || null },
        });

        if (status === "rejected") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { status: "rejected" },
          });
        }

        return tx.proposal.findUnique({
          where: { id: proposalId },
          include: this.FULL_PROPOSAL_INCLUDE,
        });
      });

      if (!updatedProposal)
        return { success: false, error: "Không thể tải lại đề xuất" };

      // Nếu bị từ chối
      if (status === "rejected") {
        await sendWithRetry(() =>
          EmailService.sendStatusUpdate(
            updatedProposal.proposer,
            updatedProposal,
            "rejected",
            reason || "" // Gửi kèm lý do
          )
        );
        return { success: true, message: "Đề xuất đã bị từ chối." };
      }

      // Lấy người duyệt tiếp theo
      const nextApprover = updatedProposal.approvers
        .filter((a) => a.status === "pending")
        .sort((a, b) => a.level - b.level)[0];

      if (nextApprover) {
        const approverInfo = await prisma.employee.findUnique({
          where: { id: nextApprover.approverId },
          include: this.FULL_EMPLOYEE_INCLUDE,
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

          await sendWithRetry(() =>
            EmailService.sendApprovalRequest(approverInfo, {
              ...updatedProposal,
              approveLink: approveAction.directApi,
              rejectLink: rejectAction.directApi,
            })
          );
        }
      } else {
        // Duyệt xong hết → approved
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "approved" },
        });

        await sendWithRetry(() =>
          EmailService.sendStatusUpdate(
            updatedProposal.proposer,
            updatedProposal,
            "approved"
          )
        );
      }

      return { success: true, message: "Đã phê duyệt đề xuất." };
    } catch (error) {
      console.error("[ProposalService] ❌ approveProposal error:", error);
      return { success: false, error: "Không thể phê duyệt đề xuất" };
    }
  }

  static async deleteProposal(proposalId: number) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: { file: true, proposer: true },
      });
      if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" };

      await Promise.all([
        proposal.fileId ? FileService.deleteFile(proposal.fileId) : null,
        prisma.proposalSigner.deleteMany({ where: { proposalId } }),
        prisma.proposalApprover.deleteMany({ where: { proposalId } }),
      ]);

      await prisma.proposal.delete({ where: { id: proposalId } });
      return { success: true, message: "Đề xuất đã được xóa." };
    } catch (error) {
      console.error("[ProposalService] ❌ deleteProposal error:", error);
      return { success: false, error: "Không thể xóa đề xuất" };
    }
  }

  static getFullIncludeObject() {
    return this.FULL_PROPOSAL_INCLUDE;
  }

  /** FULL INCLUDE cấu hình */
  static FULL_EMPLOYEE_INCLUDE: Prisma.EmployeeInclude = {
    contactInfo: true,
    workInfo: { include: { position: true, department: true } },
    manager: {
      include: {
        contactInfo: true,
        workInfo: { include: { position: true, department: true } },
      },
    },
    subordinates: {
      include: {
        contactInfo: true,
        workInfo: { include: { position: true, department: true } },
      },
    },
  };

  static FULL_PROPOSAL_INCLUDE: Prisma.ProposalInclude = {
    file: true,
    vehicle: true, // thêm vehicle info
    proposer: { include: this.FULL_EMPLOYEE_INCLUDE },
    createdBy: { include: this.FULL_EMPLOYEE_INCLUDE }, // thêm createdBy
    signers: {
      include: { signer: { include: this.FULL_EMPLOYEE_INCLUDE } },
    },
    approvers: {
      include: { approver: { include: this.FULL_EMPLOYEE_INCLUDE } },
    },
  };
}
