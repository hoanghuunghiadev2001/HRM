/* eslint-disable @typescript-eslint/no-unused-vars */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { FileService } from "@/lib/file-service";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit"; // ✅ Bắt buộc
import mammoth from "mammoth";
import fs from "fs/promises";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Load font once
let notoFontBytes: Uint8Array;
async function getNotoFont(): Promise<Uint8Array> {
  if (!notoFontBytes) {
    const fontPath = path.join(
      process.cwd(),
      "public/fonts/NotoSans-Regular.ttf"
    );
    notoFontBytes = await fs.readFile(fontPath);
  }
  return notoFontBytes;
}

// Convert Buffer -> ArrayBuffer
function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buffer.length);
  new Uint8Array(ab).set(buffer);
  return ab;
}

// Convert Word buffer -> PDF buffer
async function convertWordToPdf(buffer: Buffer): Promise<Buffer> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit); // ✅ quan trọng

    const fontBytes = await getNotoFont();
    const font = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const lineHeight = fontSize * 1.5;
    let y = height - 50;

    const lines = text.split("\n");
    for (const line of lines) {
      if (y < 50) {
        pdfDoc.addPage();
        y = height - 50;
      }
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (err) {
    console.error("[File API] Word to PDF conversion failed:", err);
    return buffer; // fallback
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);
    if (!id) return new NextResponse("id không hợp lệ", { status: 400 });

    const token = req.cookies.get("token")?.value;
    if (!token) return new NextResponse("Không có token", { status: 401 });

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return new NextResponse("Token không hợp lệ", { status: 401 });
    }

    const fileBuffer = await FileService.getFileBuffer(id);
    const fileInfo = await FileService.getFileData(id);

    if (!fileBuffer || !fileInfo)
      return new NextResponse("Không tìm thấy file", { status: 404 });

    let buffer = fileBuffer;
    let mimeType = fileInfo.mimeType || "application/octet-stream";
    let fileName = fileInfo.filename || `file-${id}`;

    // Convert Word -> PDF
    if (mimeType.includes("word")) {
      buffer = await convertWordToPdf(buffer);
      mimeType = "application/pdf";
      fileName = fileName.replace(/\.(docx|doc)$/i, ".pdf");
    }

    return new NextResponse(bufferToArrayBuffer(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          fileName
        )}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[File API] Error:", err);
    return new NextResponse("Lỗi khi lấy file", { status: 500 });
  }
}
