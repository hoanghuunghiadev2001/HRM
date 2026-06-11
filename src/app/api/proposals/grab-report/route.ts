/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultDateRange } from "@/lib/grab-report-utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Kích hoạt plugin xử lý múi giờ của dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const TZ_VN = "Asia/Ho_Chi_Minh";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  let from: Date;
  let to: Date;

  const rawFrom = searchParams.get("fromDate");
  const rawTo = searchParams.get("toDate");

  if (rawFrom && rawTo) {
    // Ép chuẩn chuỗi ngày về đúng 00:00 và 23:59 theo múi giờ Việt Nam, sau đó xuất ra dạng Date object cho Prisma
    from = dayjs.tz(`${rawFrom} 00:00:00`, TZ_VN).toDate();
    to = dayjs.tz(`${rawTo} 23:59:59.999`, TZ_VN).toDate();
  } else {
    const def = getDefaultDateRange();
    from = def.from;
    to = def.to;
  }

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json(
      { error: "Ngày không hợp lệ. Định dạng: YYYY-MM-DD" },
      { status: 400 },
    );
  }

  if (from > to) {
    return NextResponse.json(
      { error: "Ngày bắt đầu phải trước ngày kết thúc" },
      { status: 400 },
    );
  }

  // "ALL" = tất cả bộ phận, hoặc departmentId dạng string
  const deptFilter = searchParams.get("dept") ?? "ALL";

  // ── Query DB ───────────────────────────────────────────────────────────────
  const proposals = await prisma.proposal.findMany({
    where: {
      proposalType: "VEHICLE_GRAB",
      status: "approved",
      createdAt: { gte: from, lte: to }, // Lúc này Prisma nhận Date chuẩn UTC tương ứng với giờ VN
    },
    include: {
      proposer: {
        select: {
          id: true,
          name: true,
          employeeCode: true,
          workInfo: {
            select: {
              department: {
                select: { id: true, name: true, abbreviation: true },
              },
            },
          },
        },
      },
      vehicle: {
        select: { id: true, name: true, plateNumber: true },
      },
      signers: {
        include: {
          signer: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // ── Build danh sách departments duy nhất ──────────────────────────────────
  const deptMap = new Map<
    string,
    { id: number; name: string; abbreviation: string }
  >();
  for (const p of proposals) {
    const dept = p.proposer.workInfo?.department;
    if (dept) deptMap.set(String(dept.id), dept);
  }
  const departments = Array.from(deptMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "vi"),
  );

  // ── Lọc theo dept ──────────────────────────────────────────────────────────
  const filtered =
    deptFilter === "ALL"
      ? proposals
      : proposals.filter(
          (p) =>
            String(p.proposer.workInfo?.department?.id ?? "") === deptFilter,
        );

  const totalVehicleAmount = filtered.reduce(
    (s, p) => s + (Number(p.vehicleAmount) || 0),
    0,
  );
  const totalRoAmount = filtered.reduce(
    (s, p) => s + (Number(p.roAmount) || 0),
    0,
  );

  // ── Breakdown theo bộ phận (luôn tính từ toàn bộ) ────────────────────────
  const deptBreakdown: Record<
    string,
    {
      name: string;
      abbreviation: string;
      count: number;
      vehicleAmount: number;
      roAmount: number;
    }
  > = {};
  for (const p of proposals) {
    const dept = p.proposer.workInfo?.department;
    const key = dept ? String(dept.id) : "__none__";
    const label = dept?.name ?? "Không xác định";
    const abbr = dept?.abbreviation ?? "—";
    if (!deptBreakdown[key]) {
      deptBreakdown[key] = {
        name: label,
        abbreviation: abbr,
        count: 0,
        vehicleAmount: 0,
        roAmount: 0,
      };
    }
    deptBreakdown[key].count++;
    deptBreakdown[key].vehicleAmount += Number(p.vehicleAmount) || 0;
    deptBreakdown[key].roAmount += Number(p.roAmount) || 0;
  }

  return NextResponse.json({
    // Thay vì .toISOString().slice(0,10) bị lùi ngày, hãy dùng dayjs ép hiển thị đúng format YYYY-MM-DD theo giờ VN
    dateFrom: dayjs(from).tz(TZ_VN).format("YYYY-MM-DD"),
    dateTo: dayjs(to).tz(TZ_VN).format("YYYY-MM-DD"),
    deptFilter,
    total: filtered.length,
    approvedCount: filtered.length,
    totalVehicleAmount,
    totalRoAmount,
    departments,
    deptBreakdown,
    proposals: filtered.map((p) => ({
      id: p.id,
      name: p.name,
      title: p.title,
      description: p.description,
      status: p.status,
      customerName: p.customerName,
      roNumber: p.roNumber,
      vehicleAmount: p.vehicleAmount,
      roAmount: p.roAmount,
      vehicleKm: p.vehicleKm,
      pickupPlace: p.pickupPlace,
      dropoffPlace: p.dropoffPlace,
      startAt: p.startAt,
      endAt: p.endAt,
      createdAt: p.createdAt,
      proposer: {
        id: p.proposer.id,
        name: p.proposer.name,
        employeeCode: p.proposer.employeeCode,
        department: p.proposer.workInfo?.department ?? null,
      },
      vehicle: p.vehicle,
      signers: p.signers.map((s) => ({
        id: s.id,
        signerId: s.signerId,
        status: s.status,
        signedAt: s.signedAt,
        level: s.level,
        signer: s.signer,
      })),
    })),
  });
}
