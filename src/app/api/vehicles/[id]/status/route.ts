/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers"; // dùng để lấy cookie
import { verifyToken } from "@/lib/auth"; // giả sử bạn có hàm verifyToken

interface RequestBody {
  isBusy: boolean;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  // Lấy token từ cookie
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  }

  // Verify token
  const user = verifyToken(token);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  try {
    const body: RequestBody = await req.json();

    if (typeof body.isBusy !== "boolean") {
      return NextResponse.json(
        { error: "isBusy phải là boolean" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái xe
    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data: { isBusy: body.isBusy },
    });

    return NextResponse.json({
      message: "Cập nhật trạng thái xe thành công",
      vehicle,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Xe không tồn tại" }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}
