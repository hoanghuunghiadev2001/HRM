import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const employeeId = searchParams.get("employeeId");
    const department = searchParams.get("department");

    // Build where clause
    const where: any = {};

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

    // If department is specified, we need to join with employee and workInfo
    let attendanceData;

    if (department) {
      attendanceData = await prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              workInfo: true, // nếu cần
              // không include password
            },
          },
        },
      });

      // Filter by department after fetching
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
              workInfo: true, // nếu cần
              // không include password
            },
          },
        },
      });
    }

    // Calculate statistics
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

function calculateAttendanceStats(attendanceData: any[]) {
  // Group by date
  const groupedByDate = attendanceData.reduce((acc, record) => {
    const dateStr = record.date.toISOString().split("T")[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(record);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate stats for each date
  let dailyStats = Object.entries(groupedByDate).map(([date, records]) => {
    const typedRecords = records as any[]; // 👈 ép kiểu ở đây

    const onTime = typedRecords.filter(
      (r) => r.checkInTime && new Date(r.checkInTime).getHours() < 8
    ).length;
    console.log(
      typedRecords.filter(
        (r) => r.checkInTime && new Date(r.checkInTime).getHours() < 8
      ).length
    );

    const late = typedRecords.filter(
      (r) => r.checkInTime && new Date(r.checkInTime).getHours() >= 8
    ).length;

    const absent = typedRecords.filter((r) => !r.checkInTime).length;

    return {
      date,
      onTime,
      late,
      absent,
      total: typedRecords.length,
    };
  });

  // 👉 Sort từ ngày bé đến ngày lớn
  dailyStats = dailyStats.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    dailyStats,
    summary: dailyStats.reduce(
      (acc, day) => {
        acc.onTime += day.onTime;
        acc.late += day.late;
        acc.absent += day.absent;
        acc.total += day.total;
        return acc;
      },
      { onTime: 0, late: 0, absent: 0, total: 0 }
    ),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, date, checkInTime, checkOutTime } = body;

    // Validate required fields
    if (!employeeId || !date) {
      return NextResponse.json(
        { error: "Employee ID and date are required" },
        { status: 400 }
      );
    }

    // Check if record already exists
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        employeeId: Number.parseInt(employeeId),
        date: new Date(date),
      },
    });

    let attendance;

    if (existingRecord) {
      // Update existing record
      attendance = await prisma.attendance.update({
        where: {
          id: existingRecord.id,
        },
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
      // Create new record
      attendance = await prisma.attendance.create({
        data: {
          employeeId: Number.parseInt(employeeId),
          date: new Date(date),
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
