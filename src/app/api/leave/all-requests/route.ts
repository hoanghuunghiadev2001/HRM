import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const role = searchParams.get("role");
    const department = searchParams.get("department");
    const employeeCode = searchParams.get("employeeCode");
    const name = searchParams.get("name");
    const status = searchParams.get("status");

    // Điều kiện lọc cơ bản
    const baseWhere: any = {
      status: {
        in: ["approved", "rejected"],
      },
      employee: {
        workInfo: {},
      },
    };

    // Lọc theo trạng thái nếu có
    if (status) {
      baseWhere.status = status;
    }

    if (employeeCode) {
      baseWhere.employee.employeeCode = {
        contains: employeeCode,
        // mode: "insensitive" không dùng cho nested relation
      };
    }

    if (name) {
      baseWhere.employee.name = {
        contains: name,
        // mode: "insensitive" không dùng cho nested relation
      };
    }

    if (role === "MANAGER" && department) {
      baseWhere.employee.workInfo.department = department;
    } else if (role === "ADMIN" && department) {
      baseWhere.employee.workInfo.department = department;
    }

    const [processedRequests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: baseWhere,
        orderBy: {
          approvedAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          employee: {
            select: {
              name: true,
              employeeCode: true,
              avatar: true,
              workInfo: {
                select: {
                  department: true,
                  position: true,
                },
              },
            },
          },
        },
      }),
      prisma.leaveRequest.count({ where: baseWhere }),
    ]);

    return NextResponse.json({
      data: processedRequests,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn nghỉ đã xử lý:", error);
    return NextResponse.json(
      { message: "Lấy danh sách thất bại" },
      { status: 500 }
    );
  }
}
