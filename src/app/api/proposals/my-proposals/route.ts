/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Thiếu token xác thực" }, { status: 401 });
    }

    let employeeId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      employeeId = decoded.id;
    } catch {
      return NextResponse.json({ error: "Token không hợp lệ hoặc đã hết hạn" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const skip = (page - 1) * pageSize;

    // 1. Proposal đã tạo / tham gia
    const created = await prisma.proposal.findMany({
      where: {
        OR: [
          { createdById: employeeId },
          { signers: { some: { signerId: employeeId } } },
          { approvers: { some: { approverId: employeeId } } },
        ],
      },
      include: defaultInclude(),
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const createdTotal = await prisma.proposal.count({
      where: {
        OR: [
          { createdById: employeeId },
          { signers: { some: { signerId: employeeId } } },
          { approvers: { some: { approverId: employeeId } } },
        ],
      },
    });

    // 2. Proposal cần ký – chỉ tới **người ký hiện tại theo thứ tự**
    const need_to_sign_all = await prisma.proposal.findMany({
      where: { signers: { some: { status: "pending" } } },
      include: { ...defaultInclude(), signers: true },
    });

    const need_to_sign_filtered = need_to_sign_all.filter((p) => {
      const pendingSigners = p.signers.filter((s) => s.status === "pending");
      const minLevel = Math.min(...pendingSigners.map((s) => s.level));
      const currentSigner = pendingSigners.find((s) => s.level === minLevel);
      return currentSigner?.signerId === employeeId;
    });

    const needToSignTotal = need_to_sign_filtered.length;
    const need_to_sign = need_to_sign_filtered.slice(skip, skip + pageSize);

    // 3. Proposal cần phê duyệt – chỉ tới **approver hiện tại theo thứ tự**
    const need_to_approve_all = await prisma.proposal.findMany({
      where: { status: "waiting_approval", approvers: { some: { status: "pending" } } },
      include: { ...defaultInclude(), approvers: true },
    });

    const need_to_approve_filtered = need_to_approve_all.filter((p) => {
      const pendingApprovers = p.approvers.filter((a) => a.status === "pending");
      const minLevel = Math.min(...pendingApprovers.map((a) => a.level));
      const currentApprover = pendingApprovers.find((a) => a.level === minLevel);
      return currentApprover?.approverId === employeeId;
    });

    const needToApproveTotal = need_to_approve_filtered.length;
    const need_to_approve = need_to_approve_filtered.slice(skip, skip + pageSize);

    return NextResponse.json({
      page,
      pageSize,
      created: { data: created, total: createdTotal },
      need_to_sign: { data: need_to_sign, total: needToSignTotal },
      need_to_approve: { data: need_to_approve, total: needToApproveTotal },
    });
  } catch (error) {
    console.error("Lỗi khi lấy proposal:", error);
    return NextResponse.json({ message: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}

// Include mặc định
function defaultInclude() {
  return {
    file: true,
    proposer: { select: { id: true, name: true, employeeCode: true } },
    createdBy: { select: { id: true, name: true, employeeCode: true } },
    signers: {
      include: {
        signer: { select: { id: true, name: true, employeeCode: true } },
      },
    },
    approvers: {
      include: {
        approver: { select: { id: true, name: true, employeeCode: true } },
      },
    },
  };
}
