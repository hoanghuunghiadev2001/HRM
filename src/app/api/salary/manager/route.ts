/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * GET /api/salary/manager/employees
 * - ADMIN: trả về toàn bộ nhân viên + lương
 * - MANAGER: trả về nhân viên cấp dưới trực tiếp (subordinates)
 * Query: year, month (optional), employeeId (optional - lọc 1 nhân viên cụ thể)
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
    const filterEmployeeId = searchParams.get("employeeId")
      ? Number(searchParams.get("employeeId"))
      : undefined;

    const isAdmin = decoded.role === "ADMIN";
    const isManager = decoded.role === "MANAGER";

    if (!isAdmin && !isManager) {
      return NextResponse.json(
        { message: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    // Xác định danh sách employeeId được phép xem
    let allowedEmployeeIds: number[] | undefined = undefined;

    if (isManager) {
      // Manager chỉ xem được subordinates trực tiếp
      const subordinates = await prisma.employee.findMany({
        where: { managerId: decoded.id, isActive: true },
        select: { id: true },
      });
      allowedEmployeeIds = subordinates.map((e) => e.id);

      if (allowedEmployeeIds.length === 0) {
        return NextResponse.json(
          { employees: [], salaries: [] },
          { status: 200 },
        );
      }
    }

    // Nếu filter theo 1 nhân viên cụ thể, kiểm tra quyền
    let employeeWhere: any = { isActive: true };
    if (filterEmployeeId) {
      if (isManager && !allowedEmployeeIds?.includes(filterEmployeeId)) {
        return NextResponse.json(
          { message: "Không có quyền xem nhân viên này" },
          { status: 403 },
        );
      }
      employeeWhere.id = filterEmployeeId;
    } else if (allowedEmployeeIds) {
      employeeWhere.id = { in: allowedEmployeeIds };
    }

    // Lấy danh sách nhân viên kèm thông tin phòng ban, chức vụ
    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: {
        id: true,
        employeeCode: true,
        name: true,
        role: true,
        managerId: true,
        workInfo: {
          select: {
            department: { select: { name: true, abbreviation: true } },
            position: { select: { name: true } },
            contractType: true,
          },
        },
      },
      orderBy: { employeeCode: "asc" },
    });

    // Lấy dữ liệu lương
    const salaryWhere: any = {
      year,
      employeeId: filterEmployeeId
        ? filterEmployeeId
        : allowedEmployeeIds
          ? { in: allowedEmployeeIds }
          : undefined,
    };
    if (month) salaryWhere.month = month;

    const salaries = await prisma.salary.findMany({
      where: salaryWhere,
      orderBy: [{ employeeId: "asc" }, { month: "asc" }],
    });

    // Map lương theo employeeId -> month
    const salaryMap: Record<number, Record<number, any>> = {};
    for (const s of salaries) {
      if (!salaryMap[s.employeeId]) salaryMap[s.employeeId] = {};
      salaryMap[s.employeeId][s.month] = s;
    }

    // Tổng hợp từng nhân viên
    const result = employees.map((emp) => {
      const empSalaries = salaryMap[emp.id] || {};
      const monthlySummary = Object.values(empSalaries).map((s: any) => ({
        month: s.month,
        year: s.year,
        type: s.type,
        totalGross: s.totalGross,
        totalNet: s.totalNet,
        actualReceived: s.actualReceived,
        firstReceived: s.firstReceived,
        workingDays: s.workingDays,
      }));

      const totalAnnualGross = monthlySummary.reduce(
        (sum, m) => sum + (m.totalGross || 0),
        0,
      );
      const totalAnnualNet = monthlySummary.reduce(
        (sum, m) => sum + (m.actualReceived || 0) + (m.firstReceived || 0),
        0,
      );

      return {
        employee: {
          id: emp.id,
          employeeCode: emp.employeeCode,
          name: emp.name,
          role: emp.role,
          managerId: emp.managerId,
          department: emp.workInfo?.department?.name || null,
          departmentAbbr: emp.workInfo?.department?.abbreviation || null,
          position: emp.workInfo?.position?.name || null,
          contractType: emp.workInfo?.contractType || null,
        },
        monthlySummary,
        totalAnnualGross,
        totalAnnualNet,
        salaryDetails: isAdmin ? empSalaries : undefined, // Chi tiết đầy đủ chỉ cho Admin
      };
    });

    return NextResponse.json(
      {
        year,
        month: month || null,
        isAdmin,
        total: result.length,
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Lỗi lấy danh sách lương:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
