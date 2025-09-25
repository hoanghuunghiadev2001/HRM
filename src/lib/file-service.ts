// lib/services/file-service.ts
import { Buffer } from "buffer"
import { prisma } from "./prisma"
import { PDFDocument } from "pdf-lib"

export class FileService {
  /**
   * Upload file (tự động convert ảnh sang PDF trước khi lưu DB)
   */
  static async uploadFile(file: File): Promise<{ fileId: number; error?: string }> {
    try {
      const fileBuffer = await file.arrayBuffer()
      let buffer = Buffer.from(fileBuffer)
      let mimeType = file.type
      let filename = file.name

      console.log(`[FileService] Uploading file: ${filename}, type: ${mimeType}, size: ${file.size} bytes`)
      console.log(`[FileService] Buffer head (20 bytes): ${buffer.toString("hex", 0, 20)}...`)

      // Nếu file là ảnh → convert sang PDF
      if (["image/png", "image/jpeg", "image/jpg", "image/gif"].includes(mimeType)) {
        console.log("[FileService] Converting image to PDF before saving...")
        const pdfDoc = await PDFDocument.create()
        let img

        if (mimeType === "image/png") {
          img = await pdfDoc.embedPng(buffer)
        } else {
          img = await pdfDoc.embedJpg(buffer)
        }

        const page = pdfDoc.addPage([img.width, img.height])
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })

        const pdfBytes = await pdfDoc.save()
        buffer = Buffer.from(pdfBytes)

        mimeType = "application/pdf"
        filename = filename.replace(/\.(png|jpg|jpeg|gif)$/i, ".pdf")

        console.log(`[FileService] Converted to PDF: ${filename}, size: ${buffer.length} bytes`)
      }

      const newFile = await prisma.file.create({
        data: {
          filename,
          mimeType,
          fileSize: buffer.length,
          data: buffer,
        },
      })

      console.log(`[FileService] File uploaded to DB with ID: ${newFile.id}`)
      return { fileId: newFile.id }
    } catch (error) {
      console.error("[FileService] Error uploading file:", error)
      return { fileId: -1, error: "Không thể upload file vào cơ sở dữ liệu" }
    }
  }

  /**
   * Lấy file từ DB (trả về đầy đủ metadata + buffer)
   */
  static async getFileData(fileId: number): Promise<{ filename: string; mimeType: string; data: Buffer } | null> {
    try {
      console.log(`[FileService] Retrieving file ID: ${fileId}`)
      const file = await prisma.file.findUnique({ where: { id: fileId } })

      if (!file) {
        console.warn(`[FileService] File ID ${fileId} not found`)
        return null
      }

      const buffer = Buffer.from(file.data as Uint8Array)

      console.log(`[FileService] Retrieved: ${file.filename}, type: ${file.mimeType}, size: ${file.fileSize} bytes`)
      console.log(`[FileService] Buffer head (20 bytes): ${buffer.toString("hex", 0, 20)}...`)

      return { filename: file.filename, mimeType: file.mimeType, data: buffer }
    } catch (error) {
      console.error("[FileService] Error retrieving file:", error)
      throw new Error("Không thể lấy dữ liệu file từ cơ sở dữ liệu")
    }
  }

  /**
   * Lấy buffer file trực tiếp (tiện để ký số, xử lý nhị phân)
   */
  static async getFileBuffer(fileId: number): Promise<Buffer | null> {
    try {
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        select: { data: true },
      })
      return file?.data ? Buffer.from(file.data as Uint8Array) : null
    } catch (error) {
      console.error("[FileService] Error getting file buffer:", error)
      return null
    }
  }

  /**
   * Update file trong DB (ví dụ sau khi ký số)
   */
  static async updateFile(
    fileId: number,
    newData: Buffer,
    newMimeType?: string,
    newFileSize?: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[FileService] Updating file ID: ${fileId}`)
      await prisma.file.update({
        where: { id: fileId },
        data: {
          data: newData,
          mimeType: newMimeType || "application/pdf",
          fileSize: newFileSize || newData.length,
          updatedAt: new Date(),
        },
      })
      console.log(`[FileService] File ID ${fileId} updated successfully`)
      return { success: true }
    } catch (error) {
      console.error("[FileService] Error updating file:", error)
      return { success: false, error: "Không thể cập nhật file" }
    }
  }

  /**
   * Xóa file trong DB
   */
  static async deleteFile(fileId: number): Promise<boolean> {
    try {
      console.log(`[FileService] Deleting file ID: ${fileId}`)
      await prisma.file.delete({ where: { id: fileId } })
      console.log(`[FileService] File ID ${fileId} deleted successfully`)
      return true
    } catch (error) {
      console.error("[FileService] Error deleting file:", error)
      return false
    }
  }

  /**
   * Validate file trước khi upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: "File không được vượt quá 10MB" }
    }

    // const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/gif"]
    // if (!allowedTypes.includes(file.type)) {
    //   return { valid: false, error: "Chỉ chấp nhận file PDF hoặc ảnh" }
    // }

    return { valid: true }
  }

  /**
   * Format file size thành chuỗi
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}
