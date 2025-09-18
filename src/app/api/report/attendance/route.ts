/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma, Attendance } from "../../../../../generated/prisma";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

type AttendanceWithEmployeeFlat = Attendance & {
  employee: {
    id: number;
    name: string;
    employeeCode: string;
    workInfo: {
      department: string | null;
    } | null;
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const employeeId = searchParams.get("employeeId");
    const department = searchParams.get("department");

    const where: Prisma.AttendanceWhereInput = {};

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = { gte: new Date(startDate) };
    } else if (endDate) {
      where.date = { lte: new Date(endDate) };
    }

    if (employeeId) where.employeeId = Number.parseInt(employeeId);

    const attendanceDataRaw = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            workInfo: {
              select: {
                department: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    // Flatten department
    let attendanceData: AttendanceWithEmployeeFlat[] = attendanceDataRaw.map(
      (record) => ({
        ...record,
        employee: {
          ...record.employee,
          workInfo: record.employee.workInfo
            ? {
                department: record.employee.workInfo.department?.name ?? null,
              }
            : null,
        },
      })
    );

    // Filter theo department nếu có
    if (department) {
      attendanceData = attendanceData.filter(
        (r) => r.employee.workInfo?.department === department
      );
    }

    const stats = calculateAttendanceStats(attendanceData);

    return NextResponse.json({
      data: attendanceData,
      stats,
    });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}

/* ----------------- Hàm tính thống kê ----------------- */
type DailyStat = {
  date: string; // YYYY-MM-DD
  onTime: number;
  late: number;
  absent: number;
  earlyLeave: number;
  total: number;
};

type AttendanceStats = {
  dailyStats: DailyStat[];
  summary: {
    onTime: number;
    late: number;
    absent: number;
    earlyLeave: number;
    total: number;
  };
};

function calculateAttendanceStats(
  data: AttendanceWithEmployeeFlat[]
): AttendanceStats {
  const groupedByDate: Record<string, AttendanceWithEmployeeFlat[]> = {};

  for (const record of data) {
    const dateStr = dayjs(record.date)
      .tz("Asia/Ho_Chi_Minh", true)
      .format("YYYY-MM-DD");
    if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
    groupedByDate[dateStr].push(record);
  }

  const dailyStats: DailyStat[] = Object.entries(groupedByDate).map(
    ([dateStr, records]) => {
      const shiftStart = dayjs.tz(`${dateStr} 08:00`, "YYYY-MM-DD HH:mm", "Asia/Ho_Chi_Minh");
      const shiftEnd = dayjs.tz(`${dateStr} 17:00`, "YYYY-MM-DD HH:mm", "Asia/Ho_Chi_Minh");

      let onTime = 0;
      let late = 0;
      let absent = 0;
      let earlyLeave = 0;

      for (const r of records) {
        const checkInLocal = r.checkInTime
          ? dayjs.tz(r.checkInTime.toISOString(), "Asia/Ho_Chi_Minh")
          : null;
        const checkOutLocal = r.checkOutTime
          ? dayjs.tz(r.checkOutTime.toISOString(), "Asia/Ho_Chi_Minh")
          : null;

        if (!checkInLocal) {
          absent++;
          continue;
        }

        // Chỉ lấy giờ + phút của check-in/check-out để so sánh với ca
        const checkInTimeOnly = checkInLocal.set('year', shiftStart.year())
          .set('month', shiftStart.month())
          .set('date', shiftStart.date());
        const checkOutTimeOnly = checkOutLocal
          ? checkOutLocal.set('year', shiftStart.year())
              .set('month', shiftStart.month())
              .set('date', shiftStart.date())
          : null;

        // Tính late/onTime
        if (checkInTimeOnly.isAfter(shiftStart)) {
          late++;
        } else {
          onTime++;
        }

        // Tính early leave
        if (checkOutTimeOnly && checkOutTimeOnly.isBefore(shiftEnd)) {
          earlyLeave++;
        }
      }

      return {
        date: dateStr,
        onTime,
        late,
        absent,
        earlyLeave,
        total: records.length,
      };
    }
  );

  dailyStats.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

  const summary = dailyStats.reduce(
    (acc, day) => {
      acc.onTime += day.onTime;
      acc.late += day.late;
      acc.absent += day.absent;
      acc.earlyLeave += day.earlyLeave;
      acc.total += day.total;
      return acc;
    },
    { onTime: 0, late: 0, absent: 0, earlyLeave: 0, total: 0 }
  );

  return { dailyStats, summary };
}

/* ----------------- POST handler ----------------- */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, date, checkInTime, checkOutTime } = body;

    if (!employeeId || !date) {
      return NextResponse.json(
        { error: "Employee ID and date are required" },
        { status: 400 }
      );
    }

    const parsedEmployeeId = Number.parseInt(employeeId);
    const parsedDate = new Date(date);

    const existingRecord = await prisma.attendance.findFirst({
      where: { employeeId: parsedEmployeeId, date: parsedDate },
    });

    let attendance;

    if (existingRecord) {
      attendance = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          checkInTime: checkInTime ? new Date(checkInTime) : existingRecord.checkInTime,
          checkOutTime: checkOutTime ? new Date(checkOutTime) : existingRecord.checkOutTime,
        },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          employeeId: parsedEmployeeId,
          date: parsedDate,
          checkInTime: checkInTime ? new Date(checkInTime) : null,
          checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        },
      });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error saving attendance data:", error);
    return NextResponse.json(
      { error: "Failed to save attendance data" },
      { status: 500 }
    );
  }
}
