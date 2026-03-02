import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const batches = await prisma.salaryBatch.findMany({
      orderBy: {
        createdAt: "desc", // Đợt mới nhất lên đầu
      },
      select: {
        id: true,
        filename: true,
        month: true,
        year: true,
        createdAt: true,
        // Đếm tổng số bản ghi lương thuộc batch này
        _count: {
          select: { salaries: true },
        },
      },
    });

    // Format lại dữ liệu để match với biến b.totalRows trong UI của bạn
    const formattedData = batches.map((b) => ({
      id: b.id,
      filename: b.filename,
      month: b.month,
      year: b.year,
      createdAt: b.createdAt,
      totalRows: b._count.salaries, // UI bạn đang dùng b.totalRows
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Fetch Batches Error:", error);
    return NextResponse.json(
      { error: "Lỗi lấy danh sách đợt lương" },
      { status: 500 },
    );
  }
}
