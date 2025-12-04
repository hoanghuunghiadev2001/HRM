import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextResponse) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    // Nếu có date → dùng date đó, không thì dùng hôm nay
    const baseDate = dateParam ? new Date(dateParam) : new Date();

    // Tính đầu ngày theo múi giờ VN
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

    // Lấy tất cả đề xuất đã duyệt TRONG NGÀY ĐÃ CHỌN
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
