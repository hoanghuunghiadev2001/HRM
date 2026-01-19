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
   * @param rawLogs: Mảng các bản ghi (recordTime, deviceUserId, ...)
   */
  static async processMachineLogs(rawLogs: any[]) {
    if (!Array.isArray(rawLogs) || rawLogs.length === 0) return;

    // 1. GOM NHÓM THEO NHÂN VIÊN VÀ NGÀY CÔNG (DÙNG GIỜ VIỆT NAM GỐC)
    const masterMap = new Map<string, Set<number>>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      /**
       * CHIẾN THUẬT FIX LỖI NHẢY NGÀY:
       * Chúng ta trích xuất chuỗi thời gian thô (ví dụ: 07:52:00)
       * và ép nó trực tiếp vào múi giờ Việt Nam, KHÔNG để Dayjs tự tính toán lúc parse.
       */
      const rawString = dayjs(log.recordTime).format("YYYY-MM-DD HH:mm:ss");
      const timeVN = dayjs.tz(rawString, VN_TZ);

      const code = log.deviceUserId.toString().padStart(5, "0");
      let workDate = timeVN.format("YYYY-MM-DD");

      /**
       * XỬ LÝ CA ĐÊM:
       * Nếu nhân viên chấm công trước 3h sáng Việt Nam,
       * chúng ta tính mốc này vào ngày làm việc của hôm trước.
       */
      if (timeVN.hour() < 3) {
        workDate = timeVN.subtract(1, "day").format("YYYY-MM-DD");
      }

      const key = `${code}_${workDate}`;
      if (!masterMap.has(key)) {
        masterMap.set(key, new Set<number>());
      }

      // Lưu dưới dạng timestamp (ms) để dễ dàng tìm Min (In) và Max (Out)
      masterMap.get(key)!.add(timeVN.valueOf());
    }

    console.log(
      `🚀 [Attendance] Đã gom nhóm xong ${masterMap.size} ca làm việc.`,
    );

    // 2. DUYỆT QUA TỪNG NHÓM ĐỂ LƯU VÀO CƠ SỞ DỮ LIỆU
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
   * Hàm lưu dữ liệu vào bảng Attendance.
   * Đảm bảo tính nhất quán giữa ngày công địa phương và giờ quốc tế (UTC).
   */
  private static async persistAttendance(
    code: string,
    dateStr: string,
    timestamps: number[],
  ) {
    // Tìm ID nhân viên dựa trên mã code
    const emp = await prisma.employee.findUnique({
      where: { employeeCode: code },
      select: { id: true, name: true },
    });
    if (!emp) return;

    // 3. LẤY DỮ LIỆU ĐÃ CÓ TRONG DATABASE ĐỂ TRÁNH GHI ĐÈ MẤT GIỜ
    // Sử dụng $queryRaw với dateStr để đảm bảo tính chính xác tuyệt đối của ngày công
    const existing: any = await prisma.$queryRaw`
      SELECT checkInTime, checkOutTime FROM Attendance 
      WHERE employeeId = ${emp.id} AND date = ${dateStr} 
      LIMIT 1
    `;

    const timePool = new Set<number>(timestamps);
    if (existing && existing[0]) {
      // Dữ liệu DB lấy lên là UTC, chuyển về timestamp để so sánh
      if (existing[0].checkInTime)
        timePool.add(dayjs.utc(existing[0].checkInTime).valueOf());
      if (existing[0].checkOutTime)
        timePool.add(dayjs.utc(existing[0].checkOutTime).valueOf());
    }

    const sorted = Array.from(timePool).sort((a, b) => a - b);
    const minTs = sorted[0];
    const maxTs = sorted[sorted.length - 1];

    // 4. CHUẨN BỊ DỮ LIỆU ĐỂ LƯU (SỬ DỤNG ISO STRING KÈM 'Z' ĐỂ MySQL KHÔNG TỰ TRỪ GIỜ)
    // Ví dụ: 07:52 (VN) -> 00:52:00.000Z (UTC)
    const finalInISO = dayjs(minTs).toISOString();
    let finalOutISO: string | null = null;
    let workingHours = 0;

    // Nếu có ít nhất 2 lần chấm và cách nhau trên 10 phút thì mới tính giờ ra
    if (sorted.length > 1 && maxTs - minTs >= 10 * 60000) {
      finalOutISO = dayjs(maxTs).toISOString();

      // Logic tính tổng giờ công (Tự động trừ 1 giờ nghỉ trưa nếu làm trên 5 tiếng)
      let diffHours = (maxTs - minTs) / 3600000;
      if (diffHours > 5) diffHours -= 1;
      workingHours = Math.min(
        14,
        Math.max(0, parseFloat(diffHours.toFixed(2))),
      );
    }

    // 5. THỰC THI LƯU TRỮ VỚI RAW SQL
    // dateStr: YYYY-MM-DD (Ngày Việt Nam)
    // finalInISO: ISO String (Giờ UTC)
    await prisma.$executeRaw`
      INSERT INTO Attendance (employeeId, date, checkInTime, checkOutTime, workingHours)
      VALUES (${emp.id}, ${dateStr}, ${finalInISO}, ${finalOutISO}, ${workingHours})
      ON DUPLICATE KEY UPDATE
        checkInTime = VALUES(checkInTime),
        checkOutTime = VALUES(checkOutTime),
        workingHours = VALUES(workingHours);
    `;

    // In log để kiểm tra thực tế
    const vnInLog = dayjs(minTs).tz(VN_TZ).format("HH:mm:ss");
    const vnOutLog = finalOutISO
      ? dayjs(maxTs).tz(VN_TZ).format("HH:mm:ss")
      : "--:--";
    console.log(
      `✅ [${dateStr}] Nhân viên: ${emp.name} | VN: ${vnInLog} -> ${vnOutLog} | DB: ${finalInISO}`,
    );
  }
}
