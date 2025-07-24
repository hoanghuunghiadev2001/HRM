/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CreateProposalFormData } from "@/components/api"
import { FileService } from "./file-service"
import type { Buffer } from "buffer"
import { EmailService } from "./email-prososal-service"
import type { Prisma } from "../../generated/prisma"
import { prisma } from "./prisma"
import type { Employee } from "../../generated/prisma/client" // Import Employee type

// Conceptual import for PDF manipulation library
// In a real project, you would install: npm install pdf-lib
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

type ProposalWithAllRelations = Prisma.ProposalGetPayload<{
  include: ReturnType<typeof ProposalService.getFullIncludeObject>
}>

export class ProposalService {
  static async createProposal(proposalData: CreateProposalFormData, file: File | null, createdById: number) {
    try {
      let fileId: number | null = null
      let fileUrlForEmail: string | undefined = undefined

      if (file) {
        const { valid, error } = FileService.validateFile(file)
        if (!valid) return { success: false, error: error || "File không hợp lệ" }

        const uploadResult = await FileService.uploadFile(file)
        fileId = uploadResult.fileId
        const uploadedFileData = await FileService.getFileData(fileId)
        if (uploadedFileData) {
          fileUrlForEmail = `${baseUrl}/api/files/${fileId}`
        }
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
            create: proposalData.signerIds.map((id) => ({ signerId: id })),
          },
          approvers: {
            create: proposalData.approverIds.map((id) => ({ approverId: id })),
          },
        },
        include: this.getFullIncludeObject(),
      })

      await EmailService.sendProposalCreatedConfirmation(newProposal.proposer, {
        ...newProposal,
        fileUrl: fileUrlForEmail,
      })
      for (const signer of newProposal.signers) {
        await EmailService.sendSignatureRequest(signer.signerId, { ...newProposal, fileUrl: fileUrlForEmail })
      }

      return { success: true, data: newProposal }
    } catch (error) {
      console.error("[ProposalService] Error creating proposal:", error)
      return { success: false, error: "Không thể tạo đề xuất" }
    }
  }

  static async getProposal(proposalId: number, userId?: number) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(),
      })

      if (!proposal) {
        return { success: false, error: "Không tìm thấy đề xuất" }
      }

      const isSigner = proposal.signers.some(s => s.signerId === userId)
      const isApprovers = proposal.approvers.some(s => s.approverId === userId)


      if (!userId || !isSigner && !isApprovers) {
        return { success: false, error: "Bạn không có quyền xem đề xuất này" }
      }

      return { success: true, data: proposal }
    } catch (error) {
      console.error("getProposal error:", error)
      return { success: false, error: "Lỗi khi lấy thông tin đề xuất" }
    }
  }

  static async signProposal(proposalId: number, employeeId: number, status: "approved" | "rejected") {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(),
      })

      if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" }

      const signerEntry = proposal.signers.find((s) => s.signerId === employeeId)
      if (!signerEntry) return { success: false, error: "Bạn không phải là người ký của đề xuất này" }
      if (signerEntry.status !== "pending") return { success: false, error: "Bạn đã ký đề xuất này rồi" }

      // NEW: Apply digital signature to the file if status is approved
      if (status === "approved" && proposal.fileId) {
        const signerInfo = await prisma.employee.findUnique({ where: { id: employeeId } })
        if (!signerInfo) return { success: false, error: "Không tìm thấy thông tin người ký" }

        const signedFileBuffer = await this._applyDigitalSignatureToFile(proposal.fileId, signerInfo, "signer")

        if (!signedFileBuffer) {
          return { success: false, error: "Không thể áp dụng chữ ký số vào file" }
        }

        // Update the file in the database with the signed version
        const updateFileResult = await FileService.updateFile(proposal.fileId, signedFileBuffer)
        if (!updateFileResult.success) {
          return { success: false, error: updateFileResult.error || "Không thể cập nhật file đã ký" }
        }
      }

      await prisma.proposalSigner.update({
        where: { id: signerEntry.id },
        data: { status, signedAt: new Date() },
      })

      const updatedProposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(),
      })
      if (!updatedProposal) return { success: false, error: "Không thể cập nhật đề xuất" }

      // Use the API endpoint for file URL in emails for consistency and scalability
      const fileUrl = updatedProposal.file ? `${baseUrl}/api/files/${updatedProposal.file.id}` : undefined

      const signerInfo = await prisma.employee.findUnique({ where: { id: employeeId } })
      await EmailService.sendSignatureUpdateNotification(
        updatedProposal.proposer,
        { ...updatedProposal, fileUrl },
        { name: signerInfo?.name || "Người ký" },
        status,
      )

      const anyRejected = updatedProposal.signers.some((s) => s.status === "rejected")
      const allSigned = updatedProposal.signers.every((s) => s.status !== "pending")

      if (anyRejected) {
        await prisma.proposal.update({ where: { id: proposalId }, data: { status: "rejected" } })
        await EmailService.sendProposalRejectedBySigner(
          updatedProposal.proposer,
          { ...updatedProposal, fileUrl },
          signerInfo?.name || "Người ký",
        )
        return { success: true, message: "Bạn đã từ chối đề xuất. Đề xuất bị từ chối." }
      }

      if (allSigned) {
        await prisma.proposal.update({ where: { id: proposalId }, data: { status: "waiting_approval" } })
        for (const approver of updatedProposal.approvers) {
          const approverEmp = await prisma.employee.findUnique({
            where: { id: approver.approverId },
            include: { contactInfo: true },
          })
          if (approverEmp) {
            await EmailService.sendApprovalRequest(approverEmp, { ...updatedProposal, fileUrl })
          }
        }
        return { success: true, message: "Đã ký đề xuất. Đề xuất đang chờ phê duyệt." }
      }

      return { success: true, message: "Đã ký đề xuất." }
    } catch (error) {
      console.error("[ProposalService] Error signing proposal:", error)
      return { success: false, error: "Không thể ký đề xuất" }
    }
  }

  static async approveProposal(proposalId: number, employeeId: number, status: "approved" | "rejected") {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(),
      })

      if (!proposal) return { success: false, error: "Đề xuất không tìm thấy" }

      const approverEntry = proposal.approvers.find((a) => a.approverId === employeeId)
      if (!approverEntry) return { success: false, error: "Bạn không phải là người phê duyệt của đề xuất này" }
      if (approverEntry.status !== "pending") return { success: false, error: "Bạn đã phê duyệt đề xuất này rồi" }

      // NEW: Apply digital signature to the file if status is approved
      if (status === "approved" && proposal.fileId) {
        const approverInfo = await prisma.employee.findUnique({ where: { id: employeeId } })
        if (!approverInfo) return { success: false, error: "Không tìm thấy thông tin người phê duyệt" }

        const signedFileBuffer = await this._applyDigitalSignatureToFile(proposal.fileId, approverInfo, "approver")

        if (!signedFileBuffer) {
          return { success: false, error: "Không thể áp dụng chữ ký số vào file" }
        }

        // Update the file in the database with the signed version
        const updateFileResult = await FileService.updateFile(proposal.fileId, signedFileBuffer)
        if (!updateFileResult.success) {
          return { success: false, error: updateFileResult.error || "Không thể cập nhật file đã ký" }
        }
      }

      await prisma.proposalApprover.update({
        where: { id: approverEntry.id },
        data: { status, approvedAt: new Date() },
      })

      const updatedProposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: this.getFullIncludeObject(),
      })
      if (!updatedProposal) return { success: false, error: "Không thể cập nhật đề xuất" }

      // Use the API endpoint for file URL in emails for consistency and scalability
      const fileUrl = updatedProposal.file ? `${baseUrl}/api/files/${updatedProposal.file.id}` : undefined

      if (status === "rejected") {
        await prisma.proposal.update({ where: { id: proposalId }, data: { status: "rejected" } })
        await EmailService.sendStatusUpdate(updatedProposal.proposer, { ...updatedProposal, fileUrl }, "rejected")
        return { success: true, message: "Đã từ chối phê duyệt đề xuất." }
      }

      const allApproved = updatedProposal.approvers.every((a) => a.status !== "pending")
      if (allApproved) {
        await prisma.proposal.update({ where: { id: proposalId }, data: { status: "approved" } })
        await EmailService.sendStatusUpdate(updatedProposal.proposer, { ...updatedProposal, fileUrl }, "approved")
        return { success: true, message: "Đã phê duyệt đề xuất. Đề xuất đã hoàn thành." }
      }

      return { success: true, message: "Đã phê duyệt đề xuất." }
    } catch (error) {
      console.error("[ProposalService] Error approving proposal:", error)
      return { success: false, error: "Không thể phê duyệt đề xuất" }
    }
  }

  // NEW: Conceptual method to apply digital signature to a PDF file
  private static async _applyDigitalSignatureToFile(
    fileId: number,
    signerInfo: Employee,
    signatureType: "signer" | "approver",
  ): Promise<Buffer | null> {
    try {
      const fileBuffer = await FileService.getFileBuffer(fileId)
      if (!fileBuffer) {
        console.error(`[ProposalService] File with ID ${fileId} not found for signing.`)
        return null
      }

      // --- BƯỚC 1: TÍCH HỢP VNPT CA (CONCEPTUAL) ---
      // Đây là nơi bạn sẽ tương tác với API của VNPT CA.
      // Quá trình này thường bao gồm:
      // 1. Gửi hash của fileBuffer (hoặc fileBuffer trực tiếp) đến dịch vụ VNPT CA.
      //    VNPT CA sẽ yêu cầu người dùng xác thực (ví dụ: qua USB token, Smart OTP, Mobile ID).
      // 2. Nhận lại chữ ký số (digital signature) từ VNPT CA.
      //    Chữ ký này là một chuỗi byte hoặc base64.

      console.log(`[Digital Signature] Simulating digital signing for ${signerInfo.name} (${signatureType})...`)
      // const digitalSignatureFromVNPT = await vnptCaService.sign(fileBuffer, signerInfo.certificate);
      // if (!digitalSignatureFromVNPT) {
      //   console.error("Failed to get digital signature from VNPT CA.");
      //   return null;
      // }

      // --- BƯỚC 2: NHÚNG CHỮ KÝ VÀO FILE PDF (CONCEPTUAL) ---
      // Sử dụng thư viện PDF để nhúng chữ ký số vào file.
      // Ví dụ với pdf-lib (cần cài đặt và import):
      // const pdfDoc = await PDFDocument.load(fileBuffer);
      // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      // const pages = pdfDoc.getPages();
      // const firstPage = pages[0];

      // // Thêm một trường chữ ký (signature field) hoặc một hình ảnh/văn bản đại diện cho chữ ký
      // // Đây là phần phức tạp và cần tùy chỉnh nhiều tùy theo yêu cầu hiển thị chữ ký
      // firstPage.drawText(`Ký bởi: ${signerInfo.name} (${signatureType})`, {
      //   x: 50,
      //   y: 50,
      //   font,
      //   size: 12,
      //   color: rgb(0, 0, 0),
      // });

      // // Để thực sự nhúng chữ ký số (PAdES, CAdES, XAdES), bạn cần một thư viện chuyên dụng hơn
      // // hoặc tự xây dựng logic dựa trên đặc tả PDF.
      // // pdf-lib có thể giúp tạo các trường chữ ký, nhưng việc ký số thực sự (cryptographic signing)
      // // thường được thực hiện bởi các thư viện cấp cao hơn hoặc dịch vụ CA.

      // const signedPdfBytes = await pdfDoc.save();
      // return Buffer.from(signedPdfBytes);

      // Placeholder: Return the original buffer for now, as actual signing is complex
      // In a real scenario, this would be the *signed* PDF buffer.
      console.log(
        "[Digital Signature] Placeholder: Returning original file buffer. Actual signing logic needs to be implemented.",
      )
      return fileBuffer
    } catch (error) {
      console.error("[ProposalService] Error applying digital signature:", error)
      return null
    }
  }

  static getFullIncludeObject(): Prisma.ProposalInclude {
    return {
      proposer: {
        include: {
          contactInfo: true,
          workInfo: { include: { position: true, department: true } },
        },
      },
      createdBy: {
        include: {
          contactInfo: true,
          workInfo: { include: { position: true, department: true } },
        },
      },
      file: true,
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
    }
  }
}
