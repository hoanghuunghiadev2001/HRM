/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") ?? "0");
  const year = parseInt(searchParams.get("year") ?? "0");
  // "ALL" = tất cả bộ phận, hoặc departmentId dạng string
  const deptFilter = searchParams.get("dept") ?? "ALL";

  if (!month || !year) {
    return NextResponse.json(
      { error: "Thiếu tham số month/year" },
      { status: 400 },
    );
  }

  const from = new Date(year, month - 1, 1, 0, 0, 0);
  const to = new Date(year, month, 0, 23, 59, 59);

  // Fetch tất cả proposals approved trong tháng, join proposer → workInfo → department
  const proposals = await prisma.proposal.findMany({
    where: {
      proposalType: "VEHICLE_GRAB",
      status: "approved",
      createdAt: { gte: from, lte: to },
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

  // Build danh sách departments duy nhất (xuất hiện trong tháng này) để làm dropdown
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

  // Lọc proposals theo dept nếu không phải ALL
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

  // Breakdown theo từng bộ phận (luôn tính từ toàn bộ proposals, không phụ thuộc deptFilter)
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
    month,
    year,
    deptFilter,
    total: filtered.length,
    approvedCount: filtered.length,
    totalVehicleAmount,
    totalRoAmount,
    departments, // danh sách bộ phận duy nhất để build dropdown trên UI
    deptBreakdown, // breakdown tất cả bộ phận (dùng để hiển thị bảng tổng hợp)
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
        // Flatten department ra ngoài để dùng tiện trên client/PDF
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
