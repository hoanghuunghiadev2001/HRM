/* eslint-disable @typescript-eslint/no-unused-vars */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  // 1. Xác thực token
  const token = request.cookies.get("token-hrm")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Thiếu token xác thực" },
      { status: 401 },
    );
  }

  let employeeId: number;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    employeeId = decoded.id;
  } catch {
    return NextResponse.json(
      { error: "Token không hợp lệ hoặc đã hết hạn" },
      { status: 401 },
    );
  }

  // 2. Validate query params — mặc định tháng hiện tại nếu không truyền
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = parseInt(
    searchParams.get("month") ?? String(now.getMonth() + 1),
  );
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));

  if (!month || !year || month < 1 || month > 12 || year < 2000) {
    return NextResponse.json(
      { error: "Tham số month/year không hợp lệ" },
      { status: 400 },
    );
  }

  // 3. Khoảng thời gian trong tháng
  const from = new Date(year, month - 1, 1, 0, 0, 0);
  const to = new Date(year, month, 0, 23, 59, 59);

  try {
    const proposals = await prisma.proposal.findMany({
      where: {
        proposalType: "VEHICLE_GRAB",
        status: "approved", // ← Chỉ lấy đã duyệt
        createdAt: { gte: from, lte: to },
      },
      include: {
        proposer: {
          select: { id: true, name: true, employeeCode: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        vehicle: {
          select: { id: true, name: true, plateNumber: true },
        },
        signers: {
          orderBy: { level: "asc" },
          include: {
            signer: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalVehicleAmount = proposals.reduce(
      (s, p) => s + (p.vehicleAmount ?? 0),
      0,
    );
    const totalRoAmount = proposals.reduce((s, p) => s + (p.roAmount ?? 0), 0);
    // approvedCount = proposals.length vì đã filter status=approved ở query
    const approvedCount = proposals.length;

    return NextResponse.json({
      month,
      year,
      total: proposals.length,
      approvedCount,
      totalVehicleAmount,
      totalRoAmount,
      proposals,
    });
  } catch (error) {
    console.error("API Error [grab-report]:", error);
    return NextResponse.json({ error: "Lỗi server nội bộ" }, { status: 500 });
  }
}
