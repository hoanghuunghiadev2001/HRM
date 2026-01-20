/* eslint-disable @typescript-eslint/no-unused-vars */
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
   * Xử lý mảng logs gửi từ máy chấm công
   */
  static async processMachineLogs(rawLogs: any[]) {
    // Map để gom nhóm logs theo: employeeCode_YYYY-MM-DD
    const masterMap = new Map<string, Date[]>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      // 1. LẤY THỜI GIAN GỐC
      // Giữ nguyên cách parse này nếu bạn thấy nó đang ra đúng giờ VN
      const recordDate = dayjs(log.recordTime);
      const recordDateVN = recordDate.tz(VN_TZ);

      // 2. CHUẨN HÓA MÃ NHÂN VIÊN
      const code = log.deviceUserId.toString().padStart(5, "0");

      // 3. LOGIC GOM NHÓM (QUAN TRỌNG)
      // Mặc định lấy ngày theo giờ VN
      let workDate = recordDateVN.format("YYYY-MM-DD");

      // Nếu chấm công trước 3:00 sáng, ép nó về ngày hôm trước để gom đúng ca đêm
      if (recordDateVN.hour() < 3) {
        workDate = recordDateVN.subtract(1, "day").format("YYYY-MM-DD");
      }

      const key = `${code}_${workDate}`;

      if (!masterMap.has(key)) masterMap.set(key, []);
      masterMap.get(key)!.push(recordDate.toDate());
    }

    console.log(`🚀 [Attendance] Gom thành ${masterMap.size} ca làm việc.`);

    // Xử lý từng nhóm dữ liệu
    for (const [key, times] of masterMap.entries()) {
      try {
        const [employeeCode, dateStr] = key.split("_");
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

    // Lấy dữ liệu cũ dựa trên ID và Ngày công (đã tính ca đêm)
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: emp.id,
          date: new Date(dateStr), // dateStr là YYYY-MM-DD đã được xử lý ca đêm
        },
      },
    });

    // Gom mốc giờ cũ và mới
    const timePool: number[] = [inTime.getTime(), outTime.getTime()];
    if (existing?.checkInTime)
      timePool.push(new Date(existing.checkInTime).getTime());
    if (existing?.checkOutTime)
      timePool.add(new Date(existing.checkOutTime).getTime());

    const sortedPool = Array.from(new Set(timePool)).sort((a, b) => a - b);
    const minTs = sortedPool[0];
    const maxTs = sortedPool[sortedPool.length - 1];

    const finalIn = new Date(minTs);
    let finalOut: Date | null = null;
    if (maxTs - minTs >= 10 * 60000) {
      finalOut = new Date(maxTs);
    }

    // Tính workingHours (Max 14h, trừ 1h nghỉ nếu làm > 5h)
    let workingHours = 0;
    if (finalIn && finalOut) {
      let hours = (maxTs - minTs) / 3600000;
      if (hours > 5) hours -= 1;
      workingHours = Math.min(14, Math.max(0, parseFloat(hours.toFixed(2))));
    }

    // Lưu DB bằng Raw SQL để tránh Prisma tự ý đổi múi giờ của dateStr
    await prisma.$executeRaw`
      INSERT INTO Attendance (employeeId, date, checkInTime, checkOutTime, workingHours)
      VALUES (${emp.id}, ${dateStr}, ${finalIn}, ${finalOut}, ${workingHours})
      ON DUPLICATE KEY UPDATE
        checkInTime = VALUES(checkInTime),
        checkOutTime = VALUES(checkOutTime),
        workingHours = VALUES(workingHours);
    `;

    console.log(
      `✅ [${dateStr}] ${emp.name}: ${dayjs(finalIn).tz(VN_TZ).format("HH:mm")} -> ${finalOut ? dayjs(finalOut).tz(VN_TZ).format("HH:mm") : "--"}`,
    );
  }
}
