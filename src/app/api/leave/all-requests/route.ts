/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/leaveRequests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaveStatus, Prisma } from "../../../../../generated/prisma";
import { startOfDay, endOfDay } from "date-fns";
import jwt from "jsonwebtoken";

interface JWTPayload {
  id: number;
  role: string;
  employeeCode: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // --- Thông tin phân trang ---
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // --- Thông tin filter ---
    const role = searchParams.get("role");
    const department = searchParams.get("department");
    const employeeCode = searchParams.get("employeeCode");
    const name = searchParams.get("name");
    const status = searchParams.get("status");
    const filterDate = searchParams.get("startDate"); // YYYY-MM-DD

    // --- Filter nhân viên ---
    const employeeFilter: Prisma.EmployeeWhereInput = { workInfo: {} };
    if (employeeCode) employeeFilter.employeeCode = { contains: employeeCode };
    if (name) employeeFilter.name = { contains: name };

    if ((role === "MANAGER" || role === "ADMIN") && department) {
      const [departmentIdStr, positionIdStr] = department.split("-");
      const departmentId = departmentIdStr ? parseInt(departmentIdStr, 10) : undefined;
      const positionId = positionIdStr ? parseInt(positionIdStr, 10) : undefined;

      employeeFilter.workInfo = {
        ...(departmentId && { departmentId }),
        ...(positionId && { positionId }),
      };
    }

    // --- Filter trạng thái ---
    const defaultStatusFilter: Prisma.EnumLeaveStatusFilter = {
      in: [LeaveStatus.approved, LeaveStatus.rejected, LeaveStatus.revoked],
    };
    let statusFilter: LeaveStatus | Prisma.EnumLeaveStatusFilter = defaultStatusFilter;
    if (
      status === LeaveStatus.approved ||
      status === LeaveStatus.rejected ||
      status === LeaveStatus.revoked ||
      status === LeaveStatus.pending
    ) {
      statusFilter = status as LeaveStatus;
    }

    // --- Filter ngày bắt đầu ---
    let leaveDateFilter: Prisma.LeaveRequestWhereInput = {};
    if (filterDate) {
      const start = startOfDay(new Date(filterDate));
      const end = endOfDay(new Date(filterDate));

      leaveDateFilter = {
        AND: [
          { startDate: { lte: end } },   // ngày bắt đầu ≤ ngày filter
          { endDate: { gte: start } },   // ngày kết thúc ≥ ngày filter
        ],
      };
    }

    // --- Kết hợp tất cả filter ---
    const baseWhere: Prisma.LeaveRequestWhereInput = {
      status: statusFilter,
      employee: employeeFilter,
      ...leaveDateFilter,
    };

    // --- Lấy dữ liệu từ DB ---
    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          employee: {
            select: {
              name: true,
              employeeCode: true,
              avatar: true,
              workInfo: { select: { department: true, position: true } },
            },
          },
          approvalSteps: {
            include: {
              approvers: {
                include: {
                  approver: { select: { id: true, name: true, employeeCode: true } },
                },
              },
            },
          },
        },
      }),
      prisma.leaveRequest.count({ where: baseWhere }),
    ]);

    // --- Map dữ liệu: gộp người phê duyệt thành string ---
    const processedRequests = requests.map((req) => {
      const approversString = req.approvalSteps
        .flatMap((step) =>
          step.approvers.map(
            (a) => `${a.approver?.name || ""} (${a.approver?.employeeCode || ""})`
          )
        )
        .filter(Boolean)
        .join("; ");

      return { ...req, approvers: approversString };
    });

    return NextResponse.json({ data: processedRequests, total, page, pageSize });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn nghỉ:", error);
    return NextResponse.json({ message: "Lấy danh sách thất bại" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value; // lấy token từ cookie
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Bạn không có quyền" }, { status: 403 });
    }

    const body = await req.json();
    const { id, leaveType, startDate, endDate } = body;

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID đơn nghỉ phép" }, { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return NextResponse.json({ message: "Không tìm thấy đơn nghỉ phép" }, { status: 404 });
    }

    // --- Chuẩn bị dữ liệu cập nhật ---
    const dataToUpdate: Prisma.LeaveRequestUpdateInput = {};
    if (leaveType) dataToUpdate.leaveType = leaveType;
    if (startDate) dataToUpdate.startDate = new Date(startDate);
    if (endDate) dataToUpdate.endDate = new Date(endDate);

    // Kiểm tra logic ngày: startDate ≤ endDate
    if (dataToUpdate.startDate && dataToUpdate.endDate) {
      if (dataToUpdate.startDate > dataToUpdate.endDate) {
        return NextResponse.json(
          { message: "Ngày bắt đầu không được lớn hơn ngày kết thúc" },
          { status: 400 }
        );
      }
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      message: "Cập nhật đơn nghỉ thành công",
      data: updatedLeave,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật đơn nghỉ:", error);
    return NextResponse.json({ message: "Cập nhật thất bại" }, { status: 500 });
  }
}

// app/api/leaveRequests/route.ts
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Thiếu ID đơn nghỉ phép" },
        { status: 400 }
      );
    }

     const token = req.cookies.get("token")?.value; // lấy token từ cookie
  if (!token) return NextResponse.json({ message: "Thiếu token" }, { status: 401 });

  // giải mã token và kiểm tra role
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  if (decoded.role !== "ADMIN") {
    return NextResponse.json({ message: "Bạn không có quyền" }, { status: 403 });
  }

    // --- Xóa đơn ---
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: Number(id) },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ phép" },
        { status: 404 }
      );
    }

    await prisma.leaveRequest.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Xóa đơn nghỉ thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa đơn nghỉ:", error);
    return NextResponse.json({ message: "Xóa đơn thất bại" }, { status: 500 });
  }
}