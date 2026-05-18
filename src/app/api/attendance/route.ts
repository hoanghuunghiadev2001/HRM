/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../generated/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import jwt from "jsonwebtoken";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// ⚙️ Hàm chuyển đổi ngày tìm kiếm theo múi giờ VN → UTC tương ứng
function getUtcRange(dateStr?: string, endOfDay = false): Date | undefined {
  if (!dateStr) return undefined;
  const d = dayjs.tz(
    `${dateStr} ${endOfDay ? "23:59:59" : "00:00:00"}`,
    "Asia/Ho_Chi_Minh",
  );
  return d.utc().toDate();
}

function calcHours(checkIn: Date | null, checkOut: Date | null): number {
  if (!checkIn || !checkOut) return 0;
  return +((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(
    2,
  );
}

export async function GET(req: NextRequest) {
  try {
    // --- 🛡️ BƯỚC 1: XÁC THỰC TOKEN ---
    const token = req.cookies.get("token-hrm")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Không tìm thấy token" },
        { status: 401 },
      );
    }

    let decoded: { id: number; role: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (err) {
      return NextResponse.json(
        { message: "Token không hợp lệ" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);

    // Các tham số lọc từ URL
    const msnv = searchParams.get("msnv") ?? undefined;
    const name = searchParams.get("name") ?? undefined;
    const department = searchParams.get("department") ?? undefined;
    const fromDate = searchParams.get("fromDate") ?? undefined;
    const toDate = searchParams.get("toDate") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20", 10);

    // Tạo range UTC tương ứng với ngày ở VN
    const fromUtc = fromDate ? getUtcRange(fromDate, false) : undefined;
    const toUtc = toDate ? getUtcRange(toDate, true) : undefined;

    // --- 🛡️ BƯỚC 2: THIẾT LẬP WHERE CLAUSE THEO ROLE ---
    const employeeWhere: Prisma.EmployeeWhereInput = {};

    if (decoded.role === "ADMIN") {
      // Admin: Được phép lọc theo bất kỳ ai qua URL
      if (msnv) employeeWhere.employeeCode = { contains: msnv };
      if (name) employeeWhere.name = { contains: name };
      if (department) {
        const [deptId, posId] = department.split("-").map(Number);
        employeeWhere.workInfo = {
          ...(deptId ? { departmentId: deptId } : {}),
          ...(posId ? { positionId: posId } : {}),
        };
      }
    } else if (decoded.role === "MANAGER") {
      // Manager: Chỉ xem được nhân viên trong phòng ban của họ và LEVEL thấp hơn
      const managerWorkInfo = await prisma.workInfo.findUnique({
        where: { employeeId: decoded.id },
        select: {
          departmentId: true,
          position: {
            select: { level: true },
          },
        },
      });

      // Nếu quản lý không có phòng ban hoặc chức vụ được cấu hình level -> Trả về danh sách trống
      if (!managerWorkInfo?.departmentId || !managerWorkInfo?.position?.level) {
        return NextResponse.json({ total: 0, page, pageSize, data: [] });
      }

      const managerDeptId = managerWorkInfo.departmentId;
      const managerLevel = managerWorkInfo.position.level;

      // Ép điều kiện lọc theo phòng ban của manager và level thấp hơn (lt: less than)
      employeeWhere.workInfo = {
        departmentId: managerDeptId,
        position: {
          level: { lt: managerLevel },
        },
      };

      // Vẫn hỗ trợ manager tìm kiếm đích danh cấp dưới dựa trên query params từ URL
      if (msnv) employeeWhere.employeeCode = { contains: msnv };
      if (name) employeeWhere.name = { contains: name };
    } else {
      // User thường: BẮT BUỘC chỉ lấy ID của chính họ từ Token
      // Mọi tham số msnv/name từ URL truyền lên sẽ bị lờ đi để bảo mật
      employeeWhere.id = decoded.id;
    }

    // 1️⃣ Lấy danh sách nhân viên thỏa mãn điều kiện phân quyền ở trên
    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: {
        id: true,
        employeeCode: true,
        name: true,
        avatar: true,
        workInfo: {
          select: {
            department: { select: { name: true } },
            position: { select: { name: true } },
          },
        },
      },
    });

    if (employees.length === 0) {
      return NextResponse.json({ total: 0, page, pageSize, data: [] });
    }

    const employeeMap = new Map(employees.map((e) => [e.id, e]));
    const employeeIds = employees.map((e) => e.id);

    // 2️⃣ Lọc Attendance theo danh sách ID đã lọc + ngày UTC
    const attendanceWhere: Prisma.AttendanceWhereInput = {
      employeeId: { in: employeeIds },
      ...(fromUtc || toUtc
        ? {
            date: {
              ...(fromUtc ? { gte: fromUtc } : {}),
              ...(toUtc ? { lte: toUtc } : {}),
            },
          }
        : {}),
    };

    const attendances = await prisma.attendance.findMany({
      where: attendanceWhere,
      orderBy: { date: "desc" },
    });

    // 3️⃣ Gom nhóm theo employeeId + ngày (theo giờ VN)
    const grouped = new Map<string, any>();

    attendances.forEach((att) => {
      const emp = employeeMap.get(att.employeeId)!;
      const dateVN = dayjs(att.date)
        .tz("Asia/Ho_Chi_Minh")
        .format("YYYY-MM-DD");
      const key = `${att.employeeId}-${dateVN}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          employeeId: att.employeeId,
          employeeCode: emp.employeeCode,
          avatar: emp.avatar,
          employeeName: emp.name,
          department: emp.workInfo?.department?.name,
          position: emp.workInfo?.position?.name,
          date: dateVN,
          firstCheckIn: att.checkInTime ?? null,
          lastCheckOut: att.checkOutTime ?? null,
          totalMs: 0,
        });
      }

      const g = grouped.get(key)!;
      if (
        att.checkInTime &&
        (!g.firstCheckIn || att.checkInTime < g.firstCheckIn)
      ) {
        g.firstCheckIn = att.checkInTime;
      }
      if (
        att.checkOutTime &&
        (!g.lastCheckOut || att.checkOutTime > g.lastCheckOut)
      ) {
        g.lastCheckOut = att.checkOutTime;
      }
      if (att.checkInTime && att.checkOutTime) {
        g.totalMs += att.checkOutTime.getTime() - att.checkInTime.getTime();
      }
    });

    // 4️⃣ Kết quả cuối cùng
    const summary = Array.from(grouped.values()).map((g) => ({
      ...g,
      firstCheckIn: g.firstCheckIn
        ? dayjs(g.firstCheckIn)
            .tz("Asia/Ho_Chi_Minh")
            .format("YYYY-MM-DD HH:mm:ss")
        : null,
      lastCheckOut: g.lastCheckOut
        ? dayjs(g.lastCheckOut)
            .tz("Asia/Ho_Chi_Minh")
            .format("YYYY-MM-DD HH:mm:ss")
        : null,
      totalHours: calcHours(g.firstCheckIn, g.lastCheckOut),
    }));

    // Phân trang trên kết quả đã gom nhóm
    const total = summary.length;
    const start = (page - 1) * pageSize;
    const pagedSummary = summary.slice(start, start + pageSize);

    return NextResponse.json({
      total,
      page,
      pageSize,
      data: pagedSummary,
    });
  } catch (error) {
    console.error("❌ Error fetching attendance summary:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
