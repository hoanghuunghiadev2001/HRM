/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Kích hoạt các plugin cần thiết
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const VN_TZ = "Asia/Ho_Chi_Minh";

export class AttendanceLogicService {
  /**
   * Xử lý dữ liệu thô từ máy chấm công gửi về.
   */
  static async processMachineLogs(rawLogs: any[]) {
    // --- DÒNG LOG ĐỂ KIỂM TRA DỮ LIỆU GỐC ---
    console.log("--- [DEBUG] DỮ LIỆU MÁY CHẤM CÔNG GỬI LÊN ---");
    console.dir(rawLogs, { depth: null });
    console.log("-------------------------------------------");

    if (!Array.isArray(rawLogs) || rawLogs.length === 0) return;

    const masterMap = new Map<string, Set<number>>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      /**
       * BƯỚC 1: LẤY GIỜ GỐC TỪ MÁY
       * Chúng ta ép kiểu String rồi format để lấy đúng con số hiển thị.
       */
      const rawDateStr = dayjs(log.recordTime).format("YYYY-MM-DD HH:mm:ss");
      const timeVN = dayjs.tz(rawDateStr, VN_TZ);

      const code = log.deviceUserId.toString().padStart(5, "0");
      let workDate = timeVN.format("YYYY-MM-DD");

      /**
       * BƯỚC 2: LOGIC CA ĐÊM (Trước 3h sáng VN tính cho ngày hôm trước)
       */
      if (timeVN.hour() < 3) {
        workDate = timeVN.subtract(1, "day").format("YYYY-MM-DD");
      }

      const key = `${code}_${workDate}`;
      if (!masterMap.has(key)) {
        masterMap.set(key, new Set<number>());
      }

      masterMap.get(key)!.add(timeVN.valueOf());
    }

    // 2. DUYỆT TỪNG NHÓM ĐỂ LƯU VÀO DATABASE
    for (const [key, timestampSet] of masterMap.entries()) {
      try {
        const [employeeCode, dateStr] = key.split("_");
        await this.persistAttendance(
          employeeCode,
          dateStr,
          Array.from(timestampSet),
        );
      } catch (error: any) {
        console.error(`❌ Lỗi khi xử lý ca ${key}:`, error?.message);
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

    const existing: any = await prisma.$queryRaw`
      SELECT checkInTime, checkOutTime FROM Attendance 
      WHERE employeeId = ${emp.id} AND date = ${dateStr} 
      LIMIT 1
    `;

    const timePool = new Set<number>(timestamps);
    if (existing && existing[0]) {
      if (existing[0].checkInTime)
        timePool.add(dayjs.utc(existing[0].checkInTime).valueOf());
      if (existing[0].checkOutTime)
        timePool.add(dayjs.utc(existing[0].checkOutTime).valueOf());
    }

    const sorted = Array.from(timePool).sort((a, b) => a - b);
    const minTs = sorted[0];
    const maxTs = sorted[sorted.length - 1];

    const finalInSQL = dayjs(minTs).utc().format("YYYY-MM-DD HH:mm:ss");
    let finalOutSQL: string | null = null;
    let workingHours = 0;

    if (sorted.length > 1 && maxTs - minTs >= 10 * 60000) {
      finalOutSQL = dayjs(maxTs).utc().format("YYYY-MM-DD HH:mm:ss");
      let diffHours = (maxTs - minTs) / 3600000;
      if (diffHours > 5) diffHours -= 1;
      workingHours = Math.min(
        14,
        Math.max(0, parseFloat(diffHours.toFixed(2))),
      );
    }

    await prisma.$executeRaw`
      INSERT INTO Attendance (employeeId, date, checkInTime, checkOutTime, workingHours)
      VALUES (${emp.id}, ${dateStr}, ${finalInSQL}, ${finalOutSQL}, ${workingHours})
      ON DUPLICATE KEY UPDATE
        checkInTime = VALUES(checkInTime),
        checkOutTime = VALUES(checkOutTime),
        workingHours = VALUES(workingHours);
    `;

    console.log(
      `✅ [${dateStr}] ${emp.name}: VN ${dayjs(minTs).tz(VN_TZ).format("HH:mm:ss")} -> SQL UTC ${finalInSQL}`,
    );
  }
}
