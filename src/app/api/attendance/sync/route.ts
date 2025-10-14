/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ZKLib from "node-zklib";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// ===================== CẤU HÌNH =====================
const TIME_ZONE = "Asia/Ho_Chi_Minh";
const MACHINES = [
  { ip: "192.168.48.49", port: 4370 },
  { ip: "192.168.48.48", port: 4370 },
];
const DUPLICATE_THRESHOLD_SECONDS = 60; // bỏ log trùng trong vòng 1 phút
const UPDATE_THRESHOLD_MINUTES = 10; // ngưỡng bỏ qua update nhỏ hơn 10 phút
// =====================================================

/**
 * Chuyển giờ log sang ISO (theo timezone VN)
 */
function toLocalISO(recordTime: string): string | null {
  if (!recordTime) return null;
  const d = dayjs(recordTime).tz(TIME_ZONE);
  return d.isValid() ? d.toISOString() : null;
}

/**
 * Lấy dữ liệu từ máy chấm công có timeout
 */
async function safeGetAttendances(zk: any, timeoutMs = 60000) {
  return Promise.race([
    zk.getAttendances(),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("⏱ Timeout khi lấy dữ liệu từ máy chấm công")),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Kết nối và lấy log trong ngày từ máy chấm công
 */
async function fetchMachineLogs(ip: string, port: number, targetDate: string) {
  const zk = new ZKLib(ip, port, 10000, 4000);
  try {
    console.log(`🔌 Kết nối tới máy ${ip}...`);
    await zk.createSocket();

    const res: any = await safeGetAttendances(zk);
    const fetched = res?.data || [];

    console.log(`✅ Lấy ${fetched.length} logs từ ${ip}`);
    await zk.disconnect().catch(() => null);

    // Lọc log theo ngày mục tiêu (giờ Việt Nam)
    const filtered = fetched.filter((log: any) => {
      const logDate = dayjs(log.recordTime).tz(TIME_ZONE).format("YYYY-MM-DD");
      return logDate === targetDate;
    });

    console.log(`→ ${filtered.length} logs trùng ngày ${targetDate} từ ${ip}`);
    return filtered;
  } catch (err: any) {
    console.error(`❌ Lỗi khi lấy dữ liệu từ ${ip}:`, err?.message);
    try {
      await zk.disconnect();
    } catch {}
    throw new Error(`Máy ${ip}: ${err?.message}`);
  }
}

/**
 * Lọc bỏ các bản ghi trùng giờ trong vòng n giây
 */
function filterDuplicateLogs(logs: { time: Date }[]) {
  const result: { time: Date }[] = [];
  for (const log of logs) {
    const prev = result[result.length - 1];
    if (!prev) {
      result.push(log);
      continue;
    }
    const diffSec = (log.time.getTime() - prev.time.getTime()) / 1000;
    if (diffSec > DUPLICATE_THRESHOLD_SECONDS) result.push(log);
  }
  return result;
}

/**
 * Tìm nhân viên theo nhiều khả năng (mã có thể lệch 0 đầu)
 */
async function findEmployeeByDeviceId(rawUserId: string, maxCodeLen: number) {
  const numeric = parseInt(rawUserId, 10);
  const candidates = new Set<string>([rawUserId]);

  if (!Number.isNaN(numeric)) {
    candidates.add(String(numeric));
    if (maxCodeLen > 0)
      candidates.add(String(numeric).padStart(maxCodeLen, "0"));
  }
  candidates.add(rawUserId.padStart(5, "0"));

  return prisma.employee.findFirst({
    where: { employeeCode: { in: Array.from(candidates) } },
  });
}

/**
 * Ghi hoặc cập nhật bảng chấm công
 */
async function upsertAttendance(
  empId: number,
  date: Date,
  earliestIn: Date,
  latestOut?: Date,
  totalHours?: number
) {
  const existing = await prisma.attendance.findFirst({
    where: { employeeId: empId, date },
  });

  const TEN_MINUTES = UPDATE_THRESHOLD_MINUTES * 60 * 1000;

  if (existing) {
    const diffInMsIn = Math.abs(
      earliestIn.getTime() - (existing.checkInTime?.getTime() ?? 0)
    );
    const diffInMsOut = latestOut
      ? Math.abs(latestOut.getTime() - (existing.checkOutTime?.getTime() ?? 0))
      : 0;

    // ⏸ Bỏ qua nếu không thay đổi đáng kể
    if (diffInMsIn < TEN_MINUTES && diffInMsOut < TEN_MINUTES) return false;

    // ⚙️ Cập nhật giờ vào
    const newCheckIn =
      !existing.checkInTime || earliestIn < existing.checkInTime
        ? earliestIn
        : existing.checkInTime;

    let newCheckOut = existing.checkOutTime;

    // ⚙️ Cập nhật giờ ra nếu hợp lệ (không cách <10p)
    if (latestOut) {
      const diffMinutes = (latestOut.getTime() - earliestIn.getTime()) / 60000;
      if (diffMinutes >= UPDATE_THRESHOLD_MINUTES) {
        if (!existing.checkOutTime || latestOut > existing.checkOutTime)
          newCheckOut = latestOut;
      } else {
        console.log(
          `⚠️ Bỏ qua giờ ra vì cách giờ vào <10 phút (${diffMinutes.toFixed(
            1
          )}p)`
        );
      }
    }

    const newWorkingHours = Math.max(
      existing.workingHours ?? 0,
      totalHours ?? 0
    );

    await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkInTime: newCheckIn,
        checkOutTime: newCheckOut,
        workingHours: newWorkingHours,
      },
    });

    return true;
  }

  // 🆕 Tạo mới nếu chưa có
  await prisma.attendance.create({
    data: {
      employeeId: empId,
      date,
      checkInTime: earliestIn,
      checkOutTime: latestOut,
      workingHours: totalHours,
    },
  });

  return true;
}

// =====================================================
//                    API CHÍNH
// =====================================================
export async function GET(req: Request) {
  const errors: string[] = [];
  const allLogs: any[] = [];

  const targetDate = dayjs().format("YYYY-MM-DD");

  const attendanceDate = dayjs
    .tz(targetDate, TIME_ZONE)
    .startOf("day")
    .toDate();

  console.log(`📅 Đồng bộ ngày: ${targetDate}`);

  // Lấy độ dài employeeCode lớn nhất
  const employees = await prisma.employee.findMany({
    select: { employeeCode: true },
  });
  const maxCodeLen = employees.reduce(
    (max, e) => Math.max(max, (e.employeeCode || "").length),
    0
  );

  // 1️⃣ Lấy dữ liệu từ tất cả máy
  for (const { ip, port } of MACHINES) {
    try {
      const logs = await fetchMachineLogs(ip, port, targetDate);
      allLogs.push(...logs);
    } catch (err: any) {
      errors.push(err.message);
    }
  }

  if (allLogs.length === 0) {
    return NextResponse.json({
      success: false,
      message: `Không có dữ liệu log cho ngày ${targetDate}`,
      errors,
    });
  }

  // 2️⃣ Gom nhóm theo nhân viên
  const grouped: Record<string, any[]> = {};
  for (const log of allLogs) {
    const userId = String(log.deviceUserId ?? log.userSn ?? "");
    if (!userId) continue;
    grouped[userId] ??= [];
    grouped[userId].push(log);
  }

  // 3️⃣ Xử lý từng nhân viên
  let processed = 0;
  const debug: Record<string, { times: string[] }> = {};

  for (const rawUserId of Object.keys(grouped)) {
    const logs = grouped[rawUserId];

    // Chuẩn hóa thời gian & lọc trùng
    const times = logs
      .map((l) => {
        const iso = toLocalISO(l.recordTime);
        return iso ? { time: new Date(iso) } : null;
      })
      .filter(Boolean) as { time: Date }[];

    const filtered = filterDuplicateLogs(times);
    if (!filtered.length) continue;

    const timesVN = filtered.map((t) =>
      dayjs(t.time).tz(TIME_ZONE).format("HH:mm:ss")
    );
    debug[rawUserId] = { times: timesVN };

    // Tìm nhân viên
    const emp = await findEmployeeByDeviceId(rawUserId, maxCodeLen);
    if (!emp) {
      errors.push(`Không tìm thấy employeeCode tương ứng: ${rawUserId}`);
      continue;
    }

    // Tính giờ vào / ra
    const earliestIn = filtered[0].time;
    const latestOut =
      filtered.length > 1 ? filtered[filtered.length - 1].time : undefined;
    const totalMs = latestOut ? latestOut.getTime() - earliestIn.getTime() : 0;
    const totalHours =
      totalMs > 0 ? Math.round((totalMs / 3600000) * 100) / 100 : 0;

    const attendanceDateUTC = dayjs(earliestIn).utc().startOf("day").toDate();
    const updated = await upsertAttendance(
      emp.id,
      attendanceDateUTC,
      earliestIn,
      latestOut,
      totalHours
    );
    if (updated) processed++;
  }

  // 4️⃣ Trả kết quả
  return NextResponse.json({
    success: true,
    date: targetDate,
    processed,
    totalUsers: Object.keys(grouped).length,
    errors,
    debug,
  });
}
