import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const logs = await prisma.attendanceImportLog.findMany({
      include: {
        _count: { select: { attendances: true } },
      },
      orderBy: { importedAt: "desc" },
    });

    return NextResponse.json(logs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch import logs" }, { status: 500 });
  }
}
