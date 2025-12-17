import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();

  const notifications = await prisma.notification.findMany({
    where: {
      isActive: true,
      OR: [
        { startTime: null },
        {
          startTime: { lte: now },
          endTime: { gte: now },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notifications);
}
