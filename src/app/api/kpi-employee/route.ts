/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/kpi-employee/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kpiId = searchParams.get("kpiId");

    if (!kpiId) {
      return NextResponse.json(
        { error: "Missing kpiId query parameter" },
        { status: 400 }
      );
    }

    const kpiEmployees = await prisma.kPIEmployee.findMany({
      where: {
        kpiId: Number(kpiId),
      },
      include: {
        employee: true, // giả sử có relation `employee` với bảng nhân viên
      },
    });

    // map dữ liệu trả về dạng phù hợp UI cần
    const result = kpiEmployees.map((item) => ({
      id: item.id,
      employeeId: item.employeeId,
      employeeName: item.employee?.name || "Chưa có tên",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/kpi-employee error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  /*
  data ví dụ:
  {
    kpiId: 1,
    employeeId: 2
  }
  */
  try {
    const kpiEmployee = await prisma.kPIEmployee.create({
      data: {
        kpiId: data.kpiId,
        employeeId: data.employeeId,
      },
    });
    return NextResponse.json(kpiEmployee, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Duplicate or invalid data" },
      { status: 400 }
    );
  }
}
