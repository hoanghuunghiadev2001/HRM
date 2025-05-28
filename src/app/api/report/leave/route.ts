/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { NextResponse } from "next/server";
import { LeaveTypeEnum, Prisma } from "../../../../../generated/prisma";
import { prisma } from "@/lib/prisma";

// Giao diện đơn nghỉ kèm thông tin nhân viên
type LeaveRequestWithEmployee = Prisma.LeaveRequestGetPayload<{
  include: { employee: { include: { workInfo: true } } };
}>;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const department = searchParams.get("department");
    const groupBy = searchParams.get("groupBy") || "month"; // day, week, month, type

    const validGroupBys = ["day", "week", "month", "type"];
    if (!validGroupBys.includes(groupBy)) {
      return NextResponse.json(
        { error: "Invalid groupBy parameter" },
        { status: 400 }
      );
    }

    const today = new Date();
    const nowVietnam = new Date(today.getTime() + 7 * 60 * 60 * 1000);
    const defaultStart = new Date(nowVietnam.getFullYear(), 0, 1);
    const defaultEnd = new Date(nowVietnam.getFullYear(), 11, 31);

    const start = startDate ? new Date(startDate) : defaultStart;
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : defaultEnd;
    end.setHours(23, 59, 59, 999);

    // Truy vấn toàn bộ đơn nghỉ
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        startDate: { lte: end },
        endDate: { gte: start },
      },
      include: {
        employee: {
          include: {
            workInfo: true,
          },
        },
      },
    });

    // Lọc theo phòng ban nếu có
    const filteredRequests = department
      ? leaveRequests.filter(
          (req: any) => req.employee.workInfo?.department === department
        )
      : leaveRequests;

    // Gom nhóm dữ liệu
    const groupedData =
      groupBy === "type"
        ? groupByType(filteredRequests)
        : groupByTime(filteredRequests, groupBy);

    const summary = getSummary(filteredRequests);

    // Gom đơn nghỉ theo nhân viên
    const employeeDetails = getEmployeeStats(filteredRequests);

    return NextResponse.json({
      data: groupedData,
      summary,
      employeeDetails,
    });
  } catch (error) {
    console.error("Error in leave report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Gom nhóm theo loại nghỉ
function groupByType(requests: LeaveRequestWithEmployee[]) {
  const result: Record<string, any> = {};

  for (const type of Object.values(LeaveTypeEnum)) {
    result[type] = {
      type,
      count: 0,
      hours: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
    };
  }

  for (const req of requests) {
    const item = result[req.leaveType];
    item.count++;
    item.hours += req.totalHours || 0;

    if (req.status === "approved") item.approved++;
    else if (req.status === "rejected") item.rejected++;
    else item.pending++;
  }

  return Object.values(result);
}

// Gom nhóm theo thời gian
function groupByTime(requests: LeaveRequestWithEmployee[], groupBy: string) {
  const result: Record<string, any> = {};

  for (const req of requests) {
    const date = new Date(req.startDate);
    let key: string;

    if (groupBy === "day") {
      key = date.toISOString().split("T")[0];
    } else if (groupBy === "week") {
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const weekNum = Math.ceil(
        ((date.getTime() - firstDay.getTime()) / 86400000 +
          firstDay.getDay() +
          1) /
          7
      );
      key = `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    }

    if (!result[key]) {
      result[key] = {
        period: key,
        total: 0,
        hours: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        byType: {},
      };
      for (const type of Object.values(LeaveTypeEnum)) {
        result[key].byType[type] = { count: 0, hours: 0 };
      }
    }

    const group = result[key];
    group.total++;
    group.hours += req.totalHours || 0;

    if (req.status === "approved") group.approved++;
    else if (req.status === "rejected") group.rejected++;
    else group.pending++;

    group.byType[req.leaveType].count++;
    group.byType[req.leaveType].hours += req.totalHours || 0;
  }

  return Object.values(result).sort((a, b) => a.period.localeCompare(b.period));
}

// Thống kê tổng quan
function getSummary(requests: LeaveRequestWithEmployee[]) {
  const total = requests.length;
  const totalHours = requests.reduce((sum, r) => sum + (r.totalHours || 0), 0);
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;
  const pending = requests.filter((r) => r.status === "pending").length;

  const byType = Object.values(LeaveTypeEnum).map((type) => {
    const list = requests.filter((r) => r.leaveType === type);
    const count = list.length;
    const hours = list.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    return {
      type,
      count,
      hours,
      percentage: total ? (count / total) * 100 : 0,
    };
  });

  return {
    total,
    totalHours,
    approved,
    rejected,
    pending,
    approvalRate: total ? (approved / total) * 100 : 0,
    byType,
  };
}

// Gom đơn nghỉ theo từng nhân viên
function getEmployeeStats(requests: LeaveRequestWithEmployee[]) {
  const result: Record<string, any> = {};

  for (const req of requests) {
    const emp = req.employee;
    const id = emp.id;

    if (!result[id]) {
      result[id] = {
        employeeId: id,
        employeeCode: emp.employeeCode,
        name: emp.name,
        department: emp.workInfo?.department,
        position: emp.workInfo?.position,
        leave: {
          total: 0,
          hours: 0,
          approved: 0,
          byType: {},
        },
      };

      for (const type of Object.values(LeaveTypeEnum)) {
        result[id].leave.byType[type] = { count: 0, hours: 0 };
      }
    }

    const stats = result[id].leave;
    stats.total++;
    stats.hours += req.totalHours || 0;
    if (req.status === "approved") stats.approved++;

    stats.byType[req.leaveType].count++;
    stats.byType[req.leaveType].hours += req.totalHours || 0;
  }

  return Object.values(result);
}
