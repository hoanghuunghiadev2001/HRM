/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CreateProposalFormData } from "@/components/api"
import { FileService } from "./file-service"
import { EmailService } from "./email-prososal-service"
import { prisma } from "./prisma"
import type { Prisma, Employee } from "../../generated/prisma/client"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export class ProposalService {
  /**
   * Tạo một đề xuất mới
   */
  static async createProposal(
    proposalData: CreateProposalFormData,
    file: File | null,
    createdById: number
  ) {
    try {
      let fileId: number | null = null
      let fileUrl: string | undefined

      // Validate và upload file
      if (file) {
        const { valid, error } = FileService.validateFile(file)
        if (!valid) return { success: false, error: error || "File không hợp lệ" }

        const uploadResult = await FileService.uploadFile(file)
        fileId = uploadResult.fileId
        fileUrl = `${baseUrl}/api/files/${fileId}`
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
      })

      // Gửi mail cho proposer
      await EmailService.sendProposalCreatedConfirmation(newProposal.proposer, {
        ...newProposal,
        fileUrl,
      })

      // Gửi mail cho signer đầu tiên
      const firstSigner = newProposal.signers
        .filter(s => s.status === "pending")
        .sort((a, b) => a.level - b.level)[0]

      if (firstSigner) {
        const signerInfo = await prisma.employee.findUnique({
          where: { id: firstSigner.signerId },
          include: this.getFullEmployeeInclude(),
        })
        if (signerInfo) {
          await EmailService.sendSignatureRequest(signerInfo, { ...newProposal, fileUrl })
        }
      }

      return { success: true, data: newProposal }
    } catch (error) {
      console.error("[ProposalService] Error creating proposal:", error)
      return { success: false, error: "Không thể tạo đề xuất" }
    }
  }


  /**
   * Lấy đề xuất
   */
  static async getProposal(proposalId: number, userId?: string) {

    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(), // gồm: signers, approvers, proposer, ...
      });

      if (!proposal) {
        return { success: false, error: "Không tìm thấy đề xuất" };
      }

      // Mặc định
      let statusSign = false;
      let statusApprove = false;

      // 🚨 Nếu có bất kỳ signer hoặc approver nào bị từ chối => dừng toàn bộ
      const isRejected =
        proposal.signers.some(s => s.status === "rejected") ||
        proposal.approvers.some(a => a.status === "rejected");

      if (!isRejected && userId) {
        // === 1️⃣ Xét quyền ký ===
        const signer = proposal.signers.find(s => String(s.signerId) === String(userId));
        if (signer) {
          // Tìm vị trí của signer này trong danh sách
          const signerIndex = proposal.signers.findIndex(
            s => String(s.signerId) === String(userId)
          );

          // Kiểm tra xem tất cả những người ký trước đã approved chưa
          const previousSignersApproved = proposal.signers
            .slice(0, signerIndex)
            .every(s => s.status === "approved");

          // Chỉ cho phép ký nếu:
          // - Người này đang ở trạng thái pending
          // - Tất cả những người trước đã approved
          statusSign = signer.status === "pending" && previousSignersApproved;
        }

        // === 2️⃣ Xét quyền duyệt ===
        const approver = proposal.approvers.find(a => String(a.approverId) === String(userId));
        if (approver) {
          // Tìm vị trí của approver này trong danh sách
          const approverIndex = proposal.approvers.findIndex(
            a => String(a.approverId) === String(userId)
          );

          // Kiểm tra xem tất cả người ký đã approved chưa
          const allSignersApproved = proposal.signers.every(s => s.status === "approved");

          // Kiểm tra xem những người duyệt trước đã approved chưa
          const previousApproversApproved = proposal.approvers
            .slice(0, approverIndex)
            .every(a => a.status === "approved");

          // Chỉ cho phép duyệt nếu:
          // - Tất cả signers đã approved
          // - Người này đang pending
          // - Tất cả những approver trước đã approved
          statusApprove =
            allSignersApproved &&
            approver.status === "pending" &&
            previousApproversApproved;
        }
      }

      // ✅ Trả về kết quả kèm theo cờ trạng thái
      return {
        success: true,
        data: {
          ...proposal,
          statusSign,
          statusApprove,
        },
      };
    } catch (error) {
      console.error("getProposal error:", error);
      return { success: false, error: "Lỗi khi lấy thông tin đề xuất" };
    }
  }



  /**
   * Ký đề xuất theo thứ tự signer
   */
  static async signProposal(
    proposalId: number,
    employeeId: number,
    status: "approved" | "rejected"
  ) {
    try {
      // 🔹 1. Lấy thông tin đề xuất kèm signer & approver
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(),
      });
      if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" };

      // 🔹 2. Kiểm tra người ký
      const signerEntry = proposal.signers.find(s => s.signerId === employeeId);
      if (!signerEntry)
        return { success: false, error: "Bạn không phải signer của đề xuất" };
      if (signerEntry.status !== "pending")
        return { success: false, error: "Bạn đã ký rồi" };

      // 🔹 3. Kiểm tra thứ tự ký
      const pendingSigners = proposal.signers.filter(s => s.status === "pending");
      const minPendingLevel = Math.min(...pendingSigners.map(s => s.level));
      if (signerEntry.level !== minPendingLevel)
        return { success: false, error: "Chưa đến lượt ký của bạn" };

      // 🔹 4. (Song song) Xử lý ký file nếu có fileId
      let filePromise: Promise<void> | undefined;
      if (status === "approved" && proposal.fileId !== null) {
        const fileId = proposal.fileId; // ✅ fileId kiểu number
        filePromise = (async () => {
          try {
            const signerInfo = await prisma.employee.findUnique({
              where: { id: employeeId },
            });
            if (!signerInfo) return;

            const fileData = await FileService.getFileData(fileId);
            if (!fileData) return;

            const signedBuffer = await this._applyDigitalSignatureToFile(
              fileId,
              signerInfo,
              "signer"
            );
            if (!signedBuffer) return;

            await FileService.updateFile(
              fileId,
              signedBuffer,
              fileData.mimeType,
              signedBuffer.length
            );
          } catch (err) {
            console.error("Error signing file:", err);
          }
        })();
      }

      // 🔹 5. Cập nhật trạng thái người ký
      await prisma.proposalSigner.update({
        where: { id: signerEntry.id },
        data: { status, signedAt: new Date() },
      });

      // 🔹 6. Lấy lại đề xuất sau khi ký
      const updatedProposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(),
      });
      if (!updatedProposal)
        return { success: false, error: "Không thể tải lại đề xuất sau khi ký" };

      const fileUrl = updatedProposal.file
        ? `${baseUrl}/api/files/${updatedProposal.file.id}`
        : undefined;

      const signerInfo = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: this.getFullEmployeeInclude(),
      });

      // 🔹 7. Nếu người ký từ chối
      if (status === "rejected") {
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "rejected" },
        });

        // Gửi mail báo từ chối — không chặn luồng
        void EmailService.sendProposalRejectedBySigner(
          updatedProposal.proposer,
          { ...updatedProposal, fileUrl },
          signerInfo?.name || "Người ký"
        );

        return {
          success: true,
          message: "Bạn đã từ chối đề xuất. Đề xuất bị từ chối.",
        };
      }

      // 🔹 8. Nếu người ký đồng ý
      const nextSigner = updatedProposal.signers
        .filter(s => s.status === "pending")
        .sort((a, b) => a.level - b.level)[0];

      if (nextSigner) {
        // Nếu còn signer kế tiếp → gửi mail mời ký
        const nextSignerInfo = await prisma.employee.findUnique({
          where: { id: nextSigner.signerId },
          include: this.getFullEmployeeInclude(),
        });
        if (nextSignerInfo) {
          void EmailService.sendSignatureRequest(
            nextSignerInfo,
            { ...updatedProposal, fileUrl }
          );
        }
      } else {
        // Hết signer → chuyển sang approver đầu tiên
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "waiting_approval" },
        });

        const firstApprover = updatedProposal.approvers
          .filter(a => a.status === "pending")
          .sort((a, b) => a.level - b.level)[0];

        if (firstApprover) {
          const approverInfo = await prisma.employee.findUnique({
            where: { id: firstApprover.approverId },
            include: this.getFullEmployeeInclude(),
          });
          if (approverInfo) {
            void EmailService.sendApprovalRequest(
              approverInfo,
              { ...updatedProposal, fileUrl }
            );
          }
        }
      }

      // 🔹 9. Đợi xử lý ký file xong (nếu có)
      if (filePromise) await filePromise;

      return { success: true, message: "Đã ký đề xuất." };
    } catch (error) {
      console.error("[ProposalService] Error signProposal:", error);
      return { success: false, error: "Không thể ký đề xuất" };
    }
  }




  /**
   * Phê duyệt đề xuất theo thứ tự approver
   */
  static async approveProposal(
    proposalId: number,
    employeeId: number,
    status: "approved" | "rejected"
  ) {
    try {
      // --- 1️⃣ Lấy đề xuất ---
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(),
      });

      if (!proposal)
        return { success: false, error: "Đề xuất không tìm thấy" };

      // --- 2️⃣ Kiểm tra quyền phê duyệt ---
      const approverEntry = proposal.approvers.find(
        (a) => a.approverId === employeeId
      );
      if (!approverEntry)
        return { success: false, error: "Bạn không phải người phê duyệt của đề xuất này" };
      if (approverEntry.status !== "pending")
        return { success: false, error: "Bạn đã phê duyệt hoặc từ chối rồi" };

      const pendingApprovers = proposal.approvers.filter(
        (a) => a.status === "pending"
      );
      const minPendingLevel = Math.min(...pendingApprovers.map((a) => a.level));

      if (approverEntry.level !== minPendingLevel)
        return { success: false, error: "Chưa đến lượt phê duyệt của bạn" };

      // --- 3️⃣ Xử lý file song song ---
      let filePromise: Promise<void> | undefined;
      if (status === "approved" && proposal.fileId !== null) {
        const fileId = proposal.fileId;
        filePromise = (async () => {
          try {
            const fileBuffer = await FileService.getFileBuffer(fileId);
            if (!fileBuffer) return;

            await FileService.updateFile(
              fileId,
              fileBuffer,
              proposal.file?.mimeType ?? "application/octet-stream",
              fileBuffer.length
            );
          } catch (err) {
            console.error("⚠️ File update failed:", err);
          }
        })();
      }

      // --- 4️⃣ Cập nhật trạng thái approver ngay ---
      await prisma.proposalApprover.update({
        where: { id: approverEntry.id },
        data: { status, approvedAt: new Date() },
      });

      // --- 5️⃣ Lấy lại proposal sau cập nhật ---
      const updatedProposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(),
      });

      if (!updatedProposal)
        return { success: false, error: "Không thể cập nhật trạng thái đề xuất" };

      const fileUrl = updatedProposal.file
        ? `${baseUrl}/api/files/${updatedProposal.file.id}`
        : undefined;

      // --- 6️⃣ Nếu bị từ chối ---
      if (status === "rejected") {
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "rejected" },
        });

        void EmailService.sendStatusUpdate(
          updatedProposal.proposer,
          { ...updatedProposal, fileUrl },
          "rejected"
        );

        if (filePromise) void filePromise; // không block
        return { success: true, message: "Đề xuất đã bị từ chối." };
      }

      // --- 7️⃣ Nếu được phê duyệt ---
      const nextApprover = updatedProposal.approvers
        .filter((a) => a.status === "pending")
        .sort((a, b) => a.level - b.level)[0];

      if (nextApprover) {
        // Có người phê duyệt tiếp theo
        const nextApproverInfo = await prisma.employee.findUnique({
          where: { id: nextApprover.approverId },
          include: this.getFullEmployeeInclude(),
        });

        if (nextApproverInfo) {
          void EmailService.sendApprovalRequest(
            nextApproverInfo,
            { ...updatedProposal, fileUrl }
          );
        }
      } else {
        // Hết approver → hoàn tất phê duyệt
        await prisma.proposal.update({
          where: { id: proposalId },
          data: { status: "approved" },
        });

        void EmailService.sendStatusUpdate(
          updatedProposal.proposer,
          { ...updatedProposal, fileUrl },
          "approved"
        );
      }

      // --- 8️⃣ Chờ xử lý file (nếu có) ---
      if (filePromise) await filePromise;

      return { success: true, message: "Đã phê duyệt đề xuất." };
    } catch (error) {
      console.error("[ProposalService] Error approveProposal:", error);
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

      // Xóa file nếu có
      if (proposal.fileId) {
        await FileService.deleteFile(proposal.fileId);
      }

      // Xóa signers
      await prisma.proposalSigner.deleteMany({ where: { proposalId } });

      // Xóa approvers
      await prisma.proposalApprover.deleteMany({ where: { proposalId } });

      // Xóa proposal
      await prisma.proposal.delete({ where: { id: proposalId } });

      // Có thể gửi email thông báo cho proposer
      // await EmailService.sendProposalDeleted(proposal.proposer, proposal);

      return { success: true, message: "Đề xuất đã được xóa." };
    } catch (error) {
      console.error("[ProposalService] Error deleteProposal:", error);
      return { success: false, error: "Không thể xóa đề xuất" };
    }
  }

  /**
   * Placeholder áp dụng chữ ký số
   */
  private static async _applyDigitalSignatureToFile(
    fileId: number,
    signerInfo: Employee,
    signatureType: "signer" | "approver"
  ): Promise<Buffer | null> {
    try {
      const fileBuffer = await FileService.getFileBuffer(fileId)
      if (!fileBuffer) return null
      console.log(`[Digital Signature] Placeholder signing for ${signerInfo.name} (${signatureType})`)
      return fileBuffer
    } catch (error) {
      console.error("[ProposalService] Error applying digital signature:", error)
      return null
    }
  }

  /**
   * Include đầy đủ cho Employee
   */
  static getFullEmployeeInclude(): Prisma.EmployeeInclude {
    return {
      contactInfo: true, // chứa email, phone, address
      workInfo: {
        include: {
          position: true,
          department: true,
        },
      },
      manager: {
        include: {
          contactInfo: true, // manager cũng có email
          workInfo: { include: { position: true, department: true } },
        },
      },
      subordinates: {
        include: {
          contactInfo: true,
          workInfo: { include: { position: true, department: true } },
        },
      },
    }
  }


  /**
   * Include object để lấy đầy đủ quan hệ proposal
   */
  static getFullIncludeObject() {
    return {
      file: true,
      proposer: {
        include: {
          contactInfo: true,
          workInfo: {
            include: { position: true, department: true },
          },
        },
      },
      createdBy: {
        include: {
          contactInfo: true,
          workInfo: {
            include: { position: true, department: true },
          },
        },
      },
      signers: {
        include: {
          signer: {
            include: {
              contactInfo: true,
              workInfo: {
                include: { position: true, department: true },
              },
            },
          },
        },
      },
      approvers: {
        include: {
          approver: {
            include: {
              contactInfo: true,
              workInfo: {
                include: { position: true, department: true },
              },
            },
          },
        },
      },
    }
  }

}
