import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  // parse định dạng dd/MM/yyyy hoặc ISO
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d;
}

function toUTCDate(date: Date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const msnv = searchParams.get("msnv") ?? undefined;
    const name = searchParams.get("name") ?? undefined;
    const department = searchParams.get("department") ?? undefined;
    let fromDate = parseDate(searchParams.get("fromDate") ?? undefined);
    let toDate = parseDate(searchParams.get("toDate") ?? undefined);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20", 10);

    // Chuẩn hóa fromDate thành 00:00:00 UTC
    if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
      fromDate = toUTCDate(fromDate);
    }

    // Chuẩn hóa toDate thành 23:59:59.999 UTC
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
      toDate = toUTCDate(toDate);
    }

    // Điều kiện lọc nhân viên
    const employeeWhere: any = {};
    if (msnv) employeeWhere.employeeCode = { contains: msnv };
    if (name) employeeWhere.name = { contains: name };
    if (department) {
      employeeWhere.workInfo = {
        is: {
          department: { contains: department },
        },
      };
    }

    // Điều kiện lọc attendance
    const attendanceWhere: any = {};
    if (fromDate) attendanceWhere.date = { gte: fromDate };
    if (toDate)
      attendanceWhere.date = {
        ...(attendanceWhere.date || {}),
        lte: toDate,
      };

    // Lấy tất cả attendance thỏa điều kiện với employee info
    // Không phân trang để tính tổng số bản ghi sau khi group theo employeeId + date
    const attendances = await prisma.attendance.findMany({
      where: {
        AND: [
          attendanceWhere,
          {
            employee: {
              is: {
                ...employeeWhere,
              },
            },
          },
        ],
      },
      select: {
        employeeId: true,
        date: true,
        checkInTime: true,
        checkOutTime: true,
        employee: {
          select: {
            employeeCode: true,
            name: true,
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
      orderBy: {
        date: "asc",
      },
    });
    // Group theo employeeId + date
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

    attendances.forEach((att) => {
      const key = `${att.employeeId}-${att.date.toISOString().slice(0, 10)}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          employeeId: att.employeeId,
          employeeCode: att.employee.employeeCode,
          avatar: att.employee.avatar,
          employeeName: att.employee.name,
          department: att.employee.workInfo?.department,
          position: att.employee.workInfo?.position,
          date: att.date.toISOString().slice(0, 10),
          firstCheckIn: att.checkInTime ?? null,
          lastCheckOut: att.checkOutTime ?? null,
          totalMs: 0,
        });
      }

      const group = grouped.get(key)!;

      // Cập nhật giờ vào sớm nhất
      if (
        att.checkInTime &&
        (!group.firstCheckIn || att.checkInTime < group.firstCheckIn)
      ) {
        group.firstCheckIn = att.checkInTime;
      }
      // Cập nhật giờ ra muộn nhất
      if (
        att.checkOutTime &&
        (!group.lastCheckOut || att.checkOutTime > group.lastCheckOut)
      ) {
        group.lastCheckOut = att.checkOutTime;
      }

      // Cộng tổng giờ làm (chỉ tính khi có checkIn và checkOut)
      if (att.checkInTime && att.checkOutTime) {
        group.totalMs += att.checkOutTime.getTime() - att.checkInTime.getTime();
      }
    });

    // Chuyển thành mảng và tính tổng giờ theo đơn vị giờ, 2 chữ số thập phân
    const summary = Array.from(grouped.values()).map((g) => {
      return {
        employeeId: g.employeeId,
        employeeCode: g.employeeCode,
        avatar: g.avatar,
        employeeName: g.employeeName,
        department: g.department,
        position: g.position,
        date: g.date,
        firstCheckIn: g.firstCheckIn?.toISOString() ?? null,
        lastCheckOut: g.lastCheckOut?.toISOString() ?? null,
        totalHours: +(g.totalMs / (1000 * 60 * 60)).toFixed(2),
      };
    });

    // Phân trang thủ công
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
