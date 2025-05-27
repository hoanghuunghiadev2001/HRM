import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "../../../../../generated/prisma";

// Định nghĩa kiểu dữ liệu cho record có include employee
type AttendanceWithEmployee = Awaited<
  ReturnType<typeof prisma.attendance.findFirst>
> & {
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

    const where: Prisma.AttendanceWhereInput = {}; // 👈 Đây là chỗ duy nhất còn dùng `any` vì Prisma chưa hỗ trợ strongly-typed `where` phức tạp (có thể dùng Zod nếu muốn chắc chắn hơn).

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      };
    }

    if (employeeId) {
      where.employeeId = Number.parseInt(employeeId);
    }

    let attendanceData: AttendanceWithEmployee[] = [];

    if (department) {
      attendanceData = await prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              workInfo: true,
            },
          },
        },
      });

      attendanceData = attendanceData.filter(
        (record) => record.employee.workInfo?.department === department
      );
    } else {
      attendanceData = await prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              workInfo: true,
            },
          },
        },
      });
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

type DailyStat = {
  date: string;
  onTime: number;
  late: number;
  absent: number;
  total: number;
};

type AttendanceStats = {
  dailyStats: DailyStat[];
  summary: {
    onTime: number;
    late: number;
    absent: number;
    total: number;
  };
};

function calculateAttendanceStats(
  data: AttendanceWithEmployee[]
): AttendanceStats {
  const groupedByDate: Record<string, AttendanceWithEmployee[]> = {};

  for (const record of data) {
    // Chuyển ngày attendance.date sang giờ VN để group đúng ngày
    const dateUtc = new Date(record.date);
    const dateVn = new Date(dateUtc.getTime() + 7 * 60 * 60 * 1000);
    const dateStr = dateVn.toISOString().slice(0, 10);

    if (!groupedByDate[dateStr]) {
      groupedByDate[dateStr] = [];
    }
    groupedByDate[dateStr].push(record);
  }

  const dailyStats: DailyStat[] = Object.entries(groupedByDate).map(
    ([dateStr, records]) => {
      // Tạo mốc 8:00 sáng giờ VN theo ngày đó
      const baseTime = new Date(`${dateStr}T08:00:00+07:00`);
      const baseTime2 = new Date(`${dateStr}T12:00:00+07:00`);
      const baseTime3 = new Date(`${dateStr}T13:00:00+07:00`);

      // baseTime.getTime() ra UTC timestamp tương ứng với 8:00 giờ VN ngày đó

      let onTime = 0,
        late = 0,
        absent = 0;

      for (const r of records) {
        if (!r.checkInTime) {
          absent++;
          continue;
        }
        // checkInTime là UTC, lấy timestamp UTC
        const checkInUtc =
          new Date(r.checkInTime).getTime() - 7 * 60 * 60 * 1000;

        // So sánh checkIn UTC với mốc 8:00 giờ VN đã convert sang UTC timestamp
        if (
          checkInUtc <= baseTime.getTime() ||
          (checkInUtc > baseTime2.getTime() &&
            checkInUtc <= baseTime3.getTime())
        ) {
          onTime++;
        } else {
          late++;
        }
      }

      return {
        date: dateStr,
        onTime,
        late,
        absent,
        total: records.length,
      };
    }
  );

  dailyStats.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const summary = dailyStats.reduce(
    (acc, day) => {
      acc.onTime += day.onTime;
      acc.late += day.late;
      acc.absent += day.absent;
      acc.total += day.total;
      return acc;
    },
    { onTime: 0, late: 0, absent: 0, total: 0 }
  );

  return {
    dailyStats,
    summary,
  };
}

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
      where: {
        employeeId: parsedEmployeeId,
        date: parsedDate,
      },
    });

    let attendance;

    if (existingRecord) {
      attendance = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          checkInTime: checkInTime
            ? new Date(checkInTime)
            : existingRecord.checkInTime,
          checkOutTime: checkOutTime
            ? new Date(checkOutTime)
            : existingRecord.checkOutTime,
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
