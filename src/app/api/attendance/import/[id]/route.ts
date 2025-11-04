import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lấy chi tiết log import theo ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const importId = Number((await params).id);

    const log = await prisma.attendanceImportLog.findUnique({
      where: { id: importId },
      include: { attendances: true }, // include employee
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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const importId = Number((await params).id);

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
