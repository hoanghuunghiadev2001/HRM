/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const  id  = (await params).id;

  const cookieStore = req.cookies;
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Không có token" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number };
  } catch (err) {
    return NextResponse.json({ message: "Token không hợp lệ" }, { status: 401 });
  }

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: id ? Number(id) : undefined },
      include: {
        proposer: true,
        signers: { include: { signer: true } },
        approvers: { include: { approver: true } },
      },
    });

    if (!proposal) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đề xuất" }, { status: 404 });
    }
const isSigner = proposal.signers.some(s => s.signerId === decoded.id)
console.log(isSigner);

    if (!decoded.id || !isSigner ) {
      return NextResponse.json({ success: false, error: "Bạn không có quyền xem đề xuất này" }, { status: 403 });
    }

    const file = await prisma.proposal.findUnique({
      where: { id: Number(id) },
      select: { file: true },
    });

    if (!file || !file.file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const buffer = Buffer.from(file.file.data);
    const encodedFileName = encodeURIComponent(file.file.filename || "file.pdf");

    return new NextResponse(buffer, {
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
