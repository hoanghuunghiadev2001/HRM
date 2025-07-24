/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios"

const VNPT_API_URL = process.env.VNPT_API_URL || "https://api.vnptca.vn/remote-sign/pdf"
const VNPT_API_TOKEN = process.env.VNPT_API_TOKEN // Bearer token
const VNPT_CERT_SERIAL = process.env.VNPT_CERT_SERIAL // Chứng thư số của người ký

interface SignOptions {
  fileBuffer: Buffer
  certSerial?: string // Nếu muốn chỉ định mỗi lần
  reason?: string
  location?: string
  page?: number
  x?: number
  y?: number
  width?: number
  height?: number
}

export async function signPdfWithVNPT(options: SignOptions): Promise<Buffer> {
  const {
    fileBuffer,
    certSerial = VNPT_CERT_SERIAL,
    reason = "Ký duyệt đề xuất",
    location = "TP. Hồ Chí Minh",
    page = 1,
    x = 100,
    y = 100,
    width = 150,
    height = 80
  } = options

  // Convert PDF buffer to base64 string
  const fileBase64 = fileBuffer.toString("base64")

  try {
    const res = await axios.post(
      VNPT_API_URL,
      {
        fileBase64,
        certSerial,
        reason,
        location,
        signingPage: page,
        signatureAppearance: {
          x,
          y,
          width,
          height
        }
      },
      {
        headers: {
          Authorization: `Bearer ${VNPT_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    )

    if (!res.data || !res.data.signedFileBase64) {
      throw new Error("Phản hồi không hợp lệ từ VNPT")
    }

    return Buffer.from(res.data.signedFileBase64, "base64")
  } catch (error: any) {
    console.error("Lỗi khi gửi file ký đến VNPT:", error?.response?.data || error.message)
    throw new Error("Không thể ký file PDF bằng VNPT")
  }
}
