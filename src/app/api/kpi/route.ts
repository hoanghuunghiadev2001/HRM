// pages/api/kpi/index.ts (hoặc app/api/kpi/route.ts - tùy Next.js bạn dùng)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const kpis = await prisma.kPI.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      kpiEmployees: {
        select: { id: true },
      },
    },
  });

  // map để thêm employeeCount
  const data = kpis.map((kpi) => ({
    id: kpi.id,
    name: kpi.name,
    createdAt: kpi.createdAt,
    employeeCount: kpi.kpiEmployees.length,
  }));

  return NextResponse.json(data);
}
export async function POST(request: Request) {
  const data = await request.json();
  /*
  data ví dụ:
  {
    name: "KPI tháng 5",
    period: "2025-05"
  }
  */
  const newKPI = await prisma.kPI.create({
    data: {
      name: data.name,
      period: data.period,
    },
  });
  return NextResponse.json(newKPI, { status: 201 });
}
