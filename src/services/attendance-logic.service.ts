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
    if (!Array.isArray(rawLogs) || rawLogs.length === 0) return;

    const masterMap = new Map<string, Set<number>>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      /**
       * BƯỚC 1: LẤY GIỜ GỐC TỪ MÁY (KHÔNG SAI LỆCH)
       * Chuyển mọi thứ về chuỗi format chuẩn YYYY-MM-DD HH:mm:ss.
       * Sau đó dùng dayjs.tz(...) để ép hệ thống hiểu đây là giờ VN gốc.
       */
      const rawDateStr = dayjs(log.recordTime).format("YYYY-MM-DD HH:mm:ss");
      const timeVN = dayjs.tz(rawDateStr, VN_TZ);

      const code = log.deviceUserId.toString().padStart(5, "0");
      let workDate = timeVN.format("YYYY-MM-DD");

      /**
       * BƯỚC 2: LOGIC CA ĐÊM
       * Chấm công từ 00:00:00 đến 02:59:59 sáng sẽ được tính cho ngày công hôm trước.
       * Ví dụ: Chấm 01:00 sáng ngày 18 -> Tính cho ngày công 17.
       * Chấm 07:00 sáng ngày 18 -> Tính cho ngày công 18.
       */
      if (timeVN.hour() < 3) {
        workDate = timeVN.subtract(1, "day").format("YYYY-MM-DD");
      }

      const key = `${code}_${workDate}`;
      if (!masterMap.has(key)) {
        masterMap.set(key, new Set<number>());
      }

      // Lưu trữ dạng Miliseconds để so sánh sớm nhất/muộn nhất
      masterMap.get(key)!.add(timeVN.valueOf());
    }

    console.log(
      `🚀 [Attendance] Đã gom nhóm xong ${masterMap.size} ca làm việc theo ngày VN.`,
    );

    // Duyệt từng nhóm để xử lý lưu DB
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

    // 3. LẤY DỮ LIỆU HIỆN TẠI TỪ DB
    const existing: any = await prisma.$queryRaw`
      SELECT checkInTime, checkOutTime FROM Attendance 
      WHERE employeeId = ${emp.id} AND date = ${dateStr} 
      LIMIT 1
    `;

    const timePool = new Set<number>(timestamps);
    if (existing && existing[0]) {
      // Dữ liệu trong DB luôn là UTC, ta parse theo UTC để lấy mốc thời gian chuẩn
      if (existing[0].checkInTime)
        timePool.add(dayjs.utc(existing[0].checkInTime).valueOf());
      if (existing[0].checkOutTime)
        timePool.add(dayjs.utc(existing[0].checkOutTime).valueOf());
    }

    const sorted = Array.from(timePool).sort((a, b) => a - b);
    const minTs = sorted[0];
    const maxTs = sorted[sorted.length - 1];

    /**
     * BƯỚC 4: QUY ĐỔI SANG UTC ĐỂ LƯU XUỐNG DB
     * DB lưu UTC để đồng bộ hệ thống, nhưng khi hiện lên frontend bạn phải convert lại VN_TZ.
     */
    const finalInSQL = dayjs(minTs).utc().format("YYYY-MM-DD HH:mm:ss");
    let finalOutSQL: string | null = null;
    let workingHours = 0;

    // Nếu khoảng cách giữa lần đầu và cuối > 10 phút thì mới tính Checkout
    if (sorted.length > 1 && maxTs - minTs >= 10 * 60000) {
      finalOutSQL = dayjs(maxTs).utc().format("YYYY-MM-DD HH:mm:ss");

      let diffHours = (maxTs - minTs) / 3600000;
      if (diffHours > 5) diffHours -= 1; // Nghỉ trưa
      workingHours = Math.min(
        14,
        Math.max(0, parseFloat(diffHours.toFixed(2))),
      );
    }

    // 5. LƯU VÀO MYSQL (Dùng chuỗi định dạng chuẩn MySQL)
    await prisma.$executeRaw`
      INSERT INTO Attendance (employeeId, date, checkInTime, checkOutTime, workingHours)
      VALUES (${emp.id}, ${dateStr}, ${finalInSQL}, ${finalOutSQL}, ${workingHours})
      ON DUPLICATE KEY UPDATE
        checkInTime = VALUES(checkInTime),
        checkOutTime = VALUES(checkOutTime),
        workingHours = VALUES(workingHours);
    `;

    // LOG KIỂM TRA CHUẨN
    const logVN = dayjs(minTs).tz(VN_TZ).format("HH:mm:ss");
    console.log(
      `✅ [${dateStr}] ${emp.name}: Giờ VN thực tế: ${logVN} -> Lưu DB (UTC): ${finalInSQL}`,
    );
  }
}
