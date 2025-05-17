import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function isBase64Image(str: string) {
  return /^data:image\/\w+;base64,/.test(str);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Phương thức không được phép" });
  }

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    let { avatar, phone, personalPhone, companyPhone, email } = req.body;

    // Xử lý avatar base64 hoặc URL hoặc null
    if (typeof avatar === "string" && isBase64Image(avatar)) {
      const matches = avatar.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: "Avatar base64 không hợp lệ" });
      }

      const ext = matches[1].split("/")[1];
      const base64Data = matches[2];
      const fileName = `employee-${userId}-${Date.now()}.${ext}`;
      const filePath = path.join(process.cwd(), "public/uploads", fileName);

      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      avatar = `/uploads/${fileName}`;
    } else if (typeof avatar === "string" && avatar.startsWith("http")) {
      // Giữ nguyên URL avatar
    } else if (avatar === null) {
      // Xóa avatar
      avatar = null;
    } else {
      avatar = undefined; // Không cập nhật avatar
    }

    // Cập nhật avatar nếu có
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

    return res.status(200).json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Update employee error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
}
