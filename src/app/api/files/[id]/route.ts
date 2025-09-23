/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.json({ message: "Không có token" }, { status: 401 });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number };
  } catch {
    return NextResponse.json({ message: "Token không hợp lệ" }, { status: 401 });
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

    if (!proposal) return NextResponse.json({ success: false, error: "Không tìm thấy đề xuất" }, { status: 404 });
    if (!proposal.file) return NextResponse.json({ success: false, error: "File không tồn tại" }, { status: 404 });

    const fileData = Buffer.from(proposal.file.data);
    const fileType = proposal.file.mimeType;

    // Tải font
    const fontPath = path.resolve("./fonts/NotoSans-Regular.ttf");
    const fontBytes = fs.readFileSync(fontPath);

    let pdfBytes: Uint8Array;

    if (fileType === "application/pdf") {
      // PDF gốc
      const pdfDoc = await PDFDocument.load(fileData);
      pdfDoc.registerFontkit(fontkit);
      const font = await pdfDoc.embedFont(fontBytes);

      // Thêm trang cuối
      const page = pdfDoc.addPage([595, 842]); // A4
      let y = 800;
      const margin = 50;
      const lineHeight = 22;

      // Thông tin proposal
      page.drawText(`Tên đề xuất: ${proposal.title || "Không có tên"}`, { x: margin, y, size: 14, font, color: rgb(0,0,0) });
      y -= lineHeight;
      page.drawText(`Người tạo: ${proposal.proposer?.name || ""}`, { x: margin, y, size: 14, font, color: rgb(0,0,0) });
      y -= 40;

      // Danh sách ký
      page.drawText("Danh sách người ký:", { x: margin, y, size: 18, font, color: rgb(0,0,0) });
      y -= 30;
      proposal.signers.filter(s => s.status === "approved").forEach(s => {
        page.drawText(`- ${s.signer.name} • ${s.signedAt?.toLocaleDateString() || ""}`, { x: margin+20, y, size: 14, font, color: rgb(0,0,0) });
        y -= lineHeight;
      });

      y -= 20;
      page.drawText("Danh sách người phê duyệt:", { x: margin, y, size: 18, font, color: rgb(0,0,0) });
      y -= 30;
      proposal.approvers.filter(a => a.status === "approved").forEach(a => {
        page.drawText(`- ${a.approver.name} • ${a.approvedAt?.toLocaleDateString() || ""}`, { x: margin+20, y, size: 14, font, color: rgb(0,0,0) });
        y -= lineHeight;
      });

      pdfBytes = await pdfDoc.save();

    } else if (fileType === "image/png" || fileType === "image/jpeg") {
      // Ảnh -> tạo PDF
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const font = await pdfDoc.embedFont(fontBytes);

      // Trang ảnh
      const page1 = pdfDoc.addPage();
      const img = await pdfDoc.embedJpg(fileData).catch(() => pdfDoc.embedPng(fileData));
      const { width, height } = img.scale(1);
      page1.setSize(width, height);
      page1.drawImage(img, { x: 0, y: 0, width, height });

      // Trang chữ ký/info
      const page2 = pdfDoc.addPage([595, 842]);
      let y = 800;
      const margin = 50;
      const lineHeight = 22;

      page2.drawText(`Tên đề xuất: ${proposal.title || "Không có tên"}`, { x: margin, y, size: 14, font, color: rgb(0,0,0) });
      y -= lineHeight;
      page2.drawText(`Người tạo: ${proposal.proposer?.name || ""}`, { x: margin, y, size: 14, font, color: rgb(0,0,0) });
      y -= 40;

      page2.drawText("Danh sách người ký:", { x: margin, y, size: 18, font, color: rgb(0,0,0) });
      y -= 30;
      proposal.signers.filter(s => s.status === "approved").forEach(s => {
        page2.drawText(`- ${s.signer.name} • ${s.signedAt?.toLocaleDateString() || ""}`, { x: margin+20, y, size: 14, font, color: rgb(0,0,0) });
        y -= lineHeight;
      });

      y -= 20;
      page2.drawText("Danh sách người phê duyệt:", { x: margin, y, size: 18, font, color: rgb(0,0,0) });
      y -= 30;
      proposal.approvers.filter(a => a.status === "approved").forEach(a => {
        page2.drawText(`- ${a.approver.name} • ${a.approvedAt?.toLocaleDateString() || ""}`, { x: margin+20, y, size: 14, font, color: rgb(0,0,0) });
        y -= lineHeight;
      });

      pdfBytes = await pdfDoc.save();

    } else {
      return NextResponse.json({ success: false, error: "Loại file không hỗ trợ" }, { status: 400 });
    }

    const encodedFileName = encodeURIComponent(proposal.file.filename?.replace(/\.(jpg|png)$/i, ".pdf") || "file.pdf");

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
      },
    });

  } catch (error) {
    console.error("getProposal error:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi lấy thông tin đề xuất" }, { status: 500 });
  }
}
