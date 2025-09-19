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
  const id = (await params).id;
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ message: "Không có token" }, { status: 401 });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number };
  } catch {
    return NextResponse.json({ message: "Token không hợp lệ" }, { status: 401 });
  }

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: Number(id) },
      include: {
        proposer: true,
        signers: { include: { signer: true } },
        approvers: { include: { approver: true } },
        file: true,
      },
    });

    if (!proposal)
      return NextResponse.json({ success: false, error: "Không tìm thấy đề xuất" }, { status: 404 });

    // Nếu muốn check quyền thì bật lại đoạn này
    // const isSigner = proposal.signers.some(s => s.signerId === decoded.id);
    // if (!decoded.id || !isSigner)
    //   return NextResponse.json({ success: false, error: "Bạn không có quyền xem đề xuất này" }, { status: 403 });

    if (!proposal.file) return new NextResponse("File not found", { status: 404 });

    const existingPdfBytes = Buffer.from(proposal.file.data);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Đăng ký font Unicode
    pdfDoc.registerFontkit(fontkit);
    const fontPath = path.resolve("./fonts/NotoSans-Regular.ttf");
    const fontBytes = fs.readFileSync(fontPath);
    const font = await pdfDoc.embedFont(fontBytes);

    // Thêm trang cuối A4
    let page = pdfDoc.addPage([595, 842]); // A4 portrait
    const width = page.getWidth();
    const height = page.getHeight();
    const margin = 50;
    let y = height - margin;

    const titleSize = 18;
    const nameSize = 14;
    const lineHeight = 22;

    // ===== Thông tin đề xuất =====
    page.drawText(`Tên đề xuất: ${proposal.title || "Không có tên"}`, {
      x: margin,
      y,
      size: nameSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;

    page.drawText(
      `Người tạo: ${proposal.proposer?.name || ""} (${proposal.proposer?.employeeCode || ""})`,
      {
        x: margin,
        y,
        size: nameSize,
        font,
        color: rgb(0, 0, 0),
      }
    );
    y -= 40;

    // ===== Danh sách ký =====
    page.drawText("Danh sách người ký", {
      x: margin,
      y,
      size: titleSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    const signers = proposal.signers.filter((s) => s.status === "approved");
    for (const signer of signers) {
      if (y < margin) {
        // Nếu hết trang thì thêm trang mới
        page = pdfDoc.addPage([595, 842]);
        y = height - margin;
      }

      page.drawText(
        `- ${signer.signer.name} (${signer.signer.employeeCode || ""}) • ${signer.signedAt?.toLocaleDateString() || ""
        }`,
        { x: margin + 20, y, size: nameSize, font, color: rgb(0, 0, 0) }
      );
      y -= lineHeight;
    }

    y -= 30;

    // ===== Danh sách phê duyệt =====
    page.drawText("Danh sách người phê duyệt", {
      x: margin,
      y,
      size: titleSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    const approvers = proposal.approvers.filter((a) => a.status === "approved");
    for (const approver of approvers) {
      if (y < margin) {
        page = pdfDoc.addPage([595, 842]);
        y = height - margin;
      }

      page.drawText(
        `- ${approver.approver.name} (${approver.approver.employeeCode || ""}) • ${approver.approvedAt?.toLocaleDateString() || ""
        }`,
        { x: margin + 20, y, size: nameSize, font, color: rgb(0, 0, 0) }
      );
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    const encodedFileName = encodeURIComponent(proposal.file.filename || "file.pdf");

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
