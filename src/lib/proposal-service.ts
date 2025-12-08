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
    file: true,
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
    file: File | null,
    createdById: number
  ) {
    try {
      let fileId: number | null = null;
      let fileUrl: string | undefined;

      if (file) {
        const { valid, error } = FileService.validateFile(file);
        if (!valid)
          return { success: false, error: error || "File không hợp lệ" };

        const { fileId: uploadedId } = await FileService.uploadFile(file);
        fileId = uploadedId;
        fileUrl = `${baseUrl}/api/files/${fileId}`;
      }

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

      // send confirmation to proposer (best-effort)
      try {
        await sendWithRetry(() =>
          EmailService.sendProposalCreatedConfirmation(newProposal.proposer, {
            ...newProposal,
            ...filePayload,
          })
        );
      } catch (err) {
        console.error("Email xác nhận proposer thất bại:", err);
      }

      // notify first signer
      const firstSigner = (newProposal.signers || [])
        .filter((s: any) => s.status === "pending")
        .sort((a: any, b: any) => a.level - b.level)[0];

      if (firstSigner) {
        const signerInfo = await prisma.employee.findUnique({
          where: { id: firstSigner.signerId },
          select: this.FULL_EMPLOYEE_SELECT,
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

          try {
            await sendWithRetry(() =>
              EmailService.sendSignatureRequest(signerInfo, {
                ...newProposal,
                ...filePayload,
                approveLink: approveAction.directApi,
                rejectLink: rejectAction.directApi,
              })
            );
          } catch (err) {
            console.error("Email gửi signer thất bại:", err);
          }
        }
      }

      return { success: true, data: newProposal };
    } catch (error) {
      console.error("[ProposalService] ❌ createProposal error:", error);
      return { success: false, error: "Không thể tạo đề xuất" };
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
                .every((p: any) => p.status === "approved")
          )
        : -1;

      const allSignersApproved = sortedSigners.every(
        (s: any) => s.status === "approved"
      );
      const nextApproverIndex =
        !isRejected && allSignersApproved
          ? sortedApprovers.findIndex(
              (a: any, idx: number) =>
                a.status === "pending" &&
                sortedApprovers
                  .slice(0, idx)
                  .every((p: any) => p.status === "approved")
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
        (s: any) => s.isCurrent && String(s.signerId) === String(userId)
      );
      const statusApprove = approvers.some(
        (a: any) => a.isCurrent && String(a.approverId) === String(userId)
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
    reason?: string
  ) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.FULL_PROPOSAL_INCLUDE,
      });
      if (!proposal) return { success: false, error: "Không tìm thấy đề xuất" };

      const signer = (proposal.signers || []).find(
        (s: any) => s.signerId === employeeId
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
            reason: status === "rejected" ? reason : null,
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
              reason || ""
            )
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
              })
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
                })
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
    reason?: string
  ) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.FULL_PROPOSAL_INCLUDE,
      });
      if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" };

      const approver = (proposal.approvers || []).find(
        (a: any) => a.approverId === employeeId
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
          .map((a: any) => a.level)
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
              reason || ""
            )
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
              })
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
              "approved"
            )
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
}
