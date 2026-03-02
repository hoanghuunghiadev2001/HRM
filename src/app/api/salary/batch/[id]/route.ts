/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Chuyển thành Promise
) {
  try {
    // Await params trước khi lấy id
    const { id } = await params;
    const batchId = parseInt(id);

    if (isNaN(batchId)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    // Xóa Batch sẽ tự động xóa các Salary liên quan nhờ onDelete: Cascade trong Prisma
    await prisma.salaryBatch.delete({
      where: { id: batchId },
    });

    return NextResponse.json({ message: "Đã xóa toàn bộ đợt up lương." });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { error: "Không thể xóa đợt lương này" },
      { status: 500 },
    );
  }
}
