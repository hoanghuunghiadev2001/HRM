import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { WorkStatus } from "../../../../../generated/prisma";

export async function GET() {
  try {
    // Get current date info
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Get previous month for comparison
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const firstDayOfPrevMonth = new Date(prevMonthYear, prevMonth, 1);
    const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0);

    // 1. Total employees count
    const totalEmployees = await prisma.employee.count({
      where: {
        otherInfo: {
          workStatus: {
            in: [WorkStatus.OFFICIAL, WorkStatus.PROBATION],
          },
        },
      },
    });

    // 2. New employees this month
    const newEmployees = await prisma.employee.count({
      where: {
        workInfo: {
          joinedTeSCC: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      },
    });

    // 3. New employees last month (for comparison)
    const newEmployeesPrevMonth = await prisma.employee.count({
      where: {
        workInfo: {
          joinedTeSCC: {
            gte: firstDayOfPrevMonth,
            lte: lastDayOfPrevMonth,
          },
        },
      },
    });

    // 4. Attendance rate for current month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    const workingDaysCount = getWorkingDaysCount(firstDayOfMonth, today);
    const expectedAttendance = totalEmployees * workingDaysCount;
    const actualAttendance = attendanceRecords.filter(
      (record) => record.checkInTime
    ).length;
    const attendanceRate =
      expectedAttendance > 0
        ? (actualAttendance / expectedAttendance) * 100
        : 0;

    // 5. Attendance rate for previous month
    const prevMonthAttendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: firstDayOfPrevMonth,
          lte: lastDayOfPrevMonth,
        },
      },
    });

    const prevMonthWorkingDays = getWorkingDaysCount(
      firstDayOfPrevMonth,
      lastDayOfPrevMonth
    );
    const prevMonthExpectedAttendance = totalEmployees * prevMonthWorkingDays;
    const prevMonthActualAttendance = prevMonthAttendanceRecords.filter(
      (record) => record.checkInTime
    ).length;
    const prevMonthAttendanceRate =
      prevMonthExpectedAttendance > 0
        ? (prevMonthActualAttendance / prevMonthExpectedAttendance) * 100
        : 0;

    // 6. Leave requests stats
    const pendingLeaveRequests = await prisma.leaveRequest.count({
      where: {
        status: "pending",
      },
    });

    const totalLeaveRequests = await prisma.leaveRequest.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    // 7. Employee status distribution
    const employeeStatusDistribution = await prisma.otherInfo.groupBy({
      by: ["workStatus"],
      _count: {
        employeeId: true,
      },
    });

    // 8. Department distribution
    const departmentDistribution = await prisma.workInfo.groupBy({
      by: ["department"],
      _count: {
        employeeId: true,
      },
    });

    // 9. Recent leave requests
    const recentLeaveRequests = await prisma.leaveRequest.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json({
      totalEmployees,
      newEmployees,
      newEmployeesChange: newEmployees - newEmployeesPrevMonth,
      attendanceRate: attendanceRate.toFixed(1),
      attendanceRateChange: (attendanceRate - prevMonthAttendanceRate).toFixed(
        1
      ),
      leaveRequests: {
        total: totalLeaveRequests,
        pending: pendingLeaveRequests,
      },
      employeeStatusDistribution,
      departmentDistribution,
      recentLeaveRequests,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

// Helper function to count working days (excluding weekends)
function getWorkingDaysCount(startDate: Date, endDate: Date) {
  let count = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Bỏ Chủ nhật (0), tính thứ 7 (6) là ngày làm việc
    const day = currentDate.getDay();
    if (day !== 0) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}
