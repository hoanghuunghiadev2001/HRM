/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper: Chuẩn hóa dữ liệu sang Uint8Array
function normalizeToUint8Array(input: unknown): Uint8Array {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(input))
    return new Uint8Array(input);
  if (Array.isArray(input)) return Uint8Array.from(input);
  return new Uint8Array(Buffer.from(input as any));
}

// Helper: Vẽ văn bản tự xuống dòng (Cải tiến hỗ trợ trả về tọa độ Y mới)
function drawWrappedText({
  page,
  text,
  x,
  y,
  maxWidth,
  font,
  size = 12,
  lineHeight,
  color = rgb(0, 0, 0),
}: any) {
  if (!text) return y;
  if (!lineHeight) lineHeight = Math.round(size * 1.3);
  const paragraphs = text.split(/\r?\n/);
  let currentY = y;

  for (const para of paragraphs) {
    const words = para.split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, size);
      if (width > maxWidth) {
        page.drawText(line, { x, y: currentY, size, font, color });
        currentY -= lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x, y: currentY, size, font, color });
      currentY -= lineHeight;
    }
  }
  return currentY;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  const token =
    req.cookies.get("token-hrm")?.value ||
    req.headers.get("authorization")?.split(" ")[1];

  if (!token)
    return NextResponse.json(
      { message: "Không có quyền truy cập" },
      { status: 401 },
    );

  try {
    jwt.verify(token, JWT_SECRET);

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        proposer: true,
        signers: { include: { signer: true }, orderBy: { level: "asc" } },
        approvers: { include: { approver: true }, orderBy: { level: "asc" } },
        files: true,
        vehicle: true,
      },
    });

    if (!proposal)
      return NextResponse.json(
        { error: "Đề xuất không tồn tại" },
        { status: 404 },
      );

    let filesToProcess = proposal.files || [];

    if (filesToProcess.length === 0 && (proposal as any).fileId) {
      const legacyFile = await prisma.file.findUnique({
        where: { id: (proposal as any).fileId },
      });
      if (legacyFile) filesToProcess = [legacyFile];
    }

    // Khởi tạo PDF
    const mergedPdf = await PDFDocument.create();
    mergedPdf.registerFontkit(fontkit);

    // Load Fonts (Đảm bảo đường dẫn chính xác)
    const fontRegular = await mergedPdf.embedFont(
      fs.readFileSync(path.resolve("./fonts/NotoSans-Regular.ttf")),
    );
    const fontBold = await mergedPdf.embedFont(
      fs.readFileSync(path.resolve("./fonts/NotoSans-Bold.ttf")),
    );

    const margin = 50;
    const pageWidth = 595.28; // A4
    const pageHeight = 841.89;
    const mainBlue = rgb(0.05, 0.23, 0.45); // Màu xanh chuyên nghiệp

    // --- BƯỚC 1: TẠO TRANG TÓM TẮT ---
    const currentPage = mergedPdf.addPage([pageWidth, pageHeight]);
    let currentY = 780;

    // Vẽ Border trang
    currentPage.drawRectangle({
      x: 25,
      y: 25,
      width: pageWidth - 50,
      height: pageHeight - 50,
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 1,
    });

    // 1. Tiêu đề chính (Xử lý xuống dòng)
    currentY = drawWrappedText({
      page: currentPage,
      text: proposal.title.toUpperCase(),
      x: margin,
      y: currentY,
      maxWidth: pageWidth - margin * 2,
      font: fontBold,
      size: 16,
      color: mainBlue,
      lineHeight: 22,
    });

    currentY -= 10;
    currentPage.drawLine({
      start: { x: margin, y: currentY },
      end: { x: pageWidth - margin, y: currentY },
      thickness: 2,
      color: mainBlue,
    });
    currentY -= 30;

    // 2. Thông tin chung (Dạng Grid nhẹ)
    const drawMeta = (label: string, value: string) => {
      currentPage.drawText(label, {
        x: margin,
        y: currentY,
        size: 10,
        font: fontBold,
        color: rgb(0.4, 0.4, 0.4),
      });
      currentPage.drawText(value || "---", {
        x: margin + 110,
        y: currentY,
        size: 10,
        font: fontRegular,
      });
      currentY -= 18;
    };

    drawMeta("Mã hồ sơ:", `REQ-${proposal.id.toString().padStart(5, "0")}`);
    drawMeta("Người đề xuất:", proposal.proposer?.name || "N/A");
    drawMeta(
      "Ngày tạo:",
      dayjs(proposal.createdAt)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm"),
    );
    if (proposal.vehicle) {
      drawMeta("Phương tiện:", (proposal.vehicle as any).plateNumber);
    }
    currentY -= 10;

    // 3. Nội dung mô tả
    if (proposal.description) {
      currentPage.drawRectangle({
        x: margin,
        y: currentY - 5,
        width: 100,
        height: 16,
        color: rgb(0.9, 0.93, 0.95),
      });
      currentPage.drawText("MÔ TẢ CHI TIẾT", {
        x: margin + 5,
        y: currentY,
        size: 9,
        font: fontBold,
        color: mainBlue,
      });
      currentY -= 20;

      currentY = drawWrappedText({
        page: currentPage,
        text: proposal.description,
        x: margin,
        y: currentY,
        maxWidth: pageWidth - margin * 2,
        font: fontRegular,
        size: 11,
        lineHeight: 16,
      });
    }

    // 4. Danh sách phê duyệt (Dạng Timeline)
    currentY -= 30;
    currentPage.drawText("TIẾN TRÌNH PHÊ DUYỆT", {
      x: margin,
      y: currentY,
      size: 12,
      font: fontBold,
      color: mainBlue,
    });
    currentY -= 15;

    const participants = [
      ...proposal.signers.map((s) => ({
        name: s.signer.name,
        role: "Người ký",
        status: s.status,
        date: s.signedAt,
      })),
      ...proposal.approvers.map((a) => ({
        name: a.approver.name,
        role: "Người duyệt",
        status: a.status,
        date: a.approvedAt,
      })),
    ];

    participants.forEach((p) => {
      let statusLabel = "ĐANG CHỜ";
      if (p.status === "approved") {
        statusLabel = "ĐÃ DUYỆT";
      }
      if (p.status === "rejected") {
        statusLabel = "TỪ CHỐI";
      }

      currentPage.drawText(`${p.role}: ${p.name}`, {
        x: margin + 15,
        y: currentY,
        size: 10,
        font: fontRegular,
      });

      const timeStr = p.date
        ? dayjs(p.date).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm")
        : "---";
      const rightText = `${statusLabel} | ${timeStr}`;
      const rightTextWidth = fontRegular.widthOfTextAtSize(rightText, 9);

      currentPage.drawText(rightText, {
        x: pageWidth - margin - rightTextWidth,
        y: currentY,
        size: 9,
        font: fontRegular,
      });
      currentY -= 18;
    });

    // --- BƯỚC 2: GỘP CÁC FILE ĐÍNH KÈM ---
    if (filesToProcess.length > 0) {
      for (const fileRecord of filesToProcess) {
        try {
          const fileData = normalizeToUint8Array(fileRecord.data);
          if (fileRecord.mimeType === "application/pdf") {
            const sourcePdf = await PDFDocument.load(fileData);
            const copiedPages = await mergedPdf.copyPages(
              sourcePdf,
              sourcePdf.getPageIndices(),
            );
            copiedPages.forEach((p) => mergedPdf.addPage(p));
          } else if (fileRecord.mimeType.startsWith("image/")) {
            const img =
              fileRecord.mimeType === "image/png"
                ? await mergedPdf.embedPng(fileData)
                : await mergedPdf.embedJpg(fileData);
            const imgPage = mergedPdf.addPage([pageWidth, pageHeight]);
            const dims = img.scaleToFit(
              pageWidth - margin * 2,
              pageHeight - margin * 2,
            );
            imgPage.drawImage(img, {
              x: (pageWidth - dims.width) / 2,
              y: (pageHeight - dims.height) / 2,
              width: dims.width,
              height: dims.height,
            });
          }
        } catch (err) {
          console.error(`Error processing file ${fileRecord.filename}:`, err);
        }
      }
    }

    // --- BƯỚC 3: FOOTER & MÃ XÁC THỰC ---
    const totalPages = mergedPdf.getPageCount();
    const shaCode = `TBD${dayjs(proposal.createdAt).format("YYYYMM")}${proposal.id}`;

    mergedPdf.getPages().forEach((page, index) => {
      // Watermark chìm (Tùy chọn)
      page.drawText("HỆ THỐNG QUẢN TRỊ TOYOTA", {
        x: pageWidth / 2 - 100,
        y: pageHeight / 2,
        size: 30,
        rotate: degrees(45), // Sử dụng hàm chuẩn của thư viện
        opacity: 0.3,
        font: fontBold,
        color: rgb(0.95, 0.95, 0.95),
      });

      page.drawText(
        `Mã xác thực: ${shaCode} | Hệ thống HRM Toyota Binh Duong`,
        {
          x: margin,
          y: 20,
          size: 7,
          font: fontRegular,
          color: rgb(1, 1, 1),
        },
      );

      const pageText = `Trang ${index + 1} / ${totalPages}`;
      const textWidth = fontRegular.widthOfTextAtSize(pageText, 7);
      page.drawText(pageText, {
        x: pageWidth - margin - textWidth,
        y: 20,
        size: 7,
        font: fontRegular,
        color: rgb(1, 1, 1),
      });
    });

    const pdfBytes = await mergedPdf.save();
    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="HS-${proposal.id}-${dayjs().format("DDMMYY")}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Export Error:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xuất file" },
      { status: 500 },
    );
  }
}
