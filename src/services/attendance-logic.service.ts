/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const VN_TZ = "Asia/Ho_Chi_Minh";

export class AttendanceLogicService {
  static async processMachineLogs(rawLogs: any[]) {
    if (!Array.isArray(rawLogs) || rawLogs.length === 0) return;

    /**
     * Map<employeeCode_YYYY-MM-DD, Set<ISO string (VN time)>>
     */
    const masterMap = new Map<string, Set<string>>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      /**
       * ==============================
       * 1️⃣ COI GIỜ MÁY = GIỜ VIỆT NAM
       * ==============================
       */
      const rawTimeStr = dayjs(log.recordTime).format("YYYY-MM-DD HH:mm:ss");
      const timeVN = dayjs.tz(rawTimeStr, VN_TZ);

      const code = log.deviceUserId.toString().padStart(5, "0");

      /**
       * ==============================
       * 2️⃣ XÁC ĐỊNH NGÀY LÀM VIỆC (VN)
       * Ca đêm: < 05:00 → ngày hôm trước
       * ==============================
       */
      let workDate = timeVN.format("YYYY-MM-DD");
      if (timeVN.hour() < 5) {
        workDate = timeVN.subtract(1, "day").format("YYYY-MM-DD");
      }

      const key = `${code}_${workDate}`;
      if (!masterMap.has(key)) {
        masterMap.set(key, new Set<string>());
      }

      /**
       * Lưu ISO string có timezone (+07:00)
       * để sau này convert sang UTC chính xác
       */
      masterMap.get(key)!.add(timeVN.format());
    }

    console.log(`🚀 [Attendance] Đã gom nhóm ${masterMap.size} ca làm việc.`);

    for (const [key, timeStrings] of masterMap.entries()) {
      try {
        const [employeeCode, dateStr] = key.split("_");
        await this.persistAttendance(
          employeeCode,
          dateStr,
          Array.from(timeStrings),
        );
      } catch (error: any) {
        console.error(`❌ Lỗi nhóm ${key}:`, error?.message);
      }
    }
  }

  private static async persistAttendance(
    code: string,
    dateStr: string, // YYYY-MM-DD (VN)
    timeStrings: string[],
  ) {
    const emp = await prisma.employee.findUnique({
      where: { employeeCode: code },
      select: { id: true, name: true },
    });
    if (!emp) return;

    /**
     * ==============================
     * 3️⃣ LẤY DỮ LIỆU CŨ (RAW SQL)
     * Tránh Prisma tự convert timezone
     * ==============================
     */
    const existing: any = await prisma.$queryRaw`
      SELECT checkInTime, checkOutTime
      FROM Attendance
      WHERE employeeId = ${emp.id}
        AND date = ${dateStr}
      LIMIT 1
    `;

    /**
     * ==============================
     * 4️⃣ GOM TẤT CẢ MỐC GIỜ → UTC TS
     * ==============================
     */
    const timePool = new Set<number>(
      timeStrings.map((s) => dayjs(s).utc().valueOf()),
    );

    if (existing?.[0]) {
      if (existing[0].checkInTime) {
        timePool.add(dayjs(existing[0].checkInTime).utc().valueOf());
      }
      if (existing[0].checkOutTime) {
        timePool.add(dayjs(existing[0].checkOutTime).utc().valueOf());
      }
    }

    const sorted = Array.from(timePool).sort((a, b) => a - b);
    const minTs = sorted[0];
    const maxTs = sorted[sorted.length - 1];

    /**
     * ==============================
     * 5️⃣ FORMAT GIỜ → UTC (STRING)
     * ==============================
     */
    const finalInStr = dayjs.utc(minTs).format("YYYY-MM-DD HH:mm:ss");

    let finalOutStr: string | null = null;
    let workingHours = 0;

    if (sorted.length > 1 && maxTs - minTs >= 10 * 60000) {
      finalOutStr = dayjs.utc(maxTs).format("YYYY-MM-DD HH:mm:ss");

      const hours = (maxTs - minTs) / 3600000;
      workingHours = Math.min(14, Math.max(0, parseFloat(hours.toFixed(2))));
    }

    /**
     * ==============================
     * 6️⃣ UPSERT DB
     * date = NGÀY VN
     * checkIn/out = UTC
     * ==============================
     */
    await prisma.$executeRaw`
      INSERT INTO Attendance
        (employeeId, date, checkInTime, checkOutTime, workingHours)
      VALUES
        (${emp.id}, ${dateStr}, ${finalInStr}, ${finalOutStr}, ${workingHours})
      ON DUPLICATE KEY UPDATE
        checkInTime = VALUES(checkInTime),
        checkOutTime = VALUES(checkOutTime),
        workingHours = VALUES(workingHours);
    `;

    console.log(
      `✅ [${dateStr}] ${emp.name}: ` +
        `${dayjs.utc(minTs).tz(VN_TZ).format("HH:mm")} -> ` +
        `${finalOutStr ? dayjs.utc(maxTs).tz(VN_TZ).format("HH:mm") : "--:--"}`,
    );
  }
}
