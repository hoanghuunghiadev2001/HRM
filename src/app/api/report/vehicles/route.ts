import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // TÍNH NGÀY HÔM NAY (MÚI GIỜ VN)
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    // const endOfDay = new Date(
    //   now.getFullYear(),
    //   now.getMonth(),
    //   now.getDate(),
    //   23,
    //   59,
    //   59,
    //   999
    // );

    // Lấy tất cả đề xuất đã duyệt TRONG NGÀY HÔM NAY
    const proposals = await prisma.proposal.findMany({
      where: {
        status: "approved",
        vehicleId: { not: null },
        startAt: {
          gte: startOfDay,
          // lte: endOfDay,
        },
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Lấy toàn bộ xe
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
