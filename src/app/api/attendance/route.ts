/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../generated/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function parseDateVN(dateStr?: string, endOfDay = false): Date | undefined {
  if (!dateStr) return undefined;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    const d = dayjs.tz(
      `${year}-${month}-${day} ${endOfDay ? "23:59:59" : "00:00:00"}`,
      "YYYY-M-D HH:mm:ss",
      "Asia/Ho_Chi_Minh"
    );
    return d.utc().toDate();
  }
  const d = dayjs.tz(dateStr, "Asia/Ho_Chi_Minh");
  return endOfDay ? d.endOf("day").utc().toDate() : d.startOf("day").utc().toDate();
}

function calcHours(checkIn: Date | null, checkOut: Date | null): number {
  if (!checkIn || !checkOut) return 0;
  return +((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(2);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const msnv = searchParams.get("msnv") ?? undefined;
    const name = searchParams.get("name") ?? undefined;
    const department = searchParams.get("department") ?? undefined;
    const fromDate = parseDateVN(searchParams.get("fromDate") ?? undefined);
    const toDate = parseDateVN(searchParams.get("toDate") ?? undefined, true);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20", 10);

    // 1️⃣ Lấy danh sách employeeId theo filter
    const employeeWhere: Prisma.EmployeeWhereInput = {};
    if (msnv) employeeWhere.employeeCode = { contains: msnv };
    if (name) employeeWhere.name = { contains: name };
    if (department) {
      const parts = department.split("-");
      const departmentId = parts[0] ? parseInt(parts[0], 10) : undefined;
      const positionId = parts[1] ? parseInt(parts[1], 10) : undefined;
      employeeWhere.workInfo = {
        ...(departmentId && { departmentId }),
        ...(positionId && { positionId }),
      };
    }

    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true, employeeCode: true, name: true, avatar: true, workInfo: { select: { department: { select: { name: true } }, position: { select: { name: true } } } } } 
    });
    const employeeMap = new Map(employees.map(e => [e.id, e]));

    if (employees.length === 0) {
      return NextResponse.json({ total: 0, page, pageSize, data: [] });
    }

    const employeeIds = employees.map(e => e.id);

    // 2️⃣ Lấy Attendance theo employeeId và date
    const attendanceWhere: Prisma.AttendanceWhereInput = {
      employeeId: { in: employeeIds },
      ...(fromDate && toDate
        ? { date: { gte: fromDate, lte: toDate } }
        : fromDate
        ? { date: { gte: fromDate } }
        : toDate
        ? { date: { lte: toDate } }
        : {}),
    };

    const attendances = await prisma.attendance.findMany({
      where: attendanceWhere,
      orderBy: { date: "asc" },
    });

    // 3️⃣ Gom nhóm theo employeeId + date
    const grouped = new Map<
      string,
      {
        employeeId: number;
        employeeCode: string;
        avatar?: string | null;
        employeeName: string;
        department?: string;
        position?: string;
        date: string;
        firstCheckIn: Date | null;
        lastCheckOut: Date | null;
        totalMs: number;
      }
    >();

    attendances.forEach(att => {
      const emp = employeeMap.get(att.employeeId)!;
      const dateVN = dayjs(att.date).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
      const key = `${att.employeeId}-${dateVN}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          employeeId: att.employeeId,
          employeeCode: emp.employeeCode,
          avatar: emp.avatar,
          employeeName: emp.name,
          department: emp.workInfo?.department?.name,
          position: emp.workInfo?.position?.name,
          date: dateVN,
          firstCheckIn: att.checkInTime ?? null,
          lastCheckOut: att.checkOutTime ?? null,
          totalMs: 0,
        });
      }

      const group = grouped.get(key)!;

      if (att.checkInTime && (!group.firstCheckIn || att.checkInTime < group.firstCheckIn)) {
        group.firstCheckIn = att.checkInTime;
      }

      if (att.checkOutTime && (!group.lastCheckOut || att.checkOutTime > group.lastCheckOut)) {
        group.lastCheckOut = att.checkOutTime;
      }

      if (att.checkInTime && att.checkOutTime) {
        group.totalMs += att.checkOutTime.getTime() - att.checkInTime.getTime();
      }
    });

    const summary = Array.from(grouped.values()).map(g => ({
      employeeId: g.employeeId,
      employeeCode: g.employeeCode,
      avatar: g.avatar,
      employeeName: g.employeeName,
      department: g.department,
      position: g.position,
      date: g.date,
      firstCheckIn: g.firstCheckIn?.toISOString() ?? null,
      lastCheckOut: g.lastCheckOut?.toISOString() ?? null,
      totalHours: calcHours(g.firstCheckIn, g.lastCheckOut),
    }));

    const total = summary.length;
    const start = (page - 1) * pageSize;
    const pagedSummary = summary.slice(start, start + pageSize);

    return NextResponse.json({
      total,
      page,
      pageSize,
      data: pagedSummary,
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
