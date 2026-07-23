/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

export class AttendanceLogicService {
  /**
   * Xử lý mảng logs gửi từ máy chấm công (zk-poller)
   */
  static async processMachineLogs(rawLogs: any[]) {
    if (!Array.isArray(rawLogs) || rawLogs.length === 0) return;

    // Map để gom nhóm logs theo: employeeCode_YYYY-MM-DD (Ngày công đã xử lý ca đêm)
    const masterMap = new Map<string, Date[]>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      // 1. Parse thời gian gốc từ máy
      const recordDate = dayjs(log.recordTime);
      const recordDateVN = recordDate.tz(VN_TZ);

      // 2. Chuẩn hóa mã nhân viên
      const code = log.deviceUserId.toString().padStart(5, "0");

      // 3. LOGIC GOM NHÓM THEO NGÀY CÔNG
      let workDate = recordDateVN.format("YYYY-MM-DD");

      // Nếu chấm công trước 3:00 sáng VN, gom vào ngày công hôm trước (Ca đêm)
      if (recordDateVN.hour() < 3) {
        workDate = recordDateVN.subtract(1, "day").format("YYYY-MM-DD");
      }

      const key = `${code}_${workDate}`;

      if (!masterMap.has(key)) masterMap.set(key, []);
      masterMap.get(key)!.push(recordDate.toDate());
    }

    // Xử lý từng nhóm dữ liệu
    for (const [key, times] of masterMap.entries()) {
      try {
        const [employeeCode, dateStr] = key.split("_");
        // Sắp xếp thời gian trong batch để lấy sớm nhất/muộn nhất
        const sorted = times.sort((a, b) => a.getTime() - b.getTime());
        const inTime = sorted[0];
        const outTime = sorted[sorted.length - 1];

        await this.persistAttendance(employeeCode, dateStr, inTime, outTime);
      } catch (error: any) {
        console.error(`❌ Lỗi xử lý nhóm ${key}:`, error?.message);
      }
    }
  }

  /**
   * Lưu hoặc Cập nhật vào MySQL
   */
  private static async persistAttendance(
    code: string,
    dateStr: string,
    inTime: Date,
    outTime: Date,
  ) {
    const emp = await prisma.employee.findUnique({
      where: { employeeCode: code },
      select: { id: true, name: true },
    });
    if (!emp) return;

    // Lấy dữ liệu hiện tại trong DB dựa trên (nhân viên + ngày công đã xử lý ca đêm)
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: emp.id,
          date: new Date(dateStr),
        },
      },
    });

    // 4. TỔNG HỢP CÁC MỐC GIỜ (Dùng Set để loại bỏ trùng lặp timestamp)
    const timePool = new Set<number>();
    timePool.add(inTime.getTime());
    timePool.add(outTime.getTime());

    if (existing?.checkInTime)
      timePool.add(new Date(existing.checkInTime).getTime());
    if (existing?.checkOutTime)
      timePool.add(new Date(existing.checkOutTime).getTime());

    const sortedPool = Array.from(timePool).sort((a, b) => a - b);

    // 5. XÁC ĐỊNH VÀO/RA CUỐI CÙNG
    const minTimestamp = sortedPool[0];
    const maxTimestamp = sortedPool[sortedPool.length - 1];

    const finalIn = new Date(minTimestamp);
    let finalOut: Date | null = null;

    // Chỉ tính giờ ra nếu cách giờ vào ít nhất 10 phút
    if (maxTimestamp - minTimestamp >= 10 * 60000) {
      finalOut = new Date(maxTimestamp);
    }

    // 6. TÍNH GIỜ CÔNG
    let workingHours = 0;
    if (finalIn && finalOut) {
      let hours = (maxTimestamp - minTimestamp) / 3600000;
      if (hours > 5) hours -= 1; // Trừ 1h nghỉ trưa nếu làm > 5h
      workingHours = Math.min(14, Math.max(0, parseFloat(hours.toFixed(2))));
    }

    // 7. THỰC THI SQL
    await prisma.$executeRaw`
      INSERT INTO Attendance (employeeId, date, checkInTime, checkOutTime, workingHours)
      VALUES (${emp.id}, ${dateStr}, ${finalIn}, ${finalOut}, ${workingHours})
      ON DUPLICATE KEY UPDATE
        checkInTime = VALUES(checkInTime),
        checkOutTime = VALUES(checkOutTime),
        workingHours = VALUES(workingHours);
    `;
  }
}
