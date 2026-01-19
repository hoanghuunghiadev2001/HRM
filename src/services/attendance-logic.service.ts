/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Kích hoạt các plugin cần thiết cho Dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

export class AttendanceLogicService {
  /**
   * Xử lý log thô từ máy chấm công gửi về
   * @param rawLogs Danh sách log từ máy (mỗi log chứa recordTime và deviceUserId)
   */
  static async processMachineLogs(rawLogs: any[]) {
    if (!Array.isArray(rawLogs) || rawLogs.length === 0) return;

    // 1. GOM NHÓM THEO NHÂN VIÊN + NGÀY (DÙNG GIỜ VN ĐỂ XÁC ĐỊNH NGÀY CÔNG)
    const masterMap = new Map<string, Set<number>>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      // Đọc thời gian thô và ép về múi giờ Việt Nam để xác định ngày
      const timeVN = dayjs.tz(
        dayjs(log.recordTime).format("YYYY-MM-DD HH:mm:ss"),
        VN_TZ,
      );

      const code = log.deviceUserId.toString().padStart(5, "0");
      let workDate = timeVN.format("YYYY-MM-DD");

      // LOGIC CA ĐÊM: Nếu chấm công trước 5:00 sáng, tính vào ngày hôm trước
      if (timeVN.hour() < 5) {
        workDate = timeVN.subtract(1, "day").format("YYYY-MM-DD");
      }

      const key = `${code}_${workDate}`;
      if (!masterMap.has(key)) masterMap.set(key, new Set<number>());

      // Lưu vào Set dưới dạng Timestamp (số) để tránh trùng lặp
      masterMap.get(key)!.add(timeVN.valueOf());
    }

    console.log(
      `🚀 [Attendance] Đã gom nhóm thành ${masterMap.size} ca làm việc theo ngày VN.`,
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
        console.error(`❌ Lỗi xử lý nhóm ${key}:`, error?.message);
      }
    }
  }

  /**
   * Lưu hoặc cập nhật dữ liệu chấm công cho từng nhân viên theo ngày
   */
  private static async persistAttendance(
    code: string,
    dateStr: string,
    timestamps: number[],
  ) {
    // Tìm nhân viên dựa trên mã code
    const emp = await prisma.employee.findUnique({
      where: { employeeCode: code },
      select: { id: true, name: true },
    });
    if (!emp) return;

    // 3. LẤY DỮ LIỆU CŨ TỪ DATABASE
    // Dùng $queryRaw với dateStr (VN) để đảm bảo không bị Prisma convert lệch ngày khi query
    const existing: any = await prisma.$queryRaw`
      SELECT checkInTime, checkOutTime FROM Attendance 
      WHERE employeeId = ${emp.id} AND date = ${dateStr} 
      LIMIT 1
    `;

    // Gom tất cả mốc giờ (mới + cũ) vào một Pool
    const timePool = new Set<number>(timestamps);
    if (existing && existing[0]) {
      // Khi lấy từ DB lên, chuyển về timestamp để gộp chung với dữ liệu mới
      if (existing[0].checkInTime)
        timePool.add(dayjs(existing[0].checkInTime).valueOf());
      if (existing[0].checkOutTime)
        timePool.add(dayjs(existing[0].checkOutTime).valueOf());
    }

    // Sắp xếp các mốc giờ để tìm In (nhỏ nhất) và Out (lớn nhất)
    const sorted = Array.from(timePool).sort((a, b) => a - b);
    const minTs = sorted[0];
    const maxTs = sorted[sorted.length - 1];

    // 4. CHUYỂN ĐỔI SANG GIỜ UTC ĐỂ LƯU XUỐNG DATABASE
    const finalInUTC = dayjs(minTs).utc().format("YYYY-MM-DD HH:mm:ss");
    let finalOutUTC: string | null = null;
    let workingHours = 0;

    // Điều kiện gộp: Có ít nhất 2 mốc giờ và cách nhau trên 10 phút
    if (sorted.length > 1 && maxTs - minTs >= 10 * 60000) {
      finalOutUTC = dayjs(maxTs).utc().format("YYYY-MM-DD HH:mm:ss");

      // Tính giờ công (Ví dụ trừ 1 tiếng nghỉ trưa nếu làm trên 5 tiếng)
      let hours = (maxTs - minTs) / 3600000;
      if (hours > 5) hours -= 1;
      workingHours = Math.min(14, Math.max(0, parseFloat(hours.toFixed(2))));
    }

    // 5. THỰC THI RAW SQL
    // finalInUTC và finalOutUTC bây giờ đã được sử dụng chính xác ở đây
    await prisma.$executeRaw`
      INSERT INTO Attendance (employeeId, date, checkInTime, checkOutTime, workingHours)
      VALUES (${emp.id}, ${dateStr}, ${finalInUTC === undefined ? finalInUTC : finalInUTC}, ${finalOutUTC}, ${workingHours})
      ON DUPLICATE KEY UPDATE
        checkInTime = VALUES(checkInTime),
        checkOutTime = VALUES(checkOutTime),
        workingHours = VALUES(workingHours);
    `;

    // Log ra console vẫn dùng giờ VN để bạn kiểm soát thực tế
    console.log(
      `✅ [${dateStr}] ${emp.name}: ${dayjs(minTs).tz(VN_TZ).format("HH:mm")} -> ${
        finalOutUTC ? dayjs(maxTs).tz(VN_TZ).format("HH:mm") : "--:--"
      }`,
    );
  }
}
