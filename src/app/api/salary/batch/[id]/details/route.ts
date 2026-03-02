/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const batchId = parseInt(params.id);
    const salaries = await prisma.salary.findMany({
      where: { batchId: batchId },
      include: {
        employee: { select: { name: true, employeeCode: true } },
      },
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json(salaries);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải chi tiết" }, { status: 500 });
  }
}
