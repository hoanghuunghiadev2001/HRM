// app/api/auth/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function isBase64Image(str: string): boolean {
  return /^data:image\/\w+;base64,/.test(str);
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    // Giải mã token để lấy userId
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    const body = await req.json();

    let avatar = body.avatar;
    const { phone, personalPhone, companyPhone, email } = body;

    // Xử lý avatar nếu là base64 image
    if (typeof avatar === "string" && isBase64Image(avatar)) {
      const matches = avatar.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { message: "Avatar base64 không hợp lệ" },
          { status: 400 }
        );
      }

      const res = await cloudinary.uploader.upload(avatar, {
        folder: "employee_avatars",
        public_id: `employee-${userId}-${Date.now()}`,
      });
      avatar = res.secure_url;
    } else if (avatar === null) {
      // Xóa avatar
      avatar = null;
    } else {
      // Không cập nhật avatar nếu dữ liệu không hợp lệ hoặc không cần thay đổi
      avatar = undefined;
    }

    // Cập nhật avatar nếu có thay đổi
    if (avatar !== undefined) {
      await prisma.employee.update({
        where: { id: userId },
        data: { avatar },
      });
    }

    // Cập nhật hoặc tạo mới thông tin liên hệ
    await prisma.contactInfo.upsert({
      where: { employeeId: userId },
      update: {
        ...(phone !== undefined && { phoneNumber: phone }),
        ...(personalPhone !== undefined && { relativePhone: personalPhone }),
        ...(companyPhone !== undefined && { companyPhone }),
        ...(email !== undefined && { email }),
      },
      create: {
        employeeId: userId,
        phoneNumber: phone || "",
        relativePhone: personalPhone || "",
        companyPhone: companyPhone || null,
        email: email || null,
      },
    });

    return NextResponse.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
