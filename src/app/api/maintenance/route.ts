import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // Tắt các thông báo cũ
  await prisma.maintenanceNotice.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  const notice = await prisma.maintenanceNotice.create({
    data: {
      title: body.title,
      message: body.message,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    },
  });

  return NextResponse.json(notice);
}

export async function GET() {
  const data = await prisma.maintenanceNotice.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(data);
}
