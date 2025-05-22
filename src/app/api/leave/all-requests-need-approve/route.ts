import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "../../../../../generated/prisma";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const department = url.searchParams.get("department");

    const employeeFilter: Prisma.EmployeeWhereInput = {};

    if ((role === "MANAGER" || role === "ADMIN") && department) {
      employeeFilter.workInfo = {
        is: {
          department,
        },
      };
    }

    const whereClause: Prisma.LeaveRequestWhereInput = {
      status: "pending",
      employee: employeeFilter,
    };

    const pendingRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            workInfo: {
              select: {
                department: true,
                position: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pendingRequests);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn nghỉ đang chờ duyệt:", error);
    return NextResponse.json(
      { message: "Lấy danh sách thất bại" },
      { status: 500 }
    );
  }
}
