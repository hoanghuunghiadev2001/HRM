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
  console.log("emp: " + userId);

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: this.getFullIncludeObject(), // signers, approvers, proposer...
    });

    if (!proposal) return { success: false, error: "Không tìm thấy đề xuất" };

    let statusSign = false;
    let statusApprove = false;

    // 🚨 Nếu có bất kỳ signer hoặc approver nào từ chối => dừng, gán false hết
    const isRejected =
      proposal.signers.some(s => s.status === "rejected") ||
      proposal.approvers.some(a => a.status === "rejected");

    if (!isRejected && userId) {
      // Chỉ xét signer nếu user thực sự là signer
      const signer = proposal.signers.find(s => String(s.signerId) === userId);
      if (signer) {
        const previousSignersApproved = proposal.signers
          .slice(0, proposal.signers.indexOf(signer))
          .every(s => s.status === "approved");
        statusSign = signer.status === "pending" && previousSignersApproved;
      }

      // Chỉ xét approver nếu user thực sự là approver
      const approver = proposal.approvers.find(a => String(a.approverId) === userId);
      if (approver) {
        const allSignersApproved = proposal.signers.every(s => s.status === "approved");
        const previousApproversApproved = proposal.approvers
          .slice(0, proposal.approvers.indexOf(approver))
          .every(a => a.status === "approved");
        statusApprove =
          allSignersApproved &&
          approver.status === "pending" &&
          previousApproversApproved;
      }
    }

    return { success: true, data: { ...proposal, statusSign, statusApprove } };
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
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: this.getFullIncludeObject(),
    });
    if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" };

    const signerEntry = proposal.signers.find(s => s.signerId === employeeId);
    if (!signerEntry) return { success: false, error: "Bạn không phải signer của đề xuất" };
    if (signerEntry.status !== "pending") return { success: false, error: "Bạn đã ký rồi" };

    // Kiểm tra thứ tự ký
    const minPendingLevel = Math.min(...proposal.signers.filter(s => s.status === "pending").map(s => s.level));
    if (signerEntry.level !== minPendingLevel) return { success: false, error: "Chưa đến lượt ký của bạn" };

    // Placeholder ký file
    if (status === "approved" && proposal.fileId) {
      const signerInfo = await prisma.employee.findUnique({ where: { id: employeeId } });
      if (!signerInfo) return { success: false, error: "Không tìm thấy thông tin signer" };

      const fileData = await FileService.getFileData(proposal.fileId);
      if (!fileData) return { success: false, error: "Không thể lấy file gốc" };

      const signedBuffer = await this._applyDigitalSignatureToFile(proposal.fileId, signerInfo, "signer");
      if (!signedBuffer) return { success: false, error: "Không thể ký file" };

      // Cập nhật file, giữ nguyên mimeType và tên gốc
      await FileService.updateFile(
        proposal.fileId,
        signedBuffer,
        fileData.mimeType,
        signedBuffer.length
      );
    }

    // Cập nhật trạng thái signer
    await prisma.proposalSigner.update({
      where: { id: signerEntry.id },
      data: { status, signedAt: new Date() },
    });

    const updatedProposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: this.getFullIncludeObject(),
    });

    const fileUrl = updatedProposal?.file ? `${baseUrl}/api/files/${updatedProposal.file.id}` : undefined;
    const signerInfo = await prisma.employee.findUnique({ where: { id: employeeId }, include: this.getFullEmployeeInclude() });

    if (status === "rejected") {
      await prisma.proposal.update({ where: { id: proposalId }, data: { status: "rejected" } });
      await EmailService.sendProposalRejectedBySigner(
        updatedProposal?.proposer,
        { ...updatedProposal, fileUrl },
        signerInfo?.name || "Người ký"
      );
      return { success: true, message: "Bạn đã từ chối đề xuất. Đề xuất bị từ chối." };
    }

    // Gửi mail cho signer tiếp theo hoặc approver đầu tiên
    const nextSigner = updatedProposal?.signers
      .filter(s => s.status === "pending")
      .sort((a, b) => a.level - b.level)[0];

    if (nextSigner) {
      const nextSignerInfo = await prisma.employee.findUnique({
        where: { id: nextSigner.signerId },
        include: this.getFullEmployeeInclude(),
      });
      if (nextSignerInfo) {
        await EmailService.sendSignatureRequest(nextSignerInfo, { ...updatedProposal, fileUrl });
      }
    } else {
      // Hết signer, chuyển sang approver đầu tiên
      await prisma.proposal.update({ where: { id: proposalId }, data: { status: "waiting_approval" } });
      const firstApprover = updatedProposal?.approvers
        .filter(a => a.status === "pending")
        .sort((a, b) => a.level - b.level)[0];
      if (firstApprover) {
        const approverInfo = await prisma.employee.findUnique({
          where: { id: firstApprover.approverId },
          include: this.getFullEmployeeInclude(),
        });
        if (approverInfo) {
          await EmailService.sendApprovalRequest(approverInfo, { ...updatedProposal, fileUrl });
        }
      }
    }

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
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: this.getFullIncludeObject(),
    });
    if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" };

    const approverEntry = proposal.approvers.find(a => a.approverId === employeeId);
    if (!approverEntry) return { success: false, error: "Bạn không phải approver" };
    if (approverEntry.status !== "pending") return { success: false, error: "Bạn đã phê duyệt rồi" };

    const minPendingLevel = Math.min(
      ...proposal.approvers.filter(a => a.status === "pending").map(a => a.level)
    );
    if (approverEntry.level !== minPendingLevel) return { success: false, error: "Chưa đến lượt phê duyệt" };

    // --- Ký file, giữ nguyên tất cả định dạng ---
    if (status === "approved" && proposal.fileId) {
      const approverInfo = await prisma.employee.findUnique({ where: { id: employeeId } });
      if (!approverInfo) return { success: false, error: "Không tìm thấy thông tin approver" };

      // Trả buffer gốc
      const fileBuffer = await FileService.getFileBuffer(proposal.fileId);
      if (!fileBuffer) return { success: false, error: "Không thể lấy file" };

      await FileService.updateFile(
        proposal.fileId,
        fileBuffer,
        proposal.file?.mimeType,  // giữ nguyên mimeType gốc
        fileBuffer.length
      );
    }

    // Cập nhật trạng thái approver
    await prisma.proposalApprover.update({
      where: { id: approverEntry.id },
      data: { status, approvedAt: new Date() },
    });

    const updatedProposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: this.getFullIncludeObject(),
    });

    const fileUrl = updatedProposal?.file ? `${baseUrl}/api/files/${updatedProposal.file.id}` : undefined;

    if (status === "rejected") {
      await prisma.proposal.update({ where: { id: proposalId }, data: { status: "rejected" } });
      await EmailService.sendStatusUpdate(updatedProposal?.proposer, { ...updatedProposal, fileUrl }, "rejected");
      return { success: true, message: "Đã từ chối phê duyệt đề xuất." };
    }

    const nextApprover = updatedProposal?.approvers
      .filter(a => a.status === "pending")
      .sort((a, b) => a.level - b.level)[0];

    if (nextApprover) {
      const nextApproverInfo = await prisma.employee.findUnique({
        where: { id: nextApprover.approverId },
        include: this.getFullEmployeeInclude(),
      });
      if (nextApproverInfo) await EmailService.sendApprovalRequest(nextApproverInfo, { ...updatedProposal, fileUrl });
    } else {
      await prisma.proposal.update({ where: { id: proposalId }, data: { status: "approved" } });
      await EmailService.sendStatusUpdate(updatedProposal?.proposer, { ...updatedProposal, fileUrl }, "approved");
    }

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
