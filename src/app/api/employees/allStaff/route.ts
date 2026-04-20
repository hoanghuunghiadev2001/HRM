/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    // 1. Kiểm tra Token từ Cookies
    const token = req.cookies.get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    // 2. Xác thực Token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      role: string;
      id: number;
    };

    // 3. Phân quyền (Nếu bạn muốn chỉ ADMIN và MANAGER mới được xem danh sách)
    // Nếu muốn mọi user đều xem được thì có thể bỏ qua check role này
    if (decoded.role !== "ADMIN" && decoded.role !== "MANAGER") {
      return NextResponse.json(
        { message: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    // 4. Truy vấn danh sách nhân viên đang active
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        gender: true,
        role: true,
        avatar: true,
        // Lấy thêm thông tin phòng ban và chức vụ từ bảng WorkInfo
        workInfo: {
          select: {
            department: {
              select: {
                name: true,
                abbreviation: true,
              },
            },
            position: {
              select: {
                name: true,
              },
            },
          },
        },
        // Lấy thông tin liên hệ nếu cần
        contactInfo: {
          select: {
            phoneNumber: true,
            email: true,
          },
        },
      },
      orderBy: {
        employeeCode: "asc", // Sắp xếp theo mã nhân viên
      },
    });

    return NextResponse.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error: any) {
    console.error("Fetch Employees Error:", error);

    // Xử lý lỗi Token hết hạn hoặc không hợp lệ
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return NextResponse.json(
        { message: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
