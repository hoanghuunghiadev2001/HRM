import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

// GET import log
export async function GET(req: Request, { params }: Params) {
  try {
    const importId = Number(params.id);

    const log = await prisma.attendanceImportLog.findUnique({
      where: { id: importId },
      include: { attendances: true }, // Nếu chưa có relation employee
    });

    if (!log) {
      return NextResponse.json({ error: "Import log not found" }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (err) {
    console.error("GET Import Log Error:", err);
    return NextResponse.json({ error: "Failed to fetch import log" }, { status: 500 });
  }
}

// DELETE import log
export async function DELETE(req: Request, { params }: Params) {
  try {
    const importId = Number(params.id);

    // Xóa toàn bộ attendance thuộc import
    await prisma.attendance.deleteMany({ where: { importId } });

    // Xóa log
    await prisma.attendanceImportLog.delete({ where: { id: importId } });

    return NextResponse.json({ message: "Import log deleted successfully" });
  } catch (err) {
    console.error("DELETE Import Log Error:", err);
    return NextResponse.json({ error: "Failed to delete import log" }, { status: 500 });
  }
}
