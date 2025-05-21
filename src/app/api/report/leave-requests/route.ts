import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaveStatus, LeaveTypeEnum } from "../../../../../generated/prisma";

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as LeaveStatus | null;
    const type = searchParams.get("type") as LeaveTypeEnum | null;
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Number.parseInt(searchParams.get("limit") || "100");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.leaveType = type;
    }

    if (employeeId) {
      where.employeeId = Number.parseInt(employeeId);
    }

    // Date filtering
    if (startDate || endDate) {
      where.OR = [];

      if (startDate && endDate) {
        // Requests that overlap with the date range
        where.OR.push({
          startDate: {
            lte: new Date(endDate),
          },
          endDate: {
            gte: new Date(startDate),
          },
        });
      } else if (startDate) {
        // Requests that end on or after startDate
        where.OR.push({
          endDate: {
            gte: new Date(startDate),
          },
        });
      } else if (endDate) {
        // Requests that start on or before endDate
        where.OR.push({
          startDate: {
            lte: new Date(endDate),
          },
        });
      }
    }

    // Get leave requests with employee info
    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          include: {
            workInfo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.leaveRequest.count({ where });

    // Calculate statistics
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

async function calculateLeaveStats() {
  // Get counts by leave type
  const leaveTypeStats = await prisma.leaveRequest.groupBy({
    by: ["leaveType"],
    _count: {
      id: true,
    },
  });

  // Get counts by status
  const statusStats = await prisma.leaveRequest.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  // Get monthly counts for the current year
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

  // Group by month
  const monthlyStats = Array(12)
    .fill(0)
    .map((_, i) => ({
      month: i + 1,
      count: 0,
      hours: 0,
    }));

  monthlyLeaves.forEach(
    (leave: { startDate: string | number | Date; totalHours: any }) => {
      const month = new Date(leave.startDate).getMonth();
      monthlyStats[month].count++;
      monthlyStats[month].hours += leave.totalHours || 0;
    }
  );

  return {
    byType: leaveTypeStats,
    byStatus: statusStats,
    monthly: monthlyStats,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, leaveType, startDate, endDate, totalHours, reason } =
      body;

    // Validate required fields
    if (!employeeId || !leaveType || !startDate || !endDate) {
      return NextResponse.json(
        {
          error:
            "Employee ID, leave type, start date, and end date are required",
        },
        { status: 400 }
      );
    }

    // Create leave request
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

// Helper function to calculate hours between dates (excluding weekends)
function calculateHours(startDate: Date, endDate: Date) {
  let hours = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Skip weekends (0 = Sunday, 6 = Saturday)
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      hours += 8; // Assuming 8-hour workday
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return hours;
}
