/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CreateProposalFormData } from "@/components/api";
import { FileService } from "./file-service";
import { EmailService } from "./email-prososal-service";
import { prisma } from "./prisma";
import type { Prisma, Employee } from "../../generated/prisma/client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
        include: this.getFullIncludeObject(),
      });

      const filePayload = fileUrl ? { fileUrl } : {};

      // Gửi email song song, không block API
      await Promise.allSettled([
        EmailService.sendProposalCreatedConfirmation(newProposal.proposer, {
          ...newProposal,
          ...filePayload,
        }),
        (async () => {
          const firstSigner = newProposal.signers
            .filter((s) => s.status === "pending")
            .sort((a, b) => a.level - b.level)[0];
          if (!firstSigner) return;

          const signerInfo = await prisma.employee.findUnique({
            where: { id: firstSigner.signerId },
            include: this.getFullEmployeeInclude(),
          });
          if (signerInfo) {
            await EmailService.sendSignatureRequest(signerInfo, {
              ...newProposal,
              ...filePayload,
            });
          }
        })(),
      ]);

      return { success: true, data: newProposal };
    } catch (error) {
      console.error("[ProposalService] ❌ createProposal error:", error);
      return { success: false, error: "Không thể tạo đề xuất" };
    }
  }

  /**
   * 🟩 Lấy đề xuất chi tiết
   */
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
  // static async signProposal(
  //   proposalId: number,
  //   employeeId: number,
  //   status: "approved" | "rejected"
  // ) {
  //   try {
  //     const proposal = await prisma.proposal.findUnique({
  //       where: { id: proposalId },
  //       include: { signers: true, approvers: true, proposer: true, file: true },
  //     });
  //     if (!proposal) return { success: false, error: "Không tìm thấy đề xuất" };

  //     const signer = proposal.signers.find((s) => s.signerId === employeeId);
  //     if (!signer)
  //       return { success: false, error: "Bạn không có quyền ký đề xuất này" };
  //     if (signer.status !== "pending")
  //       return { success: false, error: "Bạn đã xử lý đề xuất này rồi" };

  //     const minLevel = Math.min(
  //       ...proposal.signers
  //         .filter((s) => s.status === "pending")
  //         .map((s) => s.level)
  //     );
  //     if (signer.level !== minLevel)
  //       return { success: false, error: "Chưa đến lượt ký của bạn" };

  //     await prisma.proposalSigner.update({
  //       where: { id: signer.id },
  //       data: { status, signedAt: new Date() },
  //     });

  //     const updated = await prisma.proposal.findUnique({
  //       where: { id: proposalId },
  //       include: { signers: true, approvers: true, proposer: true, file: true },
  //     });
  //     if (!updated)
  //       return { success: false, error: "Không thể cập nhật đề xuất" };

  //     const fileUrl = updated.file
  //       ? `${baseUrl}/api/files/${updated.file.id}`
  //       : undefined;

  //     if (status === "rejected") {
  //       await prisma.proposal.update({
  //         where: { id: proposalId },
  //         data: { status: "rejected" },
  //       });
  //       void EmailService.sendProposalRejectedBySigner(
  //         updated.proposer,
  //         updated,
  //         "Người ký"
  //       );
  //       return { success: true, message: "Đề xuất đã bị từ chối." };
  //     }

  //     const nextSigner = updated.signers
  //       .filter((s) => s.status === "pending")
  //       .sort((a, b) => a.level - b.level)[0];
  //     if (nextSigner) {
  //       const signerInfo = await prisma.employee.findUnique({
  //         where: { id: nextSigner.signerId },
  //         include: this.getFullEmployeeInclude(),
  //       });
  //       if (signerInfo)
  //         void EmailService.sendSignatureRequest(signerInfo, updated);
  //     } else {
  //       await prisma.proposal.update({
  //         where: { id: proposalId },
  //         data: { status: "waiting_approval" },
  //       });
  //       const firstApprover = updated.approvers
  //         .filter((a) => a.status === "pending")
  //         .sort((a, b) => a.level - b.level)[0];
  //       if (firstApprover) {
  //         const approverInfo = await prisma.employee.findUnique({
  //           where: { id: firstApprover.approverId },
  //           include: this.getFullEmployeeInclude(),
  //         });
  //         if (approverInfo)
  //           void EmailService.sendApprovalRequest(approverInfo, updated);
  //       }
  //     }

  //     return { success: true, message: "Đã ký đề xuất thành công." };
  //   } catch (error) {
  //     console.error("[ProposalService] ❌ signProposal error:", error);
  //     return { success: false, error: "Không thể ký đề xuất" };
  //   }
  // }

  static getFullProposalInclude() {
    return {
      file: true,
      proposer: {
        include: this.getFullEmployeeInclude(),
      },
      approvers: {
        include: {
          approver: {
            include: this.getFullEmployeeInclude(),
          },
        },
      },
      signers: {
        include: {
          signer: {
            include: this.getFullEmployeeInclude(),
          },
        },
      },
    };
  }

  static async signProposal(
    proposalId: number,
    employeeId: number,
    status: "approved" | "rejected"
  ) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullProposalInclude(),
      });
      if (!proposal) return { success: false, error: "Không tìm thấy đề xuất" };

      const signer = proposal.signers.find((s) => s.signerId === employeeId);
      if (!signer)
        return { success: false, error: "Bạn không có quyền ký đề xuất này" };
      if (signer.status !== "pending")
        return { success: false, error: "Bạn đã xử lý đề xuất này rồi" };

      // Transaction + load updated proposal trong cùng lần
      const updated = await prisma.$transaction(async (tx) => {
        await tx.proposalSigner.update({
          where: { id: signer.id },
          data: { status, signedAt: new Date() },
        });

        if (status === "rejected") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { status: "rejected" },
          });
        }

        return tx.proposal.findUnique({
          where: { id: proposalId },
          include: this.getFullProposalInclude(),
        });
      });

      if (!updated)
        return { success: false, error: "Không thể tải lại đề xuất" };

      // Gửi email async, không chặn luồng
      if (status === "rejected") {
        Promise.resolve().then(() =>
          EmailService.sendProposalRejectedBySigner(
            updated.proposer,
            updated,
            "Người ký"
          )
        );
        return { success: true, message: "Đề xuất đã bị từ chối." };
      }

      // Ký thành công
      const nextSigner = updated.signers
        .filter((s) => s.status === "pending")
        .sort((a, b) => a.level - b.level)[0];

      if (nextSigner) {
        Promise.resolve().then(async () => {
          const signerInfo = await prisma.employee.findUnique({
            where: { id: nextSigner.signerId },
            include: this.getFullEmployeeInclude(),
          });
          if (signerInfo)
            await EmailService.sendSignatureRequest(signerInfo, updated);
        });
      } else {
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "waiting_approval" },
        });
        Promise.resolve().then(async () => {
          const firstApprover = updated.approvers
            .filter((a) => a.status === "pending")
            .sort((a, b) => a.level - b.level)[0];
          if (firstApprover) {
            const approverInfo = await prisma.employee.findUnique({
              where: { id: firstApprover.approverId },
              include: this.getFullEmployeeInclude(),
            });
            if (approverInfo)
              await EmailService.sendApprovalRequest(approverInfo, updated);
          }
        });
      }

      console.timeEnd("signProposal");
      return { success: true, message: "Đã ký đề xuất thành công." };
    } catch (error) {
      console.error("[ProposalService] ❌ signProposal error:", error);
      return { success: false, error: "Không thể ký đề xuất" };
    }
  }
  /**
   * 🟩 Phê duyệt đề xuất
   */
  // static async approveProposal(
  //   proposalId: number,
  //   employeeId: number,
  //   status: "approved" | "rejected"
  // ) {
  //   try {
  //     const proposal = await prisma.proposal.findUnique({
  //       where: { id: proposalId },
  //       include: this.getFullIncludeObject(),
  //     });
  //     if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" };

  //     const approver = proposal.approvers.find(
  //       (a) => a.approverId === employeeId
  //     );
  //     if (!approver)
  //       return {
  //         success: false,
  //         error: "Bạn không có quyền duyệt đề xuất này",
  //       };
  //     if (approver.status !== "pending")
  //       return { success: false, error: "Bạn đã xử lý đề xuất này rồi" };

  //     const minLevel = Math.min(
  //       ...proposal.approvers
  //         .filter((a) => a.status === "pending")
  //         .map((a) => a.level)
  //     );
  //     if (approver.level !== minLevel)
  //       return { success: false, error: "Chưa đến lượt duyệt của bạn" };

  //     // 🟩 Cập nhật trạng thái người duyệt hiện tại
  //     await prisma.proposalApprover.update({
  //       where: { id: approver.id },
  //       data: { status, approvedAt: new Date() },
  //     });

  //     // 🟨 Nếu bị từ chối → cập nhật trạng thái tổng và gửi mail
  //     if (status === "rejected") {
  //       await prisma.proposal.update({
  //         where: { id: proposalId },
  //         data: { status: "rejected" },
  //       });
  //       void EmailService.sendStatusUpdate(
  //         proposal.proposer,
  //         proposal,
  //         "rejected"
  //       );
  //       return { success: true, message: "Đề xuất đã bị từ chối." };
  //     }

  //     // 🟩 Lấy lại dữ liệu mới nhất (đã cập nhật trạng thái người duyệt)
  //     const updatedProposal = await prisma.proposal.findUnique({
  //       where: { id: proposalId },
  //       include: this.getFullIncludeObject(),
  //     });
  //     if (!updatedProposal)
  //       return {
  //         success: false,
  //         error: "Không thể tải lại đề xuất sau khi cập nhật",
  //       };

  //     // 🟢 Kiểm tra còn người duyệt nào chưa duyệt không
  //     const nextApprover = updatedProposal.approvers
  //       .filter((a) => a.status === "pending")
  //       .sort((a, b) => a.level - b.level)[0];

  //     if (nextApprover) {
  //       // 🟡 Gửi mail yêu cầu duyệt tiếp
  //       const approverInfo = await prisma.employee.findUnique({
  //         where: { id: nextApprover.approverId },
  //         include: this.getFullEmployeeInclude(),
  //       });
  //       if (approverInfo) {
  //         void EmailService.sendApprovalRequest(approverInfo, updatedProposal);
  //       }
  //     } else {
  //       // 🟢 Không còn ai pending → cập nhật trạng thái đề xuất sang “approved” và gửi mail thông báo hoàn tất
  //       await prisma.proposal.update({
  //         where: { id: proposalId },
  //         data: { status: "approved" },
  //       });
  //       void EmailService.sendStatusUpdate(
  //         updatedProposal.proposer,
  //         updatedProposal,
  //         "approved"
  //       );
  //     }

  //     return { success: true, message: "Đã phê duyệt đề xuất." };
  //   } catch (error) {
  //     console.error("[ProposalService] ❌ approveProposal error:", error);
  //     return { success: false, error: "Không thể phê duyệt đề xuất" };
  //   }
  // }

  static FULL_PROPOSAL_INCLUDE = {
    file: true,
    proposer: {
      include: {
        contactInfo: true, // <-- thêm
        workInfo: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    },
    approvers: {
      include: {
        approver: {
          include: {
            contactInfo: true, // <-- thêm
            workInfo: { include: { department: true, position: true } },
          },
        },
      },
    },
    signers: {
      include: {
        signer: {
          include: {
            contactInfo: true, // <-- thêm
            workInfo: { include: { department: true, position: true } },
          },
        },
      },
    },
  };

  static FULL_EMPLOYEE_INCLUDE = {
    contactInfo: true, // <-- thêm
    workInfo: {
      include: {
        department: true,
        position: true,
      },
    },
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

  static async approveProposal(
    proposalId: number,
    employeeId: number,
    status: "approved" | "rejected"
  ) {
    try {
      // 🟩 Lấy đề xuất và người duyệt
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.FULL_PROPOSAL_INCLUDE,
      });

      if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" };

      const approver = proposal.approvers.find(
        (a: { approverId: number }) => a.approverId === employeeId
      );
      if (!approver)
        return {
          success: false,
          error: "Bạn không có quyền duyệt đề xuất này",
        };

      if (approver.status !== "pending")
        return { success: false, error: "Bạn đã xử lý đề xuất này rồi" };

      // 🟨 Kiểm tra thứ tự duyệt
      const minPendingLevel = Math.min(
        ...proposal.approvers
          .filter((a: { status: string }) => a.status === "pending")
          .map((a: { level: any }) => a.level)
      );

      if (approver.level !== minPendingLevel)
        return { success: false, error: "Chưa đến lượt duyệt của bạn" };

      // 🧩 Transaction: cập nhật trạng thái người duyệt và (nếu cần) đề xuất
      const now = new Date();

      await prisma.$transaction(async (tx) => {
        await tx.proposalApprover.update({
          where: { id: approver.id },
          data: { status, approvedAt: now },
        });

        if (status === "rejected") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { status: "rejected" },
          });
        }
      });

      // 🟨 Nếu bị từ chối → gửi mail và kết thúc nhanh
      if (status === "rejected") {
        setTimeout(() => {
          EmailService.sendStatusUpdate(
            proposal.proposer,
            proposal,
            "rejected"
          ).catch((err) => console.error("[Mail error]", err));
        }, 100);

        return { success: true, message: "Đề xuất đã bị từ chối." };
      }

      // 🟩 Lấy lại dữ liệu mới nhất (đã cập nhật duyệt)
      const updatedProposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.FULL_PROPOSAL_INCLUDE,
      });

      if (!updatedProposal)
        return {
          success: false,
          error: "Không thể tải lại đề xuất sau khi cập nhật",
        };

      // 🟢 Kiểm tra người duyệt tiếp theo
      const nextApprover = updatedProposal.approvers
        .filter((a: { status: string }) => a.status === "pending")
        .sort(
          (a: { level: number }, b: { level: number }) => a.level - b.level
        )[0];

      if (nextApprover) {
        // 🟡 Gửi mail yêu cầu duyệt kế tiếp (nền)
        const approverInfo = await prisma.employee.findUnique({
          where: { id: nextApprover.approverId },
          include: this.FULL_EMPLOYEE_INCLUDE,
        });

        if (approverInfo) {
          setTimeout(() => {
            EmailService.sendApprovalRequest(
              approverInfo,
              updatedProposal
            ).catch((err) => console.error("[Mail error]", err));
          }, 100);
        }
      } else {
        // 🟢 Không còn ai pending → duyệt xong toàn bộ
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "approved" },
        });

        setTimeout(() => {
          EmailService.sendStatusUpdate(
            updatedProposal.proposer,
            updatedProposal,
            "approved"
          ).catch((err) => console.error("[Mail error]", err));
        }, 100);
      }

      return { success: true, message: "Đã phê duyệt đề xuất." };
    } catch (error) {
      console.error("[ProposalService] ❌ approveProposal error:", error);
      return { success: false, error: "Không thể phê duyệt đề xuất" };
    }
  }

  /**
   * 🟩 Xóa đề xuất
   */
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

  /** Include cấu hình Employee đầy đủ */
  static getFullEmployeeInclude(): Prisma.EmployeeInclude {
    return {
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
  }

  /** Include cấu hình Proposal đầy đủ */
  static getFullIncludeObject() {
    return {
      file: { select: { id: true, filename: true, mimeType: true } },
      proposer: {
        include: {
          contactInfo: true,
          workInfo: { include: { position: true, department: true } },
        },
      },
      signers: {
        include: {
          signer: {
            include: {
              contactInfo: true,
              workInfo: { include: { position: true, department: true } },
            },
          },
        },
      },
      approvers: {
        include: {
          approver: {
            include: {
              contactInfo: true,
              workInfo: { include: { position: true, department: true } },
            },
          },
        },
      },
    };
  }
}
