import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleIdParam = searchParams.get("vehicleId"); // optional: lọc theo 1 xe

    // Lấy token từ cookies (đúng chuẩn App Router)
    const token = (await cookies()).get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    // Chỉ loại bỏ các lịch đã kết thúc trong quá khứ —
    // KHÔNG giới hạn theo 1 ngày cụ thể, để form có đủ dữ liệu
    // kiểm tra trùng lịch cho bất kỳ ngày nào người dùng chọn.
    const now = new Date();

    const proposals = await prisma.proposal.findMany({
      where: {
        // Tính cả những đề xuất đang chờ ký/duyệt để tránh 2 người
        // cùng giữ chỗ 1 khung giờ trong lúc chưa duyệt xong (race condition)
        status: {
          in: ["pending_signatures", "waiting_approval", "approved"],
        },
        vehicleId: vehicleIdParam ? Number(vehicleIdParam) : { not: null },
        endAt: {
          gte: now, // chỉ lấy lịch còn hiệu lực (chưa kết thúc)
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
      { status: 500 },
    );
  }
}
