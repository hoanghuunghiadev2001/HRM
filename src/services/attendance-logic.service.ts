/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

const OVERNIGHT_THRESHOLD = 4; // Trước 4h sáng tính cho ngày hôm trước
const LUNCH_START = 12; // 12:00
const LUNCH_END = 13.5; // 13:30 (1h30 nghỉ)

export class AttendanceLogicService {
  static async processMachineLogs(rawLogs: any[]) {
    // 1. Nhóm logs theo EmployeeCode và Ngày công thực tế
    const groups: Record<string, Date[]> = {};

    rawLogs.forEach((log) => {
      const time = new Date(log.recordTime);
      const code = log.deviceUserId.toString();

      // Logic Ca đêm: Nếu quẹt trước 4h sáng, coi như thuộc ngày công hôm trước
      const workDate = new Date(time);
      if (time.getHours() < OVERNIGHT_THRESHOLD) {
        workDate.setDate(workDate.getDate() - 1);
      }
      const dateKey = `${code}_${workDate.toISOString().split("T")[0]}`;

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(time);
    });

    // 2. Xử lý từng nhóm để Upsert vào Database
    for (const [key, times] of Object.entries(groups)) {
      const [employeeCode, dateStr] = key.split("_");
      const sorted = times.sort((a, b) => a.getTime() - b.getTime());

      const checkIn = sorted[0];
      const checkOut = sorted[sorted.length - 1];
      const workDate = new Date(dateStr);

      await this.saveAttendance(employeeCode, workDate, checkIn, checkOut);
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

    // Tính Working Hours
    let hours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);

    // Tự động trừ nghỉ trưa nếu làm việc xuyên trưa
    if (inTime.getHours() < LUNCH_START && outTime.getHours() > LUNCH_END) {
      hours -= LUNCH_END - LUNCH_START;
    }

    await prisma.attendance.upsert({
      where: {
        // Bạn nên thêm @@unique([employeeId, date]) vào schema Prisma cho bảng Attendance
        // Nếu chưa có, ta dùng findFirst + update/create
        id:
          (
            await prisma.attendance.findFirst({
              where: { employeeId: emp.id, date: date },
            })
          )?.id || -1,
      },
      update: {
        checkInTime: inTime,
        checkOutTime: outTime,
        workingHours: Math.max(0, hours),
      },
      create: {
        employeeId: emp.id,
        date: date,
        checkInTime: inTime,
        checkOutTime: outTime,
        workingHours: Math.max(0, hours),
      },
    });
  }
}
