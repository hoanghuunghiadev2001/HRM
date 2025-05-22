// /app/api/employees/[employeeCode]/changePassword/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { employeeCode: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user || user.role === "USER") {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const { employeeCode } = params;
  const { newPassword } = await req.json();

  if (!newPassword || typeof newPassword !== "string") {
    return NextResponse.json(
      { message: "Mật khẩu không hợp lệ" },
      { status: 400 }
    );
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
    });
    if (!employee) {
      return NextResponse.json(
        { message: "Không tìm thấy nhân viên" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.employee.update({
      where: { employeeCode },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi server:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
