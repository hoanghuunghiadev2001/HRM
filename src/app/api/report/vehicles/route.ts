/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Prisma, ProposalStatus } from "../../../../../generated/prisma";
// import { Prisma, ProposalStatus } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD, optional
    const vehicleIdParam = searchParams.get("vehicleId"); // optional

    // Lấy token từ cookies (đúng chuẩn App Router)
    const token = (await cookies()).get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    // Trạng thái luôn tính cả những đề xuất đang chờ ký/duyệt,
    // để tránh 2 người cùng giữ chỗ 1 khung giờ khi chưa duyệt xong.

    const statusFilter: Prisma.EnumProposalStatusFilter<"Proposal"> = {
      in: [
        ProposalStatus.pending_signatures,
        ProposalStatus.waiting_approval,
        ProposalStatus.approved,
      ],
    };

    const vehicleFilter = vehicleIdParam
      ? { vehicleId: Number(vehicleIdParam) }
      : { vehicleId: { not: null } };

    let dateRangeFilter: Record<string, any> = {};

    if (dateParam) {
      // ── Dùng cho trang BÁO CÁO: lọc đúng 1 ngày cụ thể ──────────────
      const baseDate = new Date(dateParam);

      const startOfDay = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
      );
      const endOfDay = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        23,
        59,
        59,
        999,
      );

      // Lấy các proposal có khoảng [startAt, endAt] GIAO với ngày được chọn,
      // không chỉ những proposal có startAt nằm trong ngày đó
      // (tránh bỏ sót ca đặt xe qua đêm, ví dụ 22h hôm trước -> 2h hôm sau).
      dateRangeFilter = {
        startAt: { lte: endOfDay },
        endAt: { gte: startOfDay },
      };
    } else {
      // ── Dùng cho FORM ĐỀ XUẤT: lấy toàn bộ lịch còn hiệu lực từ hiện tại ──
      dateRangeFilter = {
        endAt: { gte: new Date() },
      };
    }

    const proposals = await prisma.proposal.findMany({
      where: {
        status: statusFilter,
        ...vehicleFilter,
        ...dateRangeFilter,
      },
      include: {
        vehicle: true,
        proposer: {
          select: { name: true },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    const vehicles = await prisma.vehicle.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ vehicles, proposals });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Không thể lấy dữ liệu báo cáo" },
      { status: 500 },
    );
  }
}
