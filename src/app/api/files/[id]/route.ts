/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Chuẩn hoá mọi dữ liệu nhị phân về Uint8Array.
 *
 */

// đặt trước `export async function GET(...) { ... }`
function drawWrappedText({
  page,
  text,
  x,
  y,
  maxWidth,
  font,
  size = 12,
  lineHeight,
  color,
}: {
  page: any;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  font: any;
  size?: number;
  lineHeight?: number;
  color?: any;
}) {
  if (!lineHeight) lineHeight = Math.round(size * 1.3);

  // split paragraphs by newline
  const paragraphs = text.split(/\r?\n/);

  for (const para of paragraphs) {
    const words = para.split(" ");
    let line = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, size);

      if (width > maxWidth) {
        if (line) {
          page.drawText(line, { x, y, size, font, color });
          y -= lineHeight;
          line = word;
        } else {
          // một từ dài hơn maxWidth -> cắt theo ký tự
          let fragment = "";
          for (const ch of word) {
            const testFrag = fragment + ch;
            const fragWidth = font.widthOfTextAtSize(testFrag, size);
            if (fragWidth > maxWidth) {
              if (fragment) {
                page.drawText(fragment, { x, y, size, font, color });
                y -= lineHeight;
              }
              fragment = ch;
            } else {
              fragment = testFrag;
            }
          }
          if (fragment) {
            page.drawText(fragment, { x, y, size, font, color });
            y -= lineHeight;
          }
          line = "";
        }
      } else {
        line = testLine;
      }
    }

    if (line) {
      page.drawText(line, { x, y, size, font, color });
      y -= lineHeight;
    }

    // small paragraph gap
    y -= Math.round(lineHeight * 0.1);
  }

  return y;
}

function normalizeToUint8Array(input: unknown): Uint8Array {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  // Node Buffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (
    typeof Buffer !== "undefined" &&
    (Buffer as any).isBuffer &&
    (Buffer as any).isBuffer(input)
  ) {
    // input is Buffer which is subclass of Uint8Array, convert to Uint8Array (copy)
    return new Uint8Array(input as Uint8Array);
  }
  if (typeof input === "object" && input !== null) {
    try {
      const maybe = input as { byteLength?: number; [k: string]: any };
      if (typeof maybe.byteLength === "number") {
        // Buffer.from can handle many ArrayBufferLike types; create Buffer and copy
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tmp = Buffer.from(maybe as any);
        return new Uint8Array(tmp);
      }
    } catch {
      // fallback
    }
  }
  if (Array.isArray(input)) return Uint8Array.from(input as number[]);
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tmp = Buffer.from(input as any);
    return new Uint8Array(tmp);
  } catch (err) {
    throw new Error(
      "Không thể chuẩn hoá dữ liệu file sang Uint8Array: " +
        (err as Error).message
    );
  }
}

function isValidPDF(buf: Uint8Array): boolean {
  const header = buf.slice(0, 4);
  try {
    return Buffer.from(header).toString() === "%PDF";
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  const token = req.cookies.get("token")?.value;

  if (!token)
    return NextResponse.json({ message: "Không có token" }, { status: 401 });

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 }
    );
  }

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        proposer: true,
        signers: { include: { signer: true } },
        approvers: { include: { approver: true } },
        file: true,
      },
    });

    if (!proposal || !proposal.file) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy file đề xuất" },
        { status: 404 }
      );
    }

    // chuẩn hoá sang Uint8Array (đảm bảo không còn ArrayBufferLike generic)
    const fileUint8 = normalizeToUint8Array(proposal.file.data);
    const fileType = proposal.file.mimeType;

    // load font bytes (Buffer ok, nhưng chúng ta không expose generic)
    const fontPath = path.resolve("./fonts/NotoSans-Regular.ttf");
    const fontBytes = fs.readFileSync(fontPath);

    // output as Uint8Array, we'll convert to Buffer for response if needed
    let outputUint8: Uint8Array;

    // PDF gốc
    if (fileType === "application/pdf") {
      if (!isValidPDF(fileUint8)) {
        console.warn("File PDF không hợp lệ, trả nguyên file");
        outputUint8 = fileUint8;
      } else {
        const pdfDoc = await PDFDocument.load(fileUint8);
        pdfDoc.registerFontkit(fontkit);
        const font = await pdfDoc.embedFont(fontBytes);

        const page = pdfDoc.addPage([595, 842]);
        let y = 800;
        const margin = 50;
        const lineHeight = 22;

        const textTitle = `Tên đề xuất: ${proposal.title || "Không có tên"}`;
        y = drawWrappedText({
          page,
          text: textTitle,
          x: margin,
          y,
          maxWidth: page.getWidth() - margin * 2,
          font,
          size: 14,
          lineHeight: lineHeight,
        });

        const textDecreptios = `Mô tả: ${
          proposal.description || "Không có mô tả"
        }`;
        y = drawWrappedText({
          page,
          text: textDecreptios,
          x: margin,
          y,
          maxWidth: page.getWidth() - margin * 2,
          font,
          size: 14,
          lineHeight: lineHeight,
        });
        y -= lineHeight;
        page.drawText(`Người tạo: ${proposal.proposer?.name || ""}`, {
          x: margin,
          y,
          size: 14,
          font,
        });
        y -= 40;

        page.drawText("Danh sách người ký:", { x: margin, y, size: 18, font });
        y -= 30;
        proposal.signers
          .filter((s) => s.status === "approved")
          .forEach((s) => {
            page.drawText(
              `- ${s.signer.name} • ${
                s.signedAt
                  ? dayjs(s.signedAt)
                      .tz("Asia/Ho_Chi_Minh")
                      .format("DD/MM/YYYY HH:mm")
                  : ""
              }`,
              { x: margin + 20, y, size: 14, font }
            );
            y -= lineHeight;
          });

        y -= 20;
        page.drawText("Danh sách người phê duyệt:", {
          x: margin,
          y,
          size: 18,
          font,
        });
        y -= 30;
        proposal.approvers
          .filter((a) => a.status === "approved")
          .forEach((a) => {
            page.drawText(
              `- ${a.approver.name} • ${
                a.approvedAt
                  ? dayjs(a.approvedAt)
                      .tz("Asia/Ho_Chi_Minh")
                      .format("DD/MM/YYYY HH:mm")
                  : ""
              }`,
              { x: margin + 20, y, size: 14, font }
            );
            y -= lineHeight;
          });

        const saved = await pdfDoc.save(); // Uint8Array
        outputUint8 = saved;
      }
    }
    // Ảnh -> PDF (sharp)
    else if (
      fileType === "image/png" ||
      fileType === "image/jpeg" ||
      fileType === "image/webp"
    ) {
      const sharp = await import("sharp").then((m) => m.default);

      // tạo Buffer cho sharp; ép kiểu triệt để về Buffer bằng as unknown as Buffer
      // (điểm quan trọng: Buffer.from(...) được cast để tránh TS2322)
      const fileBuffer = Buffer.from(fileUint8) as unknown as Buffer;

      let imageBuffer: Buffer = fileBuffer;
      try {
        if (fileType === "image/webp") {
          // convert to png (sharp returns Buffer)
          // sharp() returns Buffer which has no problematic generic
          imageBuffer = (await sharp(fileBuffer).png().toBuffer()) as Buffer;
        } else {
          imageBuffer = (await sharp(fileBuffer).png().toBuffer()) as Buffer;
        }
      } catch (err) {
        console.warn(
          "Sharp conversion failed, fallback to original buffer:",
          err
        );
        imageBuffer = fileBuffer;
      }

      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const font = await pdfDoc.embedFont(fontBytes);

      const page1 = pdfDoc.addPage();

      let img;
      try {
        // embedJpg will throw if buffer is PNG; catch and fallback
        img = await pdfDoc.embedJpg(imageBuffer);
      } catch {
        img = await pdfDoc.embedPng(imageBuffer);
      }

      const { width, height } = img.scale(1);
      page1.setSize(width, height);
      page1.drawImage(img, { x: 0, y: 0, width, height });

      const page2 = pdfDoc.addPage([595, 842]);
      let y = 800;
      const margin = 50;
      const lineHeight = 22;

      const textTitle = `Tên đề xuất: ${proposal.title || "Không có tên"}`;
      y = drawWrappedText({
        page: page2,
        text: textTitle,
        x: margin,
        y,
        maxWidth: page2.getWidth() - margin * 2,
        font,
        size: 14,
        lineHeight: lineHeight,
      });

      const textDecreptios = `Mô tả: ${
        proposal.description || "Không có mô tả"
      }`;
      y = drawWrappedText({
        page: page2,
        text: textDecreptios,
        x: margin,
        y,
        maxWidth: page2.getWidth() - margin * 2,
        font,
        size: 14,
        lineHeight: lineHeight,
      });
      y -= lineHeight;
      page2.drawText(`Người tạo: ${proposal.proposer?.name || ""}`, {
        x: margin,
        y,
        size: 14,
        font,
      });
      y -= 40;

      page2.drawText("Danh sách người ký:", { x: margin, y, size: 18, font });
      y -= 30;
      proposal.signers
        .filter((s) => s.status === "approved")
        .forEach((s) => {
          page2.drawText(
            `- ${s.signer.name} • ${
              s.signedAt
                ? dayjs(s.signedAt)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("DD/MM/YYYY HH:mm")
                : ""
            }`,
            { x: margin + 20, y, size: 14, font }
          );
          y -= lineHeight;
        });

      y -= 20;
      page2.drawText("Danh sách người phê duyệt:", {
        x: margin,
        y,
        size: 18,
        font,
      });
      y -= 30;
      proposal.approvers
        .filter((a) => a.status === "approved")
        .forEach((a) => {
          page2.drawText(
            `- ${a.approver.name} • ${
              a.approvedAt
                ? dayjs(a.approvedAt)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("DD/MM/YYYY HH:mm")
                : ""
            }`,
            { x: margin + 20, y, size: 14, font }
          );
          y -= lineHeight;
        });

      const saved = await pdfDoc.save();
      outputUint8 = saved;
    }
    // Word -> trả nguyên
    else if (
      fileType.includes("officedocument") ||
      fileType.includes("msword")
    ) {
      outputUint8 = fileUint8;
    } else {
      return NextResponse.json(
        { success: false, error: "Loại file không hỗ trợ" },
        { status: 400 }
      );
    }

    // đổi tên file cho image -> .pdf
    let encodedFileName = encodeURIComponent(
      proposal.file.filename || "file.pdf"
    );
    if (
      fileType === "image/png" ||
      fileType === "image/jpeg" ||
      fileType === "image/webp"
    ) {
      encodedFileName = encodedFileName.replace(
        /\.(jpg|jpeg|png|webp)$/i,
        ".pdf"
      );
    }

    // Trả về — NextResponse chấp nhận Uint8Array; nếu bạn muốn Buffer, chuyển Buffer.from(outputUint8)
    // ĐỂ TRÁNH MỌI LỖI GENERIC, ta không ép kiểu Buffer ở đây — dùng Uint8Array trực tiếp.
    const responseBody = Buffer.from(outputUint8) as unknown as BodyInit;

    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        "Content-Type":
          fileType.includes("officedocument") || fileType.includes("msword")
            ? fileType
            : "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
      },
    });
  } catch (err) {
    console.error("getProposal error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy thông tin đề xuất" },
      { status: 500 }
    );
  }
}
