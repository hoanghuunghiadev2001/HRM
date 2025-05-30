/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/kpi-entry/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Lấy danh sách tất cả entry KPI
  const entries = await prisma.kPIEntry.findMany();
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    /*
    data mẫu gửi lên:
    {
      kpiEmployeeId: 1,
      name: "Doanh thu",
      targetValue: 1000000
    }
    */

    if (!data.kpiEmployeeId || !data.name || data.targetValue === undefined) {
      return NextResponse.json(
        { error: "Thiếu trường bắt buộc: kpiEmployeeId, name, targetValue" },
        { status: 400 }
      );
    }

    const newEntry = await prisma.kPIEntry.create({
      data: {
        kpiEmployeeId: data.kpiEmployeeId,
        name: data.name,
        targetValue: data.targetValue,
        achievedValue: data.achievedValue ?? 0,
        isAchieved: data.isAchieved ?? false,
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/kpi-entry error:", error);
    if (error.code === "P2002") {
      // unique constraint failed
      return NextResponse.json(
        { error: "Chỉ tiêu này đã tồn tại cho KPIEmployee này." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
