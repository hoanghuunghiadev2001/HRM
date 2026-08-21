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

    const msnv = searchParams.get("msnv") ?? undefined;
    const name = searchParams.get("name") ?? undefined;
    const department = searchParams.get("department") ?? undefined;
    let fromDate = searchParams.get("fromDate") ?? undefined;
    let toDate = searchParams.get("toDate") ?? undefined;
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") ?? "20", 10), 1),
      200, // 🆕 chặn client truyền pageSize quá lớn gây nặng server
    );

    // 🆕 Nếu không chọn khoảng ngày → mặc định tháng hiện tại, tránh quét toàn bộ lịch sử
    if (!fromDate && !toDate) {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      fromDate = now.startOf("month").format("YYYY-MM-DD");
      toDate = now.format("YYYY-MM-DD");
    }

    const fromUtc = fromDate ? getUtcRange(fromDate, false) : undefined;
    const toUtc = toDate ? getUtcRange(toDate, true) : undefined;

    // --- 🛡️ BƯỚC 2: THIẾT LẬP WHERE CLAUSE THEO ROLE ---
    const employeeWhere: Prisma.EmployeeWhereInput = {};

    if (decoded.role === "ADMIN") {
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
      const managerWorkInfo = await prisma.workInfo.findUnique({
        where: { employeeId: decoded.id },
        select: {
          departmentId: true,
          position: { select: { level: true } },
        },
      });

      if (!managerWorkInfo?.departmentId || !managerWorkInfo?.position?.level) {
        return NextResponse.json({ total: 0, page, pageSize, data: [] });
      }

      const managerDeptId = managerWorkInfo.departmentId;
      const managerLevel = managerWorkInfo.position.level;

      employeeWhere.OR = [
        { id: decoded.id },
        {
          workInfo: {
            departmentId: managerDeptId,
            position: { level: { lt: managerLevel } },
          },
        },
      ];

      if (msnv || name) {
        employeeWhere.AND = [
          ...(msnv ? [{ employeeCode: { contains: msnv } }] : []),
          ...(name ? [{ name: { contains: name } }] : []),
        ];
      }
    } else {
      employeeWhere.id = decoded.id;
    }

    // 1️⃣ Chỉ lấy ID nhân viên thỏa điều kiện phân quyền — nhẹ, không kéo dữ liệu thừa
    const matchedEmployees = await prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true },
    });

    if (matchedEmployees.length === 0) {
      return NextResponse.json({ total: 0, page, pageSize, data: [] });
    }

    const employeeIds = matchedEmployees.map((e) => e.id);

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

    // 2️⃣ Đếm + lấy đúng 1 trang dữ liệu tại DB (KHÔNG group ở JS nữa —
    // mỗi nhân viên/ngày vốn đã là 1 dòng duy nhất theo @@unique([employeeId, date]))
    const [total, attendances] = await Promise.all([
      prisma.attendance.count({ where: attendanceWhere }),
      prisma.attendance.findMany({
        where: attendanceWhere,
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          employee: {
            select: {
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
          },
        },
      }),
    ]);

    // 3️⃣ Map thẳng ra response — không còn vòng lặp gom nhóm nặng nề
    const data = attendances.map((att) => ({
      employeeId: att.employeeId,
      employeeCode: att.employee.employeeCode,
      avatar: att.employee.avatar,
      employeeName: att.employee.name,
      department: att.employee.workInfo?.department?.name ?? "",
      position: att.employee.workInfo?.position?.name ?? "",
      date: dayjs(att.date).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD"),
      firstCheckIn: att.checkInTime
        ? dayjs(att.checkInTime)
            .tz("Asia/Ho_Chi_Minh")
            .format("YYYY-MM-DD HH:mm:ss")
        : null,
      lastCheckOut: att.checkOutTime
        ? dayjs(att.checkOutTime)
            .tz("Asia/Ho_Chi_Minh")
            .format("YYYY-MM-DD HH:mm:ss")
        : null,
      totalHours: calcHours(att.checkInTime, att.checkOutTime),
    }));

    return NextResponse.json({ total, page, pageSize, data });
  } catch (error) {
    console.error("❌ Error fetching attendance summary:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
