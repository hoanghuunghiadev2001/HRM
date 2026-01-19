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

    /**
     * Map<employeeCode_YYYY-MM-DD, Set<ISO_String_With_TZ>>
     */
    const masterMap = new Map<string, Set<string>>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      /**
       * 1️⃣ PARSE GIỜ THEO MÚI GIỜ VIỆT NAM NGAY TỪ ĐẦU
       * Quan trọng: Dùng dayjs.tz(time, timezone) để "ép" giá trị đầu vào
       * luôn được hiểu là giờ VN, bất kể server đang ở UTC hay Local.
       */
      const timeVN = dayjs.tz(log.recordTime, VN_TZ);

      const code = log.deviceUserId.toString().padStart(5, "0");

      /**
       * 2️⃣ XÁC ĐỊNH NGÀY LÀM VIỆC
       * Logic ca đêm: Trước 5h sáng tính cho ngày hôm trước
       */
      let workDate = timeVN.format("YYYY-MM-DD");
      if (timeVN.hour() < 5) {
        workDate = timeVN.subtract(1, "day").format("YYYY-MM-DD");
      }

      const key = `${code}_${workDate}`;
      if (!masterMap.has(key)) {
        masterMap.set(key, new Set<string>());
      }

      // Lưu ISO string bao gồm cả offset (+07:00) để không bị lạc trôi múi giờ
      masterMap.get(key)!.add(timeVN.toISOString());
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
        console.error(`❌ Lỗi xử lý ca ${key}:`, error?.message);
      }
    }
  }

  private static async persistAttendance(
    code: string,
    dateStr: string, // YYYY-MM-DD
    timeStrings: string[],
  ) {
    const emp = await prisma.employee.findUnique({
      where: { employeeCode: code },
      select: { id: true, name: true },
    });
    if (!emp) return;

    /**
     * 3️⃣ LẤY DỮ LIỆU HIỆN TẠI
     * Prisma sẽ tự động convert DateTime từ DB sang JS Date Object (UTC)
     */
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: emp.id,
          date: dateStr,
        },
      },
    });

    /**
     * 4️⃣ TỔNG HỢP CÁC MỐC GIỜ (TIMESTAMP)
     */
    const timePool = new Set<number>();

    // Thêm log mới
    timeStrings.forEach((s) => timePool.add(dayjs(s).valueOf()));

    // Thêm log cũ đã có trong DB (nếu có)
    if (existing?.checkInTime)
      timePool.add(dayjs(existing.checkInTime).valueOf());
    if (existing?.checkOutTime)
      timePool.add(dayjs(existing.checkOutTime).valueOf());

    const sortedTs = Array.from(timePool).sort((a, b) => a - b);
    const firstTs = sortedTs[0];
    const lastTs = sortedTs[sortedTs.length - 1];

    /**
     * 5️⃣ TÍNH TOÁN GIỜ LÀM
     */
    const checkInDate = new Date(firstTs);
    let checkOutDate: Date | null = null;
    let workingHours = 0;

    // Chỉ tính Check-out nếu khoảng cách > 10 phút
    if (sortedTs.length > 1 && lastTs - firstTs >= 10 * 60000) {
      checkOutDate = new Date(lastTs);
      const hours = (lastTs - firstTs) / 3600000;
      workingHours = Math.min(14, Math.max(0, parseFloat(hours.toFixed(2))));
    }

    /**
     * 6️⃣ LƯU VÀO DATABASE
     * Sử dụng upsert của Prisma thay vì raw SQL để an toàn hơn về kiểu dữ liệu.
     * Lưu ý: Prisma truyền Date object vào DB sẽ tự động chuẩn hóa UTC.
     */
    await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: emp.id,
          date: dateStr,
        },
      },
      create: {
        employeeId: emp.id,
        date: dateStr,
        checkInTime: checkInDate,
        checkOutTime: checkOutDate,
        workingHours: workingHours,
      },
      update: {
        checkInTime: checkInDate,
        checkOutTime: checkOutDate,
        workingHours: workingHours,
      },
    });

    console.log(
      `✅ [${dateStr}] ${emp.name}: ` +
        `${dayjs(checkInDate).tz(VN_TZ).format("HH:mm")} -> ` +
        `${checkOutDate ? dayjs(checkOutDate).tz(VN_TZ).format("HH:mm") : "--:--"}`,
    );
  }
}
