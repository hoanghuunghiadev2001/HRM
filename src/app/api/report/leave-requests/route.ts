/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  LeaveStatus,
  LeaveTypeEnum,
  Prisma,
} from "../../../../../generated/prisma";

// [GET] Lấy danh sách đơn nghỉ có phân trang + lọc
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as LeaveStatus | null;
    const type = searchParams.get("type") as LeaveTypeEnum | null;
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Number.parseInt(searchParams.get("limit") || "100");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Tạo điều kiện lọc dữ liệu
    const where: Prisma.LeaveRequestWhereInput = {};

    if (status) where.status = status;
    if (type) where.leaveType = type;
    if (employeeId) where.employeeId = Number.parseInt(employeeId);

    // Lọc theo khoảng thời gian nếu có
    if (startDate || endDate) {
      where.OR = [];

      if (startDate && endDate) {
        where.OR.push({
          startDate: { lte: new Date(endDate) },
          endDate: { gte: new Date(startDate) },
        });
      } else if (startDate) {
        where.OR.push({ endDate: { gte: new Date(startDate) } });
      } else if (endDate) {
        where.OR.push({ startDate: { lte: new Date(endDate) } });
      }
    }

    // Truy vấn dữ liệu đơn nghỉ kèm nhân viên
    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          include: {
            workInfo: true, // Lấy thông tin phòng ban, chức vụ
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Tổng số bản ghi
    const total = await prisma.leaveRequest.count({ where });

    // Thống kê tổng hợp
    const stats = await calculateLeaveStats();

    return NextResponse.json({
      data: leaveRequests,
      stats,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

// Hàm tính toán thống kê đơn nghỉ
async function calculateLeaveStats() {
  // Thống kê theo loại nghỉ
  const leaveTypeStats = await prisma.leaveRequest.groupBy({
    by: ["leaveType"],
    _count: { id: true },
  });

  // Thống kê theo trạng thái
  const statusStats = await prisma.leaveRequest.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  // Thống kê theo tháng trong năm hiện tại
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

  const monthlyLeaves = await prisma.leaveRequest.findMany({
    where: {
      startDate: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    select: {
      startDate: true,
      endDate: true,
      totalHours: true,
      leaveType: true,
    },
  });

  // Mảng lưu thống kê theo tháng
  const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: 0,
    hours: 0,
  }));

  monthlyLeaves.forEach((leave: any) => {
    const month = new Date(leave.startDate).getMonth();
    monthlyStats[month].count++;
    monthlyStats[month].hours += leave.totalHours || 0;
  });

  return {
    byType: leaveTypeStats,
    byStatus: statusStats,
    monthly: monthlyStats,
  };
}

// [POST] Tạo đơn xin nghỉ mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, leaveType, startDate, endDate, totalHours, reason } =
      body;

    // Kiểm tra dữ liệu đầu vào
    if (!employeeId || !leaveType || !startDate || !endDate) {
      return NextResponse.json(
        {
          error:
            "Employee ID, leave type, start date, and end date are required",
        },
        { status: 400 }
      );
    }

    // Tạo đơn nghỉ
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: Number.parseInt(employeeId),
        leaveType: leaveType as LeaveTypeEnum,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalHours:
          totalHours || calculateHours(new Date(startDate), new Date(endDate)),
        reason,
        status: LeaveStatus.pending,
      },
    });

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 }
    );
  }
}

// Tính số giờ nghỉ giữa 2 ngày (trừ cuối tuần)
function calculateHours(startDate: Date, endDate: Date): number {
  let hours = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      hours += 8; // 8 tiếng mỗi ngày làm việc
    }
    current.setDate(current.getDate() + 1);
  }

  return hours;
}
