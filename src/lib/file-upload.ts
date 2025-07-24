import { put } from "@vercel/blob"

export class FileUploadService {
  static async uploadFile(file: File, folder = "proposals"): Promise<{ url: string; filename: string }> {
    try {
      // Tạo tên file unique
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split(".").pop()
      const filename = `${folder}/${timestamp}-${randomString}.${fileExtension}`

      // Upload lên Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      })

      return {
        url: blob.url,
        filename: blob.pathname,
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      throw new Error("Không thể upload file")
    }
  }

  static async deleteFile(url: string): Promise<boolean> {
    try {
      // Trong thực tế, bạn có thể cần implement delete từ Vercel Blob
      // Hiện tại Vercel Blob chưa hỗ trợ delete API
      console.log("File deletion requested for:", url)
      return true
    } catch (error) {
      console.error("Error deleting file:", error)
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
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Chỉ chấp nhận file PDF, Word, Excel, hoặc hình ảnh",
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
