import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const role = searchParams.get("role") || "MANAGER";
    const department = searchParams.get("department") || "";
    const name = searchParams.get("name") || "";
    const employeeCode = searchParams.get("employeeCode") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // Bộ lọc chung
    const whereFilter: any = {
      AND: [
        name
          ? {
              name: {
                contains: name,
                mode: "insensitive", // Tìm không phân biệt hoa thường
              },
            }
          : {},
        employeeCode
          ? {
              employeeCode: {
                contains: employeeCode,
                mode: "insensitive",
              },
            }
          : {},
      ],
    };

    // Lọc phòng ban
    if (department) {
      whereFilter.workInfo = {
        department,
      };
    }

    // Nếu cần logic riêng cho role MANAGER giới hạn phòng ban, bạn có thể mở rộng logic ở đây

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where: whereFilter,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          employeeCode: true,
          name: true,
          gender: true,
          avatar: true,
          workInfo: {
            select: {
              department: true,
              position: true,
            },
          },
        },
      }),
      prisma.employee.count({ where: whereFilter }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách nhân viên rút gọn:", error);
    return NextResponse.json(
      { message: "Không lấy được danh sách nhân viên" },
      { status: 500 }
    );
  }
}
