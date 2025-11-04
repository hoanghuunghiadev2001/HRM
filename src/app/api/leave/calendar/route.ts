// app/api/leave/calendar/route.ts

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Thiếu token xác thực" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const employee = await prisma.employee.findUnique({
      where: { id: decoded.id },
      include: {
        workInfo: { include: { department: true } },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Không tìm thấy nhân viên" },
        { status: 404 }
      );
    }

    const isAdmin = employee.role === "ADMIN";
    const departmentId = employee.workInfo?.departmentId;

    // Lấy danh sách nghỉ phép được duyệt
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        status: "approved",
        ...(isAdmin
          ? {}
          : {
              employee: {
                workInfo: { departmentId: departmentId ?? 0 },
              },
            }),
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    // Gom nhóm theo ngày
    const leaveCounts: Record<string, number> = {};

    for (const leave of leaveRequests) {
      const start = dayjs(leave.startDate);
      const end = dayjs(leave.endDate);
      for (
        let d = start;
        d.isBefore(end) || d.isSame(end, "day");
        d = d.add(1, "day")
      ) {
        const key = d.format("YYYY-MM-DD");
        leaveCounts[key] = (leaveCounts[key] || 0) + 1;
      }
    }

    const result = Object.entries(leaveCounts).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
