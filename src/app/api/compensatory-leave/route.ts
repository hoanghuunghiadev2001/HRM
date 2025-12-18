/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { subWeeks, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
interface JWTPayload {
  id: number;
  role: string;
  employeeCode: string;
  departmentId?: number;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (!decoded.role) {
      return NextResponse.json(
        { message: "Không có quyền xem danh sách" },
        { status: 403 }
      );
    }
    // 1️⃣ Xác định Chủ nhật tuần trước
    const lastWeek = subWeeks(new Date(), 1);
    const lastSunday = endOfWeek(lastWeek, { weekStartsOn: 1 });

    const from = startOfDay(lastSunday);
    const to = endOfDay(lastSunday);

    // 2️⃣ Lấy danh sách chấm công Chủ nhật
    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: from,
          lte: to,
        },
        OR: [{ checkInTime: { not: null } }, { workingHours: { gt: 0 } }],
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
            isActive: true,
            workInfo: {
              select: {
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 3️⃣ Gom nhân viên (tránh trùng)
    const result = attendances.map((a) => ({
      employeeId: a.employee.id,
      employeeCode: a.employee.employeeCode,
      name: a.employee.name,
      departmentName:
        a.employee.workInfo?.department?.name ?? "Chưa phân phòng",
      attendanceDate: a.date,
      workingHours: a.workingHours ?? 0,
    }));

    return NextResponse.json({
      success: true,
      sunday: lastSunday,
      total: result.length,
      data: result,
    });
  } catch (error) {
    console.error("CHECK COMPENSATORY LEAVE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
