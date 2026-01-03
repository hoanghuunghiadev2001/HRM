/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

export class AttendanceLogicService {
  static async processMachineLogs(rawLogs: any[]) {
    const groups: Record<string, any[]> = {};

    // 1. Phân loại logs theo nhân viên và ngày
    rawLogs.forEach((log) => {
      const time = new Date(log.recordTime);
      const code = log.deviceUserId.toString().padStart(5, "0");
      const dateKey = `${code}_${time.toISOString().split("T")[0]}`;

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(time);
    });

    // 2. Gom tất cả các tác vụ xử lý vào một mảng để chạy Transaction
    const tasks = Object.entries(groups).map(async ([key, times]) => {
      const [employeeCode, dateStr] = key.split("_");
      const sorted = times.sort((a, b) => a.getTime() - b.getTime());
      const inTime = sorted[0];
      const outTime = sorted[sorted.length - 1];
      const workDate = new Date(dateStr);

      return this.saveAttendance(employeeCode, workDate, inTime, outTime);
    });

    // 3. Chạy tất cả các tác vụ cùng một lúc (Tối ưu hiệu năng cực lớn)
    await Promise.all(tasks);
  }

  private static async saveAttendance(
    code: string,
    date: Date,
    inTime: Date,
    outTime: Date
  ) {
    const emp = await prisma.employee.findUnique({
      where: { employeeCode: code },
    });
    if (!emp) return;

    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: emp.id, date } },
    });

    const finalIn =
      existing?.checkInTime && existing.checkInTime < inTime
        ? existing.checkInTime
        : inTime;
    const finalOut =
      existing?.checkOutTime && existing.checkOutTime > outTime
        ? existing.checkOutTime
        : outTime;

    let hours = 0;
    if (finalIn.getTime() !== finalOut.getTime()) {
      hours = (finalOut.getTime() - finalIn.getTime()) / (1000 * 60 * 60);
    }

    const finalHours = Math.min(14, Math.max(0, parseFloat(hours.toFixed(2))));

    // Sử dụng upsert để ghi đè hoặc tạo mới
    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: emp.id, date } },
      update: {
        checkInTime: finalIn,
        checkOutTime: finalOut,
        workingHours: finalHours,
      },
      create: {
        employeeId: emp.id,
        date: date,
        checkInTime: finalIn,
        checkOutTime: finalOut,
        workingHours: finalHours,
      },
    });
  }
}
