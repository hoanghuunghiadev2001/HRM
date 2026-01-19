/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

export class AttendanceLogicService {
  static async processMachineLogs(rawLogs: any[]) {
    if (!Array.isArray(rawLogs) || rawLogs.length === 0) return;

    const masterMap = new Map<string, Set<number>>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      // BƯỚC 1: Đọc giờ từ máy chấm công (Coi như giờ VN gốc, không cho phép tự convert)
      // Dùng format để parse trực tiếp, tránh bị Dayjs tự ý cộng trừ 7 tiếng
      const timeVN = dayjs.tz(
        dayjs(log.recordTime).format("YYYY-MM-DD HH:mm:ss"),
        VN_TZ,
      );

      const code = log.deviceUserId.toString().padStart(5, "0");
      let dateKey = timeVN.format("YYYY-MM-DD");

      // BƯỚC 2: Xử lý ca đêm (Nếu chấm trước 5h sáng thì tính cho ngày hôm trước)
      if (timeVN.hour() < 5) {
        dateKey = timeVN.subtract(1, "day").format("YYYY-MM-DD");
      }

      const key = `${code}_${dateKey}`;
      if (!masterMap.has(key)) masterMap.set(key, new Set<number>());
      masterMap.get(key)!.add(timeVN.valueOf());
    }

    for (const [key, timestampSet] of masterMap.entries()) {
      try {
        const [employeeCode, dateStr] = key.split("_");
        await this.persistAttendance(
          employeeCode,
          dateStr,
          Array.from(timestampSet),
        );
      } catch (error: any) {
        console.error(`❌ Lỗi nhóm ${key}:`, error?.message);
      }
    }
  }

  private static async persistAttendance(
    code: string,
    dateStr: string,
    timestamps: number[],
  ) {
    const emp = await prisma.employee.findUnique({
      where: { employeeCode: code },
      select: { id: true, name: true },
    });
    if (!emp) return;

    // BƯỚC 3: Lấy dữ liệu cũ (Dùng Raw SQL để tránh Prisma tự convert lệch ngày)
    const existing: any = await prisma.$queryRaw`
      SELECT checkInTime, checkOutTime FROM Attendance 
      WHERE employeeId = ${emp.id} AND date = ${dateStr}
    `;

    const timePool = new Set<number>(timestamps);
    if (existing && existing[0]) {
      if (existing[0].checkInTime)
        timePool.add(dayjs(existing[0].checkInTime).valueOf());
      if (existing[0].checkOutTime)
        timePool.add(dayjs(existing[0].checkOutTime).valueOf());
    }

    const sorted = Array.from(timePool).sort((a, b) => a - b);
    const minTs = sorted[0];
    const maxTs = sorted[sorted.length - 1];

    const finalInStr = dayjs(minTs).format("YYYY-MM-DD HH:mm:ss");
    let finalOutStr: string | null = null;
    let workingHours = 0;

    if (sorted.length > 1 && maxTs - minTs >= 10 * 60000) {
      finalOutStr = dayjs(maxTs).format("YYYY-MM-DD HH:mm:ss");
      let hours = (maxTs - minTs) / 3600000;
      if (hours > 5) hours -= 1; // Trừ nghỉ trưa
      workingHours = Math.min(14, Math.max(0, parseFloat(hours.toFixed(2))));
    }

    // BƯỚC 4: Lưu vào DB (Ép chuỗi String để MySQL nhận đúng ngày 17)
    await prisma.$executeRaw`
      INSERT INTO Attendance (employeeId, date, checkInTime, checkOutTime, workingHours)
      VALUES (${emp.id}, ${dateStr}, ${finalInStr}, ${finalOutStr}, ${workingHours})
      ON DUPLICATE KEY UPDATE
        checkInTime = VALUES(checkInTime),
        checkOutTime = VALUES(checkOutTime),
        workingHours = VALUES(workingHours);
    `;

    console.log(
      `✅ [${dateStr}] ${emp.name}: ${dayjs(minTs).format("HH:mm")} -> ${finalOutStr ? dayjs(maxTs).format("HH:mm") : "--:--"}`,
    );
  }
}
