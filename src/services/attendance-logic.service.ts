/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Kích hoạt các plugin xử lý múi giờ
dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

export class AttendanceLogicService {
  /**
   * Xử lý dữ liệu thô từ máy chấm công gửi về.
   */
  static async processMachineLogs(rawLogs: any[]) {
    if (!Array.isArray(rawLogs) || rawLogs.length === 0) return;

    // 1. GOM NHÓM THEO NHÂN VIÊN VÀ NGÀY CÔNG (DÙNG GIỜ VN GỐC)
    const masterMap = new Map<string, Set<number>>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      // Trích xuất chuỗi thô để Dayjs không tự ý cộng trừ giờ lúc parse ban đầu
      const rawString = dayjs(log.recordTime).format("YYYY-MM-DD HH:mm:ss");
      const timeVN = dayjs.tz(rawString, VN_TZ);

      const code = log.deviceUserId.toString().padStart(5, "0");
      let workDate = timeVN.format("YYYY-MM-DD");

      // LOGIC CA ĐÊM: Trước 3h sáng VN tính cho ngày hôm trước
      if (timeVN.hour() < 3) {
        workDate = timeVN.subtract(1, "day").format("YYYY-MM-DD");
      }

      const key = `${code}_${workDate}`;
      if (!masterMap.has(key)) {
        masterMap.set(key, new Set<number>());
      }

      masterMap.get(key)!.add(timeVN.valueOf());
    }

    console.log(
      `🚀 [Attendance] Đã gom nhóm xong ${masterMap.size} ca làm việc.`,
    );

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
        console.error(`❌ Lỗi khi xử lý ca làm việc ${key}:`, error?.message);
      }
    }
  }

  /**
   * Lưu hoặc cập nhật dữ liệu vào bảng Attendance.
   */
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

    // 3. LẤY DỮ LIỆU CŨ TRONG DB
    const existing: any = await prisma.$queryRaw`
      SELECT checkInTime, checkOutTime FROM Attendance 
      WHERE employeeId = ${emp.id} AND date = ${dateStr} 
      LIMIT 1
    `;

    const timePool = new Set<number>(timestamps);
    if (existing && existing[0]) {
      // Ép về UTC để lấy timestamp chuẩn không bị lệch
      if (existing[0].checkInTime)
        timePool.add(dayjs.utc(existing[0].checkInTime).valueOf());
      if (existing[0].checkOutTime)
        timePool.add(dayjs.utc(existing[0].checkOutTime).valueOf());
    }

    const sorted = Array.from(timePool).sort((a, b) => a - b);
    const minTs = sorted[0];
    const maxTs = sorted[sorted.length - 1];

    /**
     * FIX LỖI 1292:
     * Chuyển sang UTC rồi format theo định dạng MySQL: YYYY-MM-DD HH:mm:ss
     * Việc dùng .utc().format(...) sẽ tạo ra chuỗi sạch mà MySQL DATETIME chấp nhận.
     */
    const finalInSQL = dayjs(minTs).utc().format("YYYY-MM-DD HH:mm:ss");
    let finalOutSQL: string | null = null;
    let workingHours = 0;

    if (sorted.length > 1 && maxTs - minTs >= 10 * 60000) {
      finalOutSQL = dayjs(maxTs).utc().format("YYYY-MM-DD HH:mm:ss");

      let diffHours = (maxTs - minTs) / 3600000;
      if (diffHours > 5) diffHours -= 1; // Nghỉ trưa
      workingHours = Math.min(
        14,
        Math.max(0, parseFloat(diffHours.toFixed(2))),
      );
    }

    // 5. THỰC THI LƯU TRỮ
    // Truyền tham số riêng biệt vào mảng để Prisma xử lý an toàn
    await prisma.$executeRaw`
      INSERT INTO Attendance (employeeId, date, checkInTime, checkOutTime, workingHours)
      VALUES (${emp.id}, ${dateStr}, ${finalInSQL}, ${finalOutSQL}, ${workingHours})
      ON DUPLICATE KEY UPDATE
        checkInTime = VALUES(checkInTime),
        checkOutTime = VALUES(checkOutTime),
        workingHours = VALUES(workingHours);
    `;

    console.log(
      `✅ [${dateStr}] ${emp.name}: VN ${dayjs(minTs).tz(VN_TZ).format("HH:mm")} -> SQL UTC ${finalInSQL}`,
    );
  }
}
