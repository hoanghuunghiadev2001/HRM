/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Sửa: Khai báo params là một Promise
) {
  try {
    // Sửa: Phải await params trước khi bóc tách id
    const { id } = await params;

    const batchId = parseInt(id);

    // Kiểm tra ID hợp lệ để tránh lỗi ép kiểu
    if (isNaN(batchId)) {
      return NextResponse.json(
        { error: "ID đợt lương không hợp lệ" },
        { status: 400 },
      );
    }

    const salaries = await prisma.salary.findMany({
      where: { batchId: batchId },
      include: {
        employee: {
          select: {
            name: true,
            employeeCode: true,
          },
        },
      },
      orderBy: {
        fullName: "asc",
      },
    });

    return NextResponse.json(salaries);
  } catch (error) {
    console.error("Fetch Details Error:", error);
    return NextResponse.json(
      { error: "Lỗi tải chi tiết bảng lương" },
      { status: 500 },
    );
  }
}
