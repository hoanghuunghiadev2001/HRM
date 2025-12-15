import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const notice = await prisma.maintenanceNotice.findFirst({
    where: {
      isActive: true,
    },
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json(notice ?? null);
}
