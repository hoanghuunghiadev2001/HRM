/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function parseYMDToStart(ymd?: string) {
  if (!ymd) return undefined;
  const [y, m, d] = ymd.split("-").map((s) => Number(s));
  // new Date(year, monthIndex, day, hour, minute, second, ms)
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}
function parseYMDToEnd(ymd?: string) {
  if (!ymd) return undefined;
  const [y, m, d] = ymd.split("-").map((s) => Number(s));
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

export async function GET(request: NextRequest) {
  try {
    // ===== Xác thực token =====
    const token = request.cookies.get("token-hrm")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Thiếu token xác thực" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
      employeeCode: string;
    };
    const employeeId = decoded.id;
    const role = decoded.role;
    const employeeCode = decoded.employeeCode;

    // ===== Params =====
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const proposalType = searchParams.get("proposalType");
    const createdFrom = searchParams.get("createdFrom") || undefined;
    const createdTo = searchParams.get("createdTo") || undefined;
    const skip = (page - 1) * pageSize;

    // ===== Build search filter =====
    const searchFilter: any = {};

    // Search text: title, name, createdBy.name
    if (search) {
      searchFilter.OR = [
        { title: { contains: search } },
        { name: { contains: search } },
        { createdBy: { name: { contains: search } } },
      ];
    }

    // Filter theo trạng thái
    if (status) {
      searchFilter.status = status;
    }

    // Filter theo loại proposal
    if (proposalType) {
      searchFilter.proposalType = proposalType;
    }

    // Filter theo ngày tạo (FIXED)
    if (createdFrom || createdTo) {
      // Nếu cả hai bằng nhau (chọn 1 ngày), dùng startOfDay..endOfDay
      const fromDate = createdFrom ? parseYMDToStart(createdFrom) : undefined;
      const toDate = createdTo ? parseYMDToEnd(createdTo) : undefined;

      // Nếu chỉ truyền createdTo từ frontend (ví dụ user chỉ chọn 1 tham số), vẫn xử lý đúng
      searchFilter.createdAt = {};
      if (fromDate) searchFilter.createdAt.gte = fromDate;
      if (toDate) searchFilter.createdAt.lte = toDate;
    }

    // ===== 1. CREATED PROPOSALS =====
    const createdWhere =
      role === "ADMIN" || employeeCode === "00016"
        ? { ...searchFilter }
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

    // ===== 2. NEED TO SIGN =====
    const need_to_sign_all = await prisma.proposal.findMany({
      where: {
        ...searchFilter,
        signers: { some: { status: "pending", signerId: employeeId } },
      },
      include: { ...defaultInclude(), signers: true },
    });

    const need_to_sign_filtered = need_to_sign_all.filter((p) => {
      if (p.status !== "pending_signatures") return false;

      const pending = p.signers.filter((s) => s.status === "pending");
      console.log(pending);

      if (pending.length === 0) return false;
      const minLevel = Math.min(...pending.map((s) => s.level));
      return pending.some(
        (s) => s.level === minLevel && s.signerId === employeeId
      );
    });

    const needToSignTotal = need_to_sign_filtered.length;
    const need_to_sign = need_to_sign_filtered.slice(skip, skip + pageSize);

    // ===== 3. NEED TO APPROVE =====
    const need_to_approve_all = await prisma.proposal.findMany({
      where: {
        ...searchFilter,
        status: "waiting_approval",
        approvers: { some: { status: "pending", approverId: employeeId } },
      },
      include: { ...defaultInclude(), approvers: true },
    });

    const need_to_approve_filtered = need_to_approve_all.filter((p) => {
      const pending = p.approvers.filter((a) => a.status === "pending");
      if (pending.length === 0) return false;
      const minLevel = Math.min(...pending.map((a) => Number(a.level)));
      return pending.some(
        (a) => a.level === minLevel && a.approverId === employeeId
      );
    });

    const needToApproveTotal = need_to_approve_filtered.length;
    const need_to_approve = need_to_approve_filtered.slice(
      skip,
      skip + pageSize
    );

    // ===== Response =====
    return NextResponse.json({
      page,
      pageSize,
      search,
      status,
      proposalType,
      created: { data: created, total: createdTotal },
      need_to_sign: { data: need_to_sign, total: needToSignTotal },
      need_to_approve: { data: need_to_approve, total: needToApproveTotal },
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy proposal:", error);
    return NextResponse.json(
      { message: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}

// ===== INCLUDE MẶC ĐỊNH =====
function defaultInclude() {
  return {
    file: {
      select: { id: true, filename: true, mimeType: true, fileSize: true },
    },
    proposer: { select: { id: true, name: true, employeeCode: true } },
    createdBy: { select: { id: true, name: true, employeeCode: true } },
    signers: {
      select: {
        level: true,
        status: true,
        signerId: true,
        signer: { select: { id: true, name: true, employeeCode: true } },
      },
    },
    approvers: {
      select: {
        level: true,
        status: true,
        approverId: true,
        approver: { select: { id: true, name: true, employeeCode: true } },
      },
    },
  };
}
