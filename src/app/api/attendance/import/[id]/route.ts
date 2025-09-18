import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Lấy chi tiết log import theo ID
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;   // 👈 phải await
    const importId = Number(id);

    const log = await prisma.attendanceImportLog.findUnique({
      where: { id: importId },
      include: { attendances: { include: { employee: true } } },
    });

    if (!log) {
      return NextResponse.json(
        { error: "Import log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(log);
  } catch (err) {
    console.error("❌ GET Import Log Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch import log" },
      { status: 500 }
    );
  }
}

// Xóa log import và dữ liệu liên quan
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;   // 👈 phải await
    const importId = Number(id);

    // Xoá toàn bộ attendance thuộc import
    await prisma.attendance.deleteMany({ where: { importId } });

    // Xoá log
    await prisma.attendanceImportLog.delete({ where: { id: importId } });

    return NextResponse.json({ message: "Import log deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE Import Log Error:", err);
    return NextResponse.json(
      { error: "Failed to delete import log" },
      { status: 500 }
    );
  }
}
