/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/user/route.ts

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TZ = "Asia/Ho_Chi_Minh";

// Hàm định dạng ngày sang dd/MM/yyyy theo timezone VN
function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return dayjs(date).tz(TZ).format("DD/MM/YYYY");
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const employee = await prisma.employee.findUnique({
      where: { id: decoded.id },
      include: {
        contactInfo: true,
        workInfo: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Không tìm thấy nhân viên" },
        { status: 404 }
      );
    }

    // Xóa password trước khi trả về
    delete (employee as any).password;

    // Format các trường ngày
    const formattedEmployee = {
      ...employee,
      birthDate: formatDate(employee.birthDate),
    };

    return NextResponse.json(formattedEmployee);
  } catch (err) {
    console.error("Lỗi API /user:", err);
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 }
    );
  }
}
