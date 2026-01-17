/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export class AttendanceLogicService {
  /**
   * Xử lý mảng logs gửi từ máy chấm công (zk-poller)
   */
  static async processMachineLogs(rawLogs: any[]) {
    // Map để gom nhóm logs theo: employeeCode_YYYY-MM-DD
    const masterMap = new Map<string, Date[]>();

    for (const log of rawLogs) {
      if (!log.recordTime || !log.deviceUserId) continue;

      // Lưu ý: Luôn dùng dayjs để parse thời gian từ máy chấm công
      const recordTime = dayjs.tz(log.recordTime, "Asia/Ho_Chi_Minh").toDate();

      // Chuẩn hóa mã nhân viên thành 5 số (ví dụ: "525" -> "00525")
      const code = log.deviceUserId.toString().padStart(5, "0");

      // Lấy chuỗi ngày YYYY-MM-DD để làm Key gom nhóm
      const dateKey = dayjs(log.recordTime)
        .tz("Asia/Ho_Chi_Minh")
        .format("YYYY-MM-DD");

      const key = `${code}_${dateKey}`;

      if (!masterMap.has(key)) masterMap.set(key, []);
      masterMap.get(key)!.push(recordTime);
    }

    // Xử lý từng nhóm dữ liệu (Mỗi nhóm là 1 nhân viên / 1 ngày)
    for (const [key, times] of masterMap.entries()) {
      try {
        const [employeeCode, dateStr] = key.split("_");

        // Sắp xếp thời gian trong batch này để lấy sớm nhất/muộn nhất sơ bộ
        const sorted = times.sort((a, b) => a.getTime() - b.getTime());
        const inTime = sorted[0];
        const outTime = sorted[sorted.length - 1];

        // dateStr ở đây là chuỗi "YYYY-MM-DD"
        await this.persistAttendance(employeeCode, dateStr, inTime, outTime);
      } catch (error: any) {
        console.error(`❌ Lỗi xử lý nhóm ${key}:`, error?.message);
      }
    }
  }

  /**
   * Lưu hoặc Cập nhật vào MySQL
   * @param dateStr Chuỗi ngày định dạng YYYY-MM-DD để tránh lệch múi giờ
   */
  private static async persistAttendance(
    code: string,
    dateStr: string,
    inTime: Date,
    outTime: Date,
  ) {
    // 1. Tìm ID nhân viên dựa trên mã nhân viên
    const emp = await prisma.employee.findUnique({
      where: { employeeCode: code },
      select: { id: true },
    });
    if (!emp) return;

    // 2. Lấy dữ liệu hiện tại trong Database (nếu có)
    // Đối với cột @db.Date, Prisma vẫn cho phép query bằng đối tượng Date hoặc chuỗi ngày
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: emp.id,
          date: new Date(dateStr),
        },
      },
    });

    // 3. TỔNG HỢP TẤT CẢ CÁC MỐC GIỜ (Từ máy gửi lên + Từ database cũ)
    const timePool: number[] = [];
    timePool.push(inTime.getTime());
    timePool.push(outTime.getTime());

    if (existing?.checkInTime) timePool.push(existing.checkInTime.getTime());
    if (existing?.checkOutTime) timePool.push(existing.checkOutTime.getTime());

    // Loại bỏ trùng và sắp xếp tăng dần tuyệt đối
    const sortedPool = Array.from(new Set(timePool)).sort((a, b) => a - b);

    // 4. XÁC ĐỊNH GIỜ VÀO (SỚM NHẤT) VÀ GIỜ RA (MUỘN NHẤT)
    const minTimestamp = sortedPool[0];
    const maxTimestamp = sortedPool[sortedPool.length - 1];

    const finalIn = new Date(minTimestamp);
    let finalOut: Date | null = null;

    // Chỉ tính Giờ Ra nếu cách Giờ Vào ít nhất 10 phút
    const diffMinutes = (maxTimestamp - minTimestamp) / (1000 * 60);
    if (diffMinutes >= 10) {
      finalOut = new Date(maxTimestamp);
    }

    // 5. Kiểm tra nếu không có thay đổi so với DB thì dừng (Tiết kiệm hiệu năng)
    const isNoChange =
      existing &&
      existing.checkInTime?.getTime() === finalIn.getTime() &&
      existing.checkOutTime?.getTime() === (finalOut?.getTime() || null);

    if (isNoChange) return;

    // 6. Tính toán số giờ làm việc (Max 14 tiếng để tránh rác dữ liệu)
    let workingHours = 0;
    if (finalIn && finalOut) {
      const diffMs = finalOut.getTime() - finalIn.getTime();
      workingHours = Math.min(
        14,
        parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)),
      );
    }

    // 7. Thực hiện cập nhật Database
    // Dùng dateStr (YYYY-MM-DD) trực tiếp trong câu lệnh SQL để MySQL lưu chính xác ngày
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
