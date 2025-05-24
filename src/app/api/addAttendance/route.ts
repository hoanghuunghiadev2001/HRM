import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { employeeCode, timeScan } = await req.json();

    if (!employeeCode || !timeScan) {
      return NextResponse.json({ message: "Thiếu dữ liệu" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Không tìm thấy nhân viên" },
        { status: 404 }
      );
    }

    const employeeId = employee.id;
    const scanDate = new Date(timeScan);
    const dateOnlyStr = scanDate.toISOString().slice(0, 10);

    const lastAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: new Date(dateOnlyStr),
      },
      orderBy: {
        id: "desc",
      },
    });

    if (!lastAttendance) {
      const newAttendance = await prisma.attendance.create({
        data: {
          employeeId,
          date: new Date(dateOnlyStr),
          checkInTime: scanDate,
        },
      });
      return NextResponse.json(
        { message: "Chấm công vào thành công", attendance: newAttendance },
        { status: 200 }
      );
    }

    if (!lastAttendance.checkOutTime) {
      const updatedAttendance = await prisma.attendance.update({
        where: { id: lastAttendance.id },
        data: { checkOutTime: scanDate },
      });
      return NextResponse.json(
        { message: "Chấm công ra thành công", attendance: updatedAttendance },
        { status: 200 }
      );
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: new Date(dateOnlyStr),
        checkInTime: scanDate,
      },
    });

    return NextResponse.json(
      {
        message: "Chấm công vào (lần 2) thành công",
        attendance: newAttendance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checkin/out:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
