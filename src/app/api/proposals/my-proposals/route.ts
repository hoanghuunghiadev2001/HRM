/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json(
        { error: "Thiếu token xác thực" },
        { status: 401 }
      );

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    const employeeId = decoded.id;
    const role = decoded.role;

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * pageSize;

    const searchFilter = search
      ? { title: { contains: search} }
      : {};

    // ================= CREATED PROPOSALS =================
    const createdWhere =
      role === "ADMIN"
        ? { ...searchFilter } // ADMIN xem tất cả
        : {
            AND: [
              searchFilter,
              {
                OR: [
                  { createdById: employeeId },
                  { signers: { some: { signerId: employeeId } } },
                  { approvers: { some: { approverId: employeeId } } },
                ],
              },
            ],
          };

    const [created, createdTotal] = await Promise.all([
      prisma.proposal.findMany({
        where: createdWhere,
        include: defaultInclude(),
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.proposal.count({ where: createdWhere }),
    ]);

    // ================= NEED TO SIGN =================
    const need_to_sign_all = await prisma.proposal.findMany({
      where: {
        ...searchFilter,
        signers: { some: { status: "pending", signerId: employeeId } }, // chỉ proposal có employeeId trong danh sách signer
      },
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

    // ================= NEED TO APPROVE =================
    const need_to_approve_all = await prisma.proposal.findMany({
      where: {
        ...searchFilter,
        status: "waiting_approval",
        approvers: { some: { status: "pending", approverId: employeeId } }, // chỉ proposal có employeeId trong danh sách approver
      },
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
      search,
      created: { data: created, total: createdTotal },
      need_to_sign: { data: need_to_sign, total: needToSignTotal },
      need_to_approve: { data: need_to_approve, total: needToApproveTotal },
    });
  } catch (error) {
    console.error("Lỗi khi lấy proposal:", error);
    return NextResponse.json(
      { message: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}

// ================= DEFAULT INCLUDE =================
function defaultInclude() {
  return {
    file: { select: { id: true, filename: true, mimeType: true, fileSize: true } },
    proposer: { select: { id: true, name: true, employeeCode: true } },
    createdBy: { select: { id: true, name: true, employeeCode: true } },
    signers: {
      select: {
        level: true,
        status: true,
        signer: { select: { id: true, name: true, employeeCode: true } },
      },
    },
    approvers: {
      select: {
        level: true,
        status: true,
        approver: { select: { id: true, name: true, employeeCode: true } },
      },
    },
  };
}
