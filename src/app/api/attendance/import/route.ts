import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const logs = await prisma.attendanceImportLog.findMany({
      include: {
        importedBy: {
          select: {
            employeeCode: true,
            name: true,
          },
        },
        _count: { select: { attendances: true } },
      },
      orderBy: { importedAt: "desc" },
    });

    // format lại dữ liệu cho FE
    const formatted = logs.map((log) => ({
      id: log.id,
      filename: log.filename,
      importedAt: log.importedAt,
      recordCount: log._count.attendances,
      importedBy: log.importedBy
        ? { code: log.importedBy.employeeCode, name: log.importedBy.name }
        : null,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch import logs" },
      { status: 500 }
    );
  }
}
