// lib/services/file-service.ts
import { Buffer } from "buffer"
import { prisma } from "./prisma"

export class FileService {
  static async uploadFile(file: File): Promise<{ fileId: number; error?: string }> {
    try {
      const fileBuffer = await file.arrayBuffer() // file là từ FormData
      const buffer = Buffer.from(fileBuffer)

      console.log(`[FileService] Uploading file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)
      // Log một phần nhỏ của buffer để kiểm tra dữ liệu nhị phân
      console.log(`[FileService] File buffer head (first 20 bytes): ${buffer.toString("hex", 0, 20)}...`)

      const newFile = await prisma.file.create({
        data: {
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
          data: buffer,
        },
      })

      console.log(`[FileService] File uploaded to DB with ID: ${newFile.id}`)
      return {
        fileId: newFile.id,
      }
    } catch (error) {
      console.error("[FileService] Error uploading file to DB:", error)
      return { fileId: -1, error: "Không thể upload file vào cơ sở dữ liệu" } // Return error message
    }
  }

  static async getFileData(fileId: number): Promise<{ filename: string; mimeType: string; data: Buffer } | null> {
    try {
      console.log(`[FileService] Attempting to retrieve file with ID: ${fileId}`)
      const file = await prisma.file.findUnique({
        where: { id: fileId },
      })

      if (!file) {
        console.log(`[FileService] File with ID ${fileId} not found in DB.`)
        return null
      }

      // Ensure data is treated as Buffer
      const fileDataBuffer = Buffer.from(file.data as Uint8Array)

      console.log(
        `[FileService] Retrieved file: ${file.filename}, type: ${file.mimeType}, size: ${file.fileSize} bytes`,
      )
      console.log(
        `[FileService] Retrieved file buffer head (first 20 bytes): ${fileDataBuffer.toString("hex", 0, 20)}...`,
      )

      return {
        filename: file.filename,
        mimeType: file.mimeType,
        data: fileDataBuffer,
      }
    } catch (error) {
      console.error("[FileService] Error getting file data from DB:", error)
      throw new Error("Không thể lấy dữ liệu file từ cơ sở dữ liệu")
    }
  }

  // NEW: Method to get file data as Buffer (more direct for signing)
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

  // NEW: Method to update file data (e.g., after signing)
  static async updateFile(
    fileId: number,
    newData: Buffer,
    newMimeType?: string,
    newFileSize?: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[FileService] Attempting to update file with ID: ${fileId}`)
      await prisma.file.update({
        where: { id: fileId },
        data: {
          data: newData,
          mimeType: newMimeType || "application/pdf", // Assume PDF after signing
          fileSize: newFileSize || newData.length,
          updatedAt: new Date(),
        },
      })
      console.log(`[FileService] File with ID ${fileId} updated successfully.`)
      return { success: true }
    } catch (error) {
      console.error("[FileService] Error updating file:", error)
      return { success: false, error: "Không thể cập nhật file" }
    }
  }

  static async deleteFile(fileId: number): Promise<boolean> {
    try {
      console.log(`[FileService] Attempting to delete file with ID: ${fileId}`)
      await prisma.file.delete({
        where: { id: fileId },
      })
      console.log(`[FileService] File with ID ${fileId} deleted successfully.`)
      return true
    } catch (error) {
      console.error("[FileService] Error deleting file from DB:", error)
      return false
    }
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    // Kiểm tra kích thước file (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File không được vượt quá 10MB",
      }
    }
    // Kiểm tra loại file
    const allowedTypes = ["application/pdf"] // Chỉ chấp nhận PDF cho mục đích ký số
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Chỉ chấp nhận file PDF", // Cập nhật thông báo lỗi
      }
    }
    return { valid: true }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}
