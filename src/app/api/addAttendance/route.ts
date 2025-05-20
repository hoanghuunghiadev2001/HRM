import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { employeeCode, timeScan } = await req.json();

    if (!employeeCode || !timeScan) {
      return NextResponse.json({ message: "Thiếu dữ liệu" }, { status: 400 });
    }

    // Tìm nhân viên theo employeeCode
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
    const dateOnlyStr = scanDate.toISOString().slice(0, 10); // yyyy-mm-dd

    // Tìm bản ghi attendance ngày đó của nhân viên, lấy bản mới nhất (id DESC)
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
      // Tạo mới với checkInTime
      const newAttendance = await prisma.attendance.create({
        data: {
          employeeId,
          date: new Date(dateOnlyStr),
          checkInTime: scanDate,
        },
      });
      return NextResponse.json({
        message: "Chấm công vào thành công",
        attendance: newAttendance,
      });
    } else {
      if (!lastAttendance.checkOutTime) {
        // Cập nhật checkOutTime cho bản ghi hiện tại
        const updatedAttendance = await prisma.attendance.update({
          where: { id: lastAttendance.id },
          data: { checkOutTime: scanDate },
        });
        return NextResponse.json({
          message: "Chấm công ra thành công",
          attendance: updatedAttendance,
        });
      } else {
        // Đã có đủ IN/OUT cho bản ghi cuối cùng -> tạo bản mới với checkInTime
        const newAttendance = await prisma.attendance.create({
          data: {
            employeeId,
            date: new Date(dateOnlyStr),
            checkInTime: scanDate,
          },
        });
        return NextResponse.json({
          message: "Chấm công vào (lần 2) thành công",
          attendance: newAttendance,
        });
      }
    }
  } catch (error) {
    console.error("Error checkin/out:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
