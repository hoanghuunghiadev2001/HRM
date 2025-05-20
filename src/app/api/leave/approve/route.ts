import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PUT(req: NextRequest) {
  try {
    // Lấy token từ cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    // Giải mã token để lấy thông tin user
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      name: string;
      role: string;
    };

    // Kiểm tra quyền
    if (!["ADMIN", "MANAGER"].includes(decoded.role)) {
      return NextResponse.json(
        { message: "Không có quyền phê duyệt" },
        { status: 403 }
      );
    }

    // Lấy dữ liệu body
    const body = await req.json();
    const { leaveRequestId, status, approvedBy } = body;

    if (!leaveRequestId || !status || !approvedBy) {
      return NextResponse.json(
        { message: "Thiếu dữ liệu bắt buộc" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { message: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    // Cập nhật đơn nghỉ
    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status,
        approvedBy,
        approvedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Approve leave request error:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
