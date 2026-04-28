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

    // 3. Phân quyền: Thường trang phân quyền này chỉ dành cho ADMIN hoặc HR/MANAGER
    if (decoded.role !== "ADMIN" && decoded.role !== "MANAGER") {
      return NextResponse.json(
        { message: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    // 4. Truy vấn danh sách nhân viên
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        role: true,
        avatar: true,
        // Lấy thông tin phòng ban và chức vụ
        workInfo: {
          select: {
            department: {
              select: {
                name: true,
              },
            },
            position: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc", // Sắp xếp theo tên để dễ tìm trong Select/Transfer
      },
    });

    // 5. Làm phẳng dữ liệu (Flatten) để khớp với Interface EmpInfo ở Frontend
    // Biến đổi từ { workInfo: { department: { name: '...' } } } thành { department: '...' }
    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      name: emp.name,
      role: emp.role,
      avatar: emp.avatar,
      department: emp.workInfo?.department?.name || "Chưa xác định",
      position: emp.workInfo?.position?.name || "Nhân viên",
    }));

    return NextResponse.json({
      success: true,
      count: formattedEmployees.length,
      data: formattedEmployees,
    });
  } catch (error: any) {
    console.error("Fetch Employees Error:", error);

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
      { success: false, error: "Lỗi hệ thống khi lấy danh sách nhân viên" },
      { status: 500 },
    );
  }
}
