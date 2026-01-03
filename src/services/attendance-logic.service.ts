/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Cấu hình dayjs sử dụng múi giờ Việt Nam
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

export class AttendanceLogicService {
  /**
   * Xử lý dữ liệu thô từ máy chấm công gửi lên
   */
  static async processMachineLogs(rawLogs: any[]) {
    const groups: Record<string, Date[]> = {};

    // 1. Phân loại logs theo nhân viên và ngày (sử dụng giờ địa phương VN)
    rawLogs.forEach((log) => {
      // Ép thời gian về đúng múi giờ Việt Nam
      const recordTime = dayjs(log.recordTime).tz("Asia/Ho_Chi_Minh");
      const code = log.deviceUserId.toString().padStart(5, "0");

      // Lấy ngày chuẩn YYYY-MM-DD theo giờ VN (không bị nhảy về hôm trước như ISO)
      const dateKeyStr = recordTime.format("YYYY-MM-DD");
      const dateKey = `${code}_${dateKeyStr}`;

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(recordTime.toDate());
    });

    // 2. Xử lý TUẦN TỰ (Sequential) từng nhóm
    // Sử dụng for...of thay cho Promise.all để tránh làm nghẽn Database gây lỗi Timeout 60s
    for (const [key, times] of Object.entries(groups)) {
      const [employeeCode, dateStr] = key.split("_");

      // Sắp xếp các mốc thời gian trong ngày từ sớm đến muộn
      const sorted = times.sort((a, b) => a.getTime() - b.getTime());

      // Lấy giờ quẹt đầu tiên và cuối cùng trong ngày
      const inTime = sorted[0];
      const outTime = sorted[sorted.length - 1];

      // Tạo ngày chuẩn cho DB (đưa về 00:00:00 theo giờ VN)
      const workDate = dayjs
        .tz(dateStr, "Asia/Ho_Chi_Minh")
        .startOf("day")
        .toDate();

      await this.saveAttendance(employeeCode, workDate, inTime, outTime);
    }
  }

  /**
   * Lưu hoặc cập nhật dữ liệu vào Database
   */
  private static async saveAttendance(
    code: string,
    date: Date,
    inTime: Date,
    outTime: Date
  ) {
    // 1. Tìm ID nhân viên
    const emp = await prisma.employee.findUnique({
      where: { employeeCode: code },
      select: { id: true },
    });

    if (!emp) return;

    // 2. Kiểm tra bản ghi đã tồn tại trong ngày hôm đó chưa
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: { employeeId: emp.id, date },
      },
      select: { checkInTime: true, checkOutTime: true },
    });

    // 3. LOGIC SO SÁNH GIỜ TỐT NHẤT:
    // Check-In: Lấy mốc sớm nhất | Check-Out: Lấy mốc muộn nhất
    const finalIn =
      existing?.checkInTime && existing.checkInTime < inTime
        ? existing.checkInTime
        : inTime;

    const finalOut =
      existing?.checkOutTime && existing.checkOutTime > outTime
        ? existing.checkOutTime
        : outTime;

    // 4. TÍNH GIỜ LÀM VIỆC (KHÔNG TRỪ NGHỈ TRƯA)
    let hours = 0;

    // Nếu chỉ quẹt 1 lần (In trùng Out), giờ làm việc mặc định là 0
    if (finalIn.getTime() !== finalOut.getTime()) {
      const diffMs = finalOut.getTime() - finalIn.getTime();
      hours = diffMs / (1000 * 60 * 60);
    }

    // Làm tròn 2 chữ số thập phân và giới hạn tối đa 14 tiếng/ngày
    const finalHours = Math.min(14, Math.max(0, parseFloat(hours.toFixed(2))));

    // 5. Ghi dữ liệu vào Database (Upsert)
    await prisma.attendance.upsert({
      where: {
        employeeId_date: { employeeId: emp.id, date },
      },
      update: {
        checkInTime: finalIn,
        checkOutTime: finalOut,
        workingHours: finalHours,
      },
      create: {
        employeeId: emp.id,
        date: date,
        checkInTime: finalIn,
        checkOutTime: finalOut,
        workingHours: finalHours,
      },
    });
  }
}
