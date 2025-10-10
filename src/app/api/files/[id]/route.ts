/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Hàm kiểm tra PDF hợp lệ
function isValidPDF(buffer: Buffer): boolean {
  // PDF hợp lệ bắt đầu bằng "%PDF"
  return buffer.slice(0, 4).toString() === "%PDF";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  const token = req.cookies.get("token")?.value;

  if (!token)
    return NextResponse.json({ message: "Không có token" }, { status: 401 });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number };
  } catch {
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 }
    );
  }

  try {
    // Lấy proposal và file
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

    const fileData = Buffer.from(proposal.file.data);
    const fileType = proposal.file.mimeType;

    // Tải font
    const fontPath = path.resolve("./fonts/NotoSans-Regular.ttf");
    const fontBytes = fs.readFileSync(fontPath);

    let outputBytes: Uint8Array;

    // === PDF gốc ===
    if (fileType === "application/pdf") {
      if (!isValidPDF(fileData)) {
        console.warn("File PDF không hợp lệ, trả nguyên file");
        outputBytes = fileData;
      } else {
        const pdfDoc = await PDFDocument.load(fileData);
        pdfDoc.registerFontkit(fontkit);
        const font = await pdfDoc.embedFont(fontBytes);

        // Thêm trang info
        const page = pdfDoc.addPage([595, 842]);
        let y = 800;
        const margin = 50;
        const lineHeight = 22;

        page.drawText(`Tên đề xuất: ${proposal.title || "Không có tên"}`, {
          x: margin,
          y,
          size: 14,
          font,
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
              `- ${s.signer.name} • ${s.signedAt?.toLocaleDateString() || ""}`,
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
                a.approvedAt?.toLocaleDateString() || ""
              }`,
              { x: margin + 20, y, size: 14, font }
            );
            y -= lineHeight;
          });

        outputBytes = await pdfDoc.save();
      }
    }
    // === Ảnh JPG/PNG → PDF ===
    else if (fileType === "image/png" || fileType === "image/jpeg") {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const font = await pdfDoc.embedFont(fontBytes);

      const page1 = pdfDoc.addPage();
      const img = await pdfDoc
        .embedJpg(fileData)
        .catch(() => pdfDoc.embedPng(fileData));
      const { width, height } = img.scale(1);
      page1.setSize(width, height);
      page1.drawImage(img, { x: 0, y: 0, width, height });

      const page2 = pdfDoc.addPage([595, 842]);
      let y = 800;
      const margin = 50;
      const lineHeight = 22;

      page2.drawText(`Tên đề xuất: ${proposal.title || "Không có tên"}`, {
        x: margin,
        y,
        size: 14,
        font,
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
            `- ${s.signer.name} • ${s.signedAt?.toLocaleDateString() || ""}`,
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
              a.approvedAt?.toLocaleDateString() || ""
            }`,
            { x: margin + 20, y, size: 14, font }
          );
          y -= lineHeight;
        });

      outputBytes = await pdfDoc.save();
    }
    // === Word (.doc, .docx) ===
    else if (
      fileType.includes("officedocument") ||
      fileType.includes("msword")
    ) {
      outputBytes = fileData;
    } else {
      return NextResponse.json(
        { success: false, error: "Loại file không hỗ trợ" },
        { status: 400 }
      );
    }

    // Chuẩn bị tên file
    let encodedFileName = encodeURIComponent(
      proposal.file.filename || "file.pdf"
    );
    if (fileType === "image/png" || fileType === "image/jpeg") {
      encodedFileName = encodedFileName.replace(/\.(jpg|png)$/i, ".pdf");
    }

    // Trả file về client
    return new NextResponse(Buffer.from(outputBytes), {
      status: 200,
      headers: {
        "Content-Type":
          fileType.includes("officedocument") || fileType.includes("msword")
            ? fileType
            : "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
      },
    });
  } catch (error) {
    console.error("getProposal error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy thông tin đề xuất" },
      { status: 500 }
    );
  }
}
