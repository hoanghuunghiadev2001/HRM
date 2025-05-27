import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { message: "Token không hợp lệ" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Thiếu dữ liệu mật khẩu" },
        { status: 400 }
      );
    }

    // Lấy user trong DB
    const dbUser = await prisma.employee.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { message: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    // So sánh mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, dbUser.password); // giả sử bạn lưu password hashed ở trường passwordHash

    if (!isMatch) {
      return NextResponse.json(
        { message: "Mật khẩu hiện tại không đúng" },
        { status: 403 }
      );
    }

    // Mã hóa mật khẩu mới
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu mới vào DB
    await prisma.employee.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
