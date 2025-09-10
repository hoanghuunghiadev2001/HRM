import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaveStatus, Prisma } from "../../../../../generated/prisma";

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

    const employeeFilter: Prisma.EmployeeWhereInput = {
      workInfo: {},
    };

    const defaultStatusFilter: Prisma.EnumLeaveStatusFilter = {
      in: [LeaveStatus.approved, LeaveStatus.rejected],
    };

    let statusFilter: LeaveStatus | Prisma.EnumLeaveStatusFilter =
      defaultStatusFilter;

    if (
      status === LeaveStatus.approved ||
      status === LeaveStatus.rejected ||
      status === LeaveStatus.pending
    ) {
      statusFilter = status as LeaveStatus;
    }

    if (employeeCode) {
      employeeFilter.employeeCode = {
        contains: employeeCode,
      };
    }

    if (name) {
      employeeFilter.name = {
        contains: name,
      };
    }

    if ((role === "MANAGER" || role === "ADMIN") && department) {
      if (department) {
        const parts = department.split("-");
        const departmentId = parts[0] ? parseInt(parts[0], 10) : undefined;
        const positionId = parts[1] ? parseInt(parts[1], 10) : undefined;

        employeeFilter.workInfo = {
          ...(departmentId && { departmentId }),
          ...(positionId && { positionId }),
        };
      }
    }

    const baseWhere: Prisma.LeaveRequestWhereInput = {
      status: statusFilter,
      employee: employeeFilter,
    };

    const [processedRequests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: baseWhere,
        orderBy: {
          createdAt: "desc",
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, employeeId, leaveType } = body;

    if (!id || !employeeId) {
      return NextResponse.json(
        { message: "Thiếu ID đơn nghỉ phép hoặc ID nhân viên" },
        { status: 400 }
      );
    }

    // Lấy đơn xin phép
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    select: { id: true, employeeId: true, status: true },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ phép" },
        { status: 404 }
      );
    }

    // Chỉ nhân viên tạo mới được chỉnh
    if (leaveRequest.employeeId !== employeeId) {
      return NextResponse.json(
        { message: "Bạn không có quyền sửa đơn này" },
        { status: 403 }
      );
    }

    // Nếu đơn đã được xử lý thì không cho sửa
    

    // Cập nhật chỉ trường leaveType
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        leaveType,
      },
    });

    return NextResponse.json({
      message: "Cập nhật loại phép thành công",
      data: updatedLeave,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật loại phép:", error);
    return NextResponse.json({ message: "Cập nhật thất bại" }, { status: 500 });
  }
}

