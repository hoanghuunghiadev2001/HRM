import { NextResponse } from "next/server";
import { subWeeks, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1️⃣ Chủ nhật tuần trước
    const lastWeek = subWeeks(new Date(), 1);
    const lastSunday = endOfWeek(lastWeek, { weekStartsOn: 1 });

    const from = startOfDay(lastSunday);
    const to = endOfDay(lastSunday);

    // 2️⃣ Chấm công Chủ nhật
    const attendances = await prisma.attendance.findMany({
      where: {
        date: { gte: from, lte: to },
        OR: [{ checkInTime: { not: null } }, { workingHours: { gt: 0 } }],
        employee: {
          isActive: true,
        },
      },
      select: {
        employeeId: true,
        date: true,
      },
    });

    let created = 0;

    for (const a of attendances) {
      // 3️⃣ Tránh cấp trùng
      const existed = await prisma.compensatoryLeave.findUnique({
        where: {
          employeeId_workDate: {
            employeeId: a.employeeId,
            workDate: a.date,
          },
        },
      });

      if (!existed) {
        await prisma.compensatoryLeave.create({
          data: {
            employeeId: a.employeeId,
            workDate: a.date,
            note: "Làm việc Chủ nhật",
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      sunday: lastSunday,
      granted: created,
    });
  } catch (error) {
    console.error("GRANT COMPENSATORY LEAVE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
