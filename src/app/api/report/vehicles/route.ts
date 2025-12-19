import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD

    // Lấy token từ cookies (đúng chuẩn App Router)
    const token = (await cookies()).get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    const baseDate = dateParam ? new Date(dateParam) : new Date();

    const startOfDay = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate()
    );

    const endOfDay = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      23,
      59,
      59,
      999
    );

    const proposals = await prisma.proposal.findMany({
      where: {
        status: "approved",
        vehicleId: { not: null },
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        vehicle: true,
        proposer: {
          select: { name: true },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    const vehicles = await prisma.vehicle.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ vehicles, proposals });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Không thể lấy dữ liệu báo cáo" },
      { status: 500 }
    );
  }
}
