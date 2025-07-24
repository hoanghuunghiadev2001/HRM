import crypto from "crypto"

// Service quản lý key mã hóa trong session/cache
export class KeyManager {
  private static keyCache = new Map<string, { keyIdentifier: string; expiry: number }>()

  // Tạo session token để truy cập file
  static generateSessionToken(userId: number, fileId: number, keyIdentifier: string): string {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error("JWT_SECRET không được cấu hình")
    }

    const payload = {
      userId,
      fileId,
      keyIdentifier, // keyIdentifier này đã là chuỗi hex (ASCII)
      timestamp: Date.now(),
    }

    const payloadJson = JSON.stringify(payload) // Chuỗi JSON này sẽ thoát các ký tự Unicode nếu có

    // Chuyển đổi jwtSecret thành Buffer với mã hóa utf8 tường minh
    const secretBuffer = Buffer.from(jwtSecret, "utf8")

    // Tạo payloadBase64: chuyển chuỗi JSON thành Buffer (utf8), sau đó mã hóa base64
    const payloadBase64 = Buffer.from(payloadJson, "utf8").toString("base64")

    // Tạo signature (phần token): sử dụng chuỗi JSON (utf8) để cập nhật HMAC
    const signature = crypto.createHmac("sha256", secretBuffer).update(payloadJson, "utf8").digest("hex")

    // Thêm log ngay sau khi tạo token:
    console.log("Generating session token for userId:", userId, "fileId:", fileId, "keyIdentifier:", keyIdentifier)
    console.log("Generated payloadBase64:", payloadBase64)
    console.log("Generated signature:", signature)

    return `${payloadBase64}.${signature}`
  }

  // Verify và parse session token
  static verifySessionToken(token: string): {
    valid: boolean
    userId?: number
    fileId?: number
    keyIdentifier?: string
  } {
    try {
      // Thêm log ngay đầu hàm:
      console.log("Verifying session token:", token)

      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret) {
        throw new Error("JWT_SECRET không được cấu hình")
      }

      const [payloadBase64, signature] = token.split(".")
      if (!payloadBase64 || !signature) {
        console.log("Invalid token format: missing payload or signature")
        return { valid: false }
      }

      // Decode payload: giải mã từ base64 sang Buffer, sau đó chuyển thành chuỗi utf8
      const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf8")
      const payload = JSON.parse(payloadJson)

      // Thêm log sau khi parse payload:
      console.log("Parsed token payload:", payload)

      // Verify signature: chuyển đổi jwtSecret thành Buffer (utf8), sử dụng chuỗi JSON (utf8) để cập nhật HMAC
      const secretBuffer = Buffer.from(jwtSecret, "utf8")
      const expectedSignature = crypto.createHmac("sha256", secretBuffer).update(payloadJson, "utf8").digest("hex")

      // Thêm log sau khi verify signature:
      console.log("Signature valid:", signature === expectedSignature)

      if (signature !== expectedSignature) {
        console.log("Signature mismatch. Expected:", expectedSignature, "Received:", signature)
        return { valid: false }
      }

      // Kiểm tra thời gian hết hạn (24 giờ)
      const now = Date.now()
      const tokenAge = now - payload.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 giờ

      // Thêm log sau khi kiểm tra thời gian hết hạn:
      console.log("Token age:", tokenAge, "Max age:", maxAge, "Expired:", tokenAge > maxAge)

      if (tokenAge > maxAge) {
        console.log("Token expired.")
        return { valid: false }
      }

      return {
        valid: true,
        userId: payload.userId,
        fileId: payload.fileId,
        keyIdentifier: payload.keyIdentifier,
      }
    } catch (error) {
      console.error("Token verification error:", error)
      // Có thể log token ở đây để debug, nhưng cẩn thận với dữ liệu nhạy cảm
      // console.error("Problematic token:", token);
      return { valid: false }
    }
  }

  // Lưu key identifier vào cache với thời gian hết hạn
  static storeKeyIdentifier(sessionKey: string, keyIdentifier: string, ttlMinutes = 60): void {
    const expiry = Date.now() + ttlMinutes * 60 * 1000
    this.keyCache.set(sessionKey, { keyIdentifier, expiry })

    // Tự động xóa key hết hạn
    setTimeout(
      () => {
        this.keyCache.delete(sessionKey)
      },
      ttlMinutes * 60 * 1000,
    )
  }

  // Lấy key identifier từ cache
  static getKeyIdentifier(sessionKey: string): string | null {
    const cached = this.keyCache.get(sessionKey)
    if (!cached) return null

    if (Date.now() > cached.expiry) {
      this.keyCache.delete(sessionKey)
      return null
    }

    return cached.keyIdentifier
  }

  // Xóa key khỏi cache
  static removeKey(sessionKey: string): void {
    this.keyCache.delete(sessionKey)
  }

  // Cleanup keys hết hạn
  static cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.keyCache.entries()) {
      if (now > value.expiry) {
        this.keyCache.delete(key)
      }
    }
  }

  // Tạo secure download URL
  static createSecureDownloadUrl(fileId: number, userId: number, keyIdentifier: string): string {
    const token = this.generateSessionToken(userId, fileId, keyIdentifier)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return `${baseUrl}/api/files/${fileId}?token=${encodeURIComponent(token)}`
  }
}

// Chạy cleanup mỗi 30 phút
setInterval(
  () => {
    KeyManager.cleanup()
  },
  30 * 60 * 1000,
)
