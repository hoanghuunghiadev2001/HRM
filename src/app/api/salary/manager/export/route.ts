/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * GET /api/salary/manager/export
 * Xuất danh sách lương nhân viên ra CSV
 * - ADMIN: xuất tất cả
 * - MANAGER: chỉ xuất nhân viên của mình
 * Query: year, month (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token-hrm")?.value;
    if (!token)
      return NextResponse.json({ message: "Chưa xác thực" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };
    const { searchParams } = new URL(req.url);

    const year = Number(searchParams.get("year")) || new Date().getFullYear();
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined;

    const isAdmin = decoded.role === "ADMIN";
    const isManager = decoded.role === "MANAGER";

    if (!isAdmin && !isManager) {
      return NextResponse.json(
        { message: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    let allowedEmployeeIds: number[] | undefined;

    if (isManager) {
      const subs = await prisma.employee.findMany({
        where: { managerId: decoded.id, isActive: true },
        select: { id: true },
      });
      allowedEmployeeIds = subs.map((e) => e.id);
      if (allowedEmployeeIds.length === 0) {
        // Trả về CSV rỗng
        const csvEmpty =
          "Mã NV,Họ tên,Phòng ban,Chức vụ,Tháng,Năm,Loại,Ngày công,Lương gộp,Thực lãnh\n";
        return new NextResponse(csvEmpty, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="luong_${year}${month ? `_thang${month}` : ""}.csv"`,
          },
        });
      }
    }

    const salaryWhere: any = {
      year,
      ...(month && { month }),
      ...(allowedEmployeeIds && { employeeId: { in: allowedEmployeeIds } }),
    };

    const salaries = await prisma.salary.findMany({
      where: salaryWhere,
      include: {
        employee: {
          select: {
            employeeCode: true,
            name: true,
            workInfo: {
              select: {
                department: { select: { name: true } },
                position: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: [{ year: "asc" }, { month: "asc" }, { employeeId: "asc" }],
    });

    // Tạo CSV - Admin thấy đầy đủ cột, Manager thấy cột tóm tắt
    const BOM = "\uFEFF"; // UTF-8 BOM cho Excel đọc đúng tiếng Việt

    let headers: string[];
    let rows: string[];

    if (isAdmin) {
      headers = [
        "Mã NV",
        "Họ tên",
        "Phòng ban",
        "Chức vụ",
        "Loại HĐ",
        "Tháng",
        "Năm",
        "Loại",
        "Ngày công",
        "Lương BHXH+PC",
        "Lương hiệu quả",
        "Lương 70%",
        "PC điện thoại",
        "PC thâm niên",
        "PC bữa ăn",
        "PC thai sản",
        "PC nhà ở",
        "Năng suất",
        "Thưởng ngày 10",
        "Thưởng ngày 25",
        "Thưởng khác",
        "OT",
        "Thu nhập khác",
        "BHXH-YT 9.5%",
        "BHTN 1%",
        "Công đoàn",
        "Tạm ứng",
        "Thuế TNCN",
        "Tổng lương gộp (1)",
        "Tổng lương (2)",
        "Nhận lần 1",
        "Thực lãnh",
      ];
      rows = salaries.map((s) =>
        [
          s.employee.employeeCode,
          `"${s.employee.name}"`,
          `"${s.employee.workInfo?.department?.name || ""}"`,
          `"${s.employee.workInfo?.position?.name || ""}"`,
          s.type,
          s.month,
          s.year,
          s.type,
          s.workingDays,
          s.baseSalary,
          s.efficiencySalary,
          s.salary70,
          s.phoneAllowance,
          s.seniorityAllowance,
          s.mealAllowance,
          s.maternityAllowance,
          s.houseAllowance,
          s.productivitySalary,
          s.bonusDay10,
          s.bonusDay25,
          s.bonus,
          s.overtime,
          s.otherIncome,
          s.insuranceDeduction,
          s.unemploymentInsu,
          s.unionFee,
          s.advancePayment,
          s.taxTNCN,
          s.totalGross,
          s.totalNet,
          s.firstReceived,
          s.actualReceived,
        ].join(","),
      );
    } else {
      // Manager: chỉ xem tóm tắt (không thấy chi tiết các khoản khấu trừ nội bộ)
      headers = [
        "Mã NV",
        "Họ tên",
        "Phòng ban",
        "Chức vụ",
        "Tháng",
        "Năm",
        "Loại",
        "Ngày công",
        "Tổng lương gộp",
        "Thực lãnh",
      ];
      rows = salaries.map((s) =>
        [
          s.employee.employeeCode,
          `"${s.employee.name}"`,
          `"${s.employee.workInfo?.department?.name || ""}"`,
          `"${s.employee.workInfo?.position?.name || ""}"`,
          s.month,
          s.year,
          s.type,
          s.workingDays,
          s.totalGross,
          (s.firstReceived || 0) + (s.actualReceived || 0),
        ].join(","),
      );
    }

    const csv = BOM + [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="luong_${year}${month ? `_thang${month}` : ""}.csv"`,
      },
    });
  } catch (error) {
    console.error("Lỗi xuất lương:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
