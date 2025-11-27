/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import crypto from "crypto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function normalizeToUint8Array(input: unknown): Uint8Array {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (typeof Buffer !== "undefined" && (Buffer as any).isBuffer(input)) {
    return new Uint8Array(input as Uint8Array);
  }
  if (typeof input === "object" && input !== null) {
    try {
      const maybe = input as { byteLength?: number; [k: string]: any };
      if (typeof maybe.byteLength === "number") {
        const tmp = Buffer.from(maybe as any);
        return new Uint8Array(tmp);
      }
    } catch {}
  }
  if (Array.isArray(input)) return Uint8Array.from(input as number[]);
  try {
    const tmp = Buffer.from(input as any);
    return new Uint8Array(tmp);
  } catch (err) {
    throw new Error(
      "Không thể chuẩn hoá dữ liệu file sang Uint8Array: " +
        (err as Error).message
    );
  }
}

function drawWrappedText({
  page,
  text,
  x,
  y,
  maxWidth,
  font,
  size = 12,
  lineHeight,
}: {
  page: any;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  font: any;
  size?: number;
  lineHeight?: number;
}) {
  if (!lineHeight) lineHeight = Math.round(size * 1.3);
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
          page.drawText(line, { x, y, size, font });
          y -= lineHeight;
          line = word;
        } else {
          let fragment = "";
          for (const ch of word) {
            const testFrag = fragment + ch;
            const fragWidth = font.widthOfTextAtSize(testFrag, size);
            if (fragWidth > maxWidth) {
              if (fragment) {
                page.drawText(fragment, { x, y, size, font });
                y -= lineHeight;
              }
              fragment = ch;
            } else {
              fragment = testFrag;
            }
          }
          if (fragment) {
            page.drawText(fragment, { x, y, size, font });
            y -= lineHeight;
          }
          line = "";
        }
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x, y, size, font });
      y -= lineHeight;
    }
    y -= Math.round(lineHeight * 0.1);
  }
  return y;
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

    if (!proposal || !proposal.file)
      return NextResponse.json(
        { success: false, error: "Không tìm thấy file đề xuất" },
        { status: 404 }
      );

    const fileUint8 = normalizeToUint8Array(proposal.file.data);
    const fileType = proposal.file.mimeType;

    const fontPath = path.resolve("./fonts/NotoSans-Regular.ttf");
    const fontBytes = fs.readFileSync(fontPath);

    // tạo hash xác thực (sha256 rút gọn 12 ký tự)
    const hashSource = JSON.stringify({
      id: proposal.id,
      name: proposal.name,
      title: proposal.title,
      description: proposal.description,
      proposerId: proposal.proposerId,
    });
    const fullSha = crypto
      .createHash("sha256")
      .update(hashSource)
      .digest("hex");
    const now = dayjs(proposal.createdAt).tz("Asia/Ho_Chi_Minh");
    const sha = `TBD${now.format("YYYYMM")}${proposal.id}`;

    let pdfDoc: PDFDocument;
    if (fileType === "application/pdf") {
      pdfDoc = await PDFDocument.load(fileUint8);
    } else {
      pdfDoc = await PDFDocument.create();
      if (fileType.startsWith("image/")) {
        const sharp = (await import("sharp")).default;
        const buf = Buffer.from(fileUint8);
        let pngBuf: Buffer = buf;
        try {
          pngBuf = (await sharp(buf).png().toBuffer()) as Buffer;
        } catch {}
        const img = await pdfDoc.embedPng(pngBuf);
        const p1 = pdfDoc.addPage([img.width, img.height]);
        p1.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
    }

    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBytes);

    const margin = 50;
    const lineHeight = 22;
    let page = pdfDoc.addPage([595, 842]);
    let y = 780;

    // Tên đề xuất
    const textTitle = `Tên đề xuất: ${proposal.title || "Không có tên"}`;
    y = drawWrappedText({
      page,
      text: textTitle,
      x: margin,
      y,
      maxWidth: 595 - margin * 2,
      font,
      size: 14,
      lineHeight,
    });

    // Mô tả
    const textDesc = `Mô tả: ${proposal.description || "Không có mô tả"}`;
    y = drawWrappedText({
      page,
      text: textDesc,
      x: margin,
      y,
      maxWidth: 595 - margin * 2,
      font,
      size: 12,
      lineHeight,
    });
    y -= 15;

    // Người tạo
    page.drawText("Người tạo: " + (proposal.proposer?.name || ""), {
      x: margin,
      y,
      size: 14,
      font,
    });
    y -= 15;

    // Hàm vẽ danh sách người ký
    function drawSignersList(page: any, signers: any[], y: number) {
      page.drawText("Danh sách người ký:", { x: margin, y, size: 14, font });
      y -= 15;

      for (const s of signers.filter((s) => s.status === "approved")) {
        page.drawText(
          `- ${s.signer.name} • ${
            s.signedAt
              ? dayjs(s.signedAt)
                  .tz("Asia/Ho_Chi_Minh")
                  .format("DD/MM/YYYY HH:mm")
              : ""
          }`,
          { x: margin + 20, y, size: 12, font }
        );
        y -= 18;

        if (y < 120) {
          page = pdfDoc.addPage([595, 842]);
          y = 780;
          page.drawText("Danh sách người ký (tiếp):", {
            x: margin,
            y,
            size: 14,
            font,
          });
          y -= 20;
        }
      }
      return { page, y };
    }

    // Hàm vẽ danh sách người phê duyệt
    function drawApproversList(page: any, approvers: any[], y: number) {
      page.drawText("Danh sách người phê duyệt:", {
        x: margin,
        y,
        size: 14,
        font,
      });
      y -= 20;

      for (const a of approvers.filter((a) => a.status === "approved")) {
        page.drawText(
          `- ${a.approver.name} • ${
            a.approvedAt
              ? dayjs(a.approvedAt)
                  .tz("Asia/Ho_Chi_Minh")
                  .format("DD/MM/YYYY HH:mm")
              : ""
          }`,
          { x: margin + 20, y, size: 12, font }
        );
        y -= 18;

        if (y < 120) {
          page = pdfDoc.addPage([595, 842]);
          y = 780;
          page.drawText("Danh sách người phê duyệt (tiếp):", {
            x: margin,
            y,
            size: 14,
            font,
          });
          y -= 20;
        }
      }
      return { page, y };
    }
    const headerColor = rgb(0.33, 0.33, 0.33);
    // Vẽ danh sách ký và phê duyệt
    let result = drawSignersList(page, proposal.signers, y);
    page = result.page;
    y = result.y;

    result = drawApproversList(page, proposal.approvers, y);
    page = result.page;
    y = result.y;

    // Header cho tất cả trang
    const pages = pdfDoc.getPages();
    const dateStr = dayjs().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const pWidth = p.getWidth();
      const pHeight = p.getHeight();
      const headerY = pHeight - 25;

      const leftText = `Mã xác thực: ${sha}`;
      const rightText = `Ngày xuất: ${dateStr} | Trang ${i + 1}/${
        pages.length
      }`;

      const rightWidth = font.widthOfTextAtSize(rightText, 10);
      p.drawText(leftText, {
        x: margin,
        y: headerY,
        size: 8,
        font,
        color: headerColor,
      });
      p.drawText(rightText, {
        x: pWidth - margin - rightWidth,
        y: headerY,
        size: 8,
        font,
        color: headerColor,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proposal_${proposal.id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("getProposal error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
