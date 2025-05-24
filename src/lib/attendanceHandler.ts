// src/lib/attendanceHandler.ts

import { prisma } from "./prisma";

export async function handleAttendance(employeeCode: string, timeScan: string) {
  if (!employeeCode || !timeScan) {
    return {
      status: 400,
      json: { message: "Thiếu dữ liệu" },
    };
  }

  const employee = await prisma.employee.findUnique({
    where: { employeeCode },
  });

  if (!employee) {
    return {
      status: 404,
      json: { message: "Không tìm thấy nhân viên" },
    };
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
    return {
      status: 200,
      json: { message: "Chấm công vào thành công", attendance: newAttendance },
    };
  }

  if (!lastAttendance.checkOutTime) {
    const updatedAttendance = await prisma.attendance.update({
      where: { id: lastAttendance.id },
      data: { checkOutTime: scanDate },
    });
    return {
      status: 200,
      json: {
        message: "Chấm công ra thành công",
        attendance: updatedAttendance,
      },
    };
  }

  const newAttendance = await prisma.attendance.create({
    data: {
      employeeId,
      date: new Date(dateOnlyStr),
      checkInTime: scanDate,
    },
  });

  return {
    status: 200,
    json: {
      message: "Chấm công vào (lần 2) thành công",
      attendance: newAttendance,
    },
  };
}
