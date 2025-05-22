// app/api/auth/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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

      const ext = matches[1].split("/")[1];
      const base64Data = matches[2];
      const fileName = `employee-${userId}-${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");
      const filePath = path.join(uploadDir, fileName);

      // Tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      avatar = `/uploads/${fileName}`;
    } else if (typeof avatar === "string" && avatar.startsWith("http")) {
      // Giữ nguyên URL avatar, không thay đổi
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
