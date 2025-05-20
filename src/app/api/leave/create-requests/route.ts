import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      employeeId,
      leaveType,
      startDateTime,
      endDateTime,
      reason,
      totalHours,
    } = body;

    // Validate dữ liệu bắt buộc
    if (
      !employeeId?.toString().trim() ||
      !leaveType?.toString().trim() ||
      !startDateTime?.toString().trim() ||
      !endDateTime?.toString().trim() ||
      totalHours === undefined
    ) {
      return NextResponse.json(
        { message: "Thiếu trường dữ liệu bắt buộc" },
        { status: 400 }
      );
    }

    const start = dayjs(startDateTime, "DD/MM/YYYY HH:mm:ss", true);
    const end = dayjs(endDateTime, "DD/MM/YYYY HH:mm:ss", true);

    if (!start.isValid() || !end.isValid()) {
      return NextResponse.json(
        { message: "Định dạng ngày giờ không hợp lệ" },
        { status: 400 }
      );
    }

    if (start.isAfter(end) || start.isSame(end)) {
      return NextResponse.json(
        { message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc" },
        { status: 400 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate: start.toDate(),
        endDate: end.toDate(),
        totalHours: Number(totalHours),
        reason: reason?.toString() || "",
      },
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi tạo đơn nghỉ:", error);
    return NextResponse.json(
      { message: "Tạo đơn nghỉ thất bại" },
      { status: 500 }
    );
  }
}
