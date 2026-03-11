/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { PDFDocument, rgb } from "pdf-lib";
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

// Helper: Vẽ văn bản tự xuống dòng
function drawWrappedText({
  page,
  text,
  x,
  y,
  maxWidth,
  font,
  size = 12,
  lineHeight,
}: any) {
  if (!lineHeight) lineHeight = Math.round(size * 1.3);
  const paragraphs = text.split(/\r?\n/);
  for (const para of paragraphs) {
    const words = para.split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, size);
      if (width > maxWidth) {
        page.drawText(line, { x, y, size, font });
        y -= lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x, y, size, font });
      y -= lineHeight;
    }
  }
  return y;
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
        files: true, // Lấy toàn bộ mảng file theo schema mới
        vehicle: true,
      },
    });

    if (!proposal)
      return NextResponse.json(
        { error: "Đề xuất không tồn tại" },
        { status: 404 },
      );

    // Khởi tạo file PDF đích
    const mergedPdf = await PDFDocument.create();
    mergedPdf.registerFontkit(fontkit);
    const fontRegular = await mergedPdf.embedFont(
      fs.readFileSync(path.resolve("./fonts/NotoSans-Regular.ttf")),
    );
    const fontBold = await mergedPdf.embedFont(
      fs.readFileSync(path.resolve("./fonts/NotoSans-Bold.ttf")),
    );

    const margin = 50;
    const pageWidth = 595.28; // A4
    const pageHeight = 841.89;

    // --- BƯỚC 1: TẠO TRANG TÓM TẮT (SUMMARY PAGE) ---
    const currentPage = mergedPdf.addPage([pageWidth, pageHeight]);
    let currentY = 780;

    currentPage.drawText(`${proposal.title}`, {
      x: margin,
      y: currentY,
      size: 18,
      font: fontBold,
    });
    currentY -= 40;

    const summaryInfo = [
      `Người đề xuất: ${proposal.proposer?.name}`,
      `Ngày tạo: ${dayjs(proposal.createdAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm")}`,
    ];

    summaryInfo.forEach((text) => {
      currentPage.drawText(text, {
        x: margin,
        y: currentY,
        size: 12,
        font: fontRegular,
      });
      currentY -= 20;
    });

    if (proposal.description) {
      currentY -= 10;
      currentPage.drawText("Mô tả nội dung:", {
        x: margin,
        y: currentY,
        size: 12,
        font: fontBold,
      });
      currentY -= 18;
      currentY = drawWrappedText({
        page: currentPage,
        text: proposal.description,
        x: margin + 10,
        y: currentY,
        maxWidth: pageWidth - margin * 2 - 10,
        font: fontRegular,
      });
    }

    // Vẽ danh sách người ký/duyệt
    currentY -= 20;
    currentPage.drawText("DANH SÁCH PHÊ DUYỆT:", {
      x: margin,
      y: currentY,
      size: 13,
      font: fontBold,
    });
    currentY -= 20;

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
      const statusText =
        p.status === "approved"
          ? "ĐÃ DUYỆT"
          : p.status === "rejected"
            ? "TỪ CHỐI"
            : "CHỜ DUYỆT";
      const dateText = p.date ? dayjs(p.date).format("DD/MM/YYYY HH:mm") : "";
      currentPage.drawText(
        `- ${p.role}: ${p.name} [${statusText}] ${dateText}`,
        { x: margin + 10, y: currentY, size: 11, font: fontRegular },
      );
      currentY -= 18;
    });

    // --- BƯỚC 2: GỘP CÁC FILE ĐÍNH KÈM ---
    if (proposal.files && proposal.files.length > 0) {
      for (const fileRecord of proposal.files) {
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
          console.error(`Lỗi xử lý file ${fileRecord.filename}:`, err);
        }
      }
    }

    // --- BƯỚC 3: ĐÓNG DẤU CHÂN TRANG (FOOTER) TOÀN BỘ FILE ---
    const totalPages = mergedPdf.getPageCount();
    const shaCode = `TBD${dayjs(proposal.createdAt).format("YYYYMM")}${proposal.id}`;

    mergedPdf.getPages().forEach((page, index) => {
      page.drawText(`Mã xác thực: ${shaCode}`, {
        x: margin,
        y: 20,
        size: 8,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });
      const pageText = `Trang ${index + 1} / ${totalPages}`;
      const textWidth = fontRegular.widthOfTextAtSize(pageText, 8);
      page.drawText(pageText, {
        x: pageWidth - margin - textWidth,
        y: 20,
        size: 8,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });
    });

    const pdfBytes = await mergedPdf.save();
    const pdfBuffer = Buffer.from(pdfBytes); // Chuyển từ Uint8Array sang Buffer

    return new Response(pdfBuffer, {
      // TypeScript sẽ không còn báo lỗi
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Ho_So_TBD_${proposal.id}.pdf"`,
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
