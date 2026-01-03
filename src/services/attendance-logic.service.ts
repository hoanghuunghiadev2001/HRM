/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

export class AttendanceLogicService {
  static async processMachineLogs(rawLogs: any[]) {
    const groups: Record<string, Date[]> = {};

    rawLogs.forEach((log) => {
      const time = new Date(log.recordTime);
      const code = log.deviceUserId.toString().padStart(5, "0");

      // GROUP THEO NGÀY LỊCH (Calendar Day)
      // Quẹt ngày nào, ghi nhận cho đúng ngày đó, không nhảy ca.
      const dateKey = `${code}_${time.toISOString().split("T")[0]}`;

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(time);
    });

    for (const [key, times] of Object.entries(groups)) {
      const [employeeCode, dateStr] = key.split("_");
      const sorted = times.sort((a, b) => a.getTime() - b.getTime());

      const inTime = sorted[0];
      const outTime = sorted[sorted.length - 1];
      const workDate = new Date(dateStr);

      await this.saveAttendance(employeeCode, workDate, inTime, outTime);
    }
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

    // LẤY GIỜ TỐT NHẤT TRONG NGÀY
    const finalIn =
      existing?.checkInTime && existing.checkInTime < inTime
        ? existing.checkInTime
        : inTime;
    const finalOut =
      existing?.checkOutTime && existing.checkOutTime > outTime
        ? existing.checkOutTime
        : outTime;

    let hours = 0;
    // NẾU QUÊN CHẤM (CHỈ CÓ 1 LẦN QUẸT): In và Out trùng nhau -> hours = 0
    if (finalIn.getTime() !== finalOut.getTime()) {
      hours = (finalOut.getTime() - finalIn.getTime()) / (1000 * 60 * 60);
    }

    // Làm tròn 2 chữ số, tối đa 14h (Tránh dữ liệu rác)
    const finalHours = Math.min(14, Math.max(0, parseFloat(hours.toFixed(2))));

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
