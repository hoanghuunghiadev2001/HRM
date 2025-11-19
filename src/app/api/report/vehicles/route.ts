import { NextResponse } from "next/server";
// Giả sử bạn dùng Prisma
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Lấy tất cả đề xuất đã duyệt
    const proposals = await prisma.proposal.findMany({
      where: { status: "approved", vehicleId: { not: null } },
      include: {
        vehicle: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Lấy tất cả xe để hiển thị cột
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
