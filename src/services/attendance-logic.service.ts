/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

const OVERNIGHT_THRESHOLD = 4; // Trước 4h sáng tính cho ngày hôm trước
const LUNCH_START = 12.0; // 12:00
const LUNCH_END = 13.5; // 13:30 (1.5 giờ nghỉ)

export class AttendanceLogicService {
  static async processMachineLogs(rawLogs: any[]) {
    const groups: Record<string, Date[]> = {};

    rawLogs.forEach((log) => {
      const time = new Date(log.recordTime);
      const code = log.deviceUserId.toString().padStart(5, "0");

      // Logic Ca đêm: Nếu quẹt trước 4h sáng, coi như thuộc ngày công hôm trước
      const workDate = new Date(time);
      if (time.getHours() < OVERNIGHT_THRESHOLD) {
        workDate.setDate(workDate.getDate() - 1);
      }
      const dateKey = `${code}_${workDate.toISOString().split("T")[0]}`;

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(time);
    });

    for (const [key, times] of Object.entries(groups)) {
      const [employeeCode, dateStr] = key.split("_");
      const sorted = times.sort((a, b) => a.getTime() - b.getTime());

      // Lấy sớm nhất và muộn nhất trong lô log gửi lên lần này
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
    // 1. Tìm nhân viên
    const emp = await prisma.employee.findUnique({
      where: { employeeCode: code },
    });
    if (!emp) return;

    // 2. Kiểm tra bản ghi cũ trong DB
    const existing = await prisma.attendance.findFirst({
      where: { employeeId: emp.id, date: date },
    });

    // 3. LOGIC SO SÁNH AN TOÀN:
    // Nếu đã có giờ trong DB (và không null), so sánh để lấy giờ sớm nhất/muộn nhất.
    // Nếu chưa có hoặc null, lấy giờ mới từ máy chấm công gửi lên.

    const finalIn =
      existing?.checkInTime && existing.checkInTime < inTime
        ? existing.checkInTime
        : inTime;

    const finalOut =
      existing?.checkOutTime && existing.checkOutTime > outTime
        ? existing.checkOutTime
        : outTime;
    // 4. Tính toán Working Hours dựa trên In/Out cuối cùng
    let hours = (finalOut.getTime() - finalIn.getTime()) / (1000 * 60 * 60);

    // Tính decimal hours cho in/out để so sánh nghỉ trưa
    const inHourDec = finalIn.getHours() + finalIn.getMinutes() / 60;
    const outHourDec = finalOut.getHours() + finalOut.getMinutes() / 60;

    // Tự động trừ nghỉ trưa nếu làm việc bao trùm khoảng nghỉ
    if (inHourDec < LUNCH_START && outHourDec > LUNCH_END) {
      hours -= LUNCH_END - LUNCH_START;
    }

    // Làm tròn 2 chữ số thập phân
    const finalHours = Math.max(0, parseFloat(hours.toFixed(2)));

    // 5. UPSERT
    await prisma.attendance.upsert({
      where: {
        id: existing?.id || -1,
      },
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
