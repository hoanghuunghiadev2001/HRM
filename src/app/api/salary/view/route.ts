/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * GET /api/salary/view
 * Trả về danh sách lương mà người dùng hiện tại được phép xem,
 * dựa hoàn toàn vào SalaryViewPermission — không phụ thuộc vào role.
 *
 * Query:
 *   year      (required)
 *   month     (optional)
 *   targetId  (optional – lọc 1 nhân viên, phải có permission)
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
    const filterTargetId = searchParams.get("targetId")
      ? Number(searchParams.get("targetId"))
      : undefined;

    const isAdmin = false; // Tạm hardcode, sau này có thể dùng decoded.role === "ADMIN" nếu muốn admin xem tất cả mà không cần cấp permission

    // -----------------------------------------------------------------------
    // Xác định danh sách targetId được phép xem
    // -----------------------------------------------------------------------
    let allowedTargetIds: number[] | "all";

    if (isAdmin) {
      allowedTargetIds = "all"; // Admin thấy tất cả, không cần check permission
    } else {
      const perms = await prisma.salaryViewPermission.findMany({
        where: { viewerId: decoded.id, isActive: true },
        select: { targetId: true },
      });
      allowedTargetIds = perms.map((p) => p.targetId);

      if (allowedTargetIds.length === 0) {
        return NextResponse.json({
          data: [],
          total: 0,
          year,
          month: month ?? null,
        });
      }
    }

    // Nếu filter theo 1 target, kiểm tra quyền trước
    if (filterTargetId) {
      if (
        allowedTargetIds !== "all" &&
        !allowedTargetIds.includes(filterTargetId)
      ) {
        return NextResponse.json(
          { message: "Bạn không có quyền xem lương nhân viên này" },
          { status: 403 },
        );
      }
    }

    // -----------------------------------------------------------------------
    // Build where clause cho Salary
    // -----------------------------------------------------------------------
    const salaryWhere: any = { year };
    if (month) salaryWhere.month = month;

    if (filterTargetId) {
      salaryWhere.employeeId = filterTargetId;
    } else if (allowedTargetIds !== "all") {
      salaryWhere.employeeId = { in: allowedTargetIds };
    }

    // -----------------------------------------------------------------------
    // Lấy dữ liệu lương kèm thông tin nhân viên
    // -----------------------------------------------------------------------
    const salaries = await prisma.salary.findMany({
      where: salaryWhere,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
            workInfo: {
              select: {
                department: { select: { name: true, abbreviation: true } },
                position: { select: { name: true } },
                contractType: true,
              },
            },
          },
        },
      },
      orderBy: [{ employeeId: "asc" }, { month: "asc" }],
    });

    // -----------------------------------------------------------------------
    // Nhóm theo nhân viên
    // -----------------------------------------------------------------------
    const grouped: Record<
      number,
      {
        employee: (typeof salaries)[0]["employee"];
        months: typeof salaries;
        totalGross: number;
        totalNet: number;
      }
    > = {};

    for (const s of salaries) {
      if (!grouped[s.employeeId]) {
        grouped[s.employeeId] = {
          employee: s.employee,
          months: [],
          totalGross: 0,
          totalNet: 0,
        };
      }
      grouped[s.employeeId].months.push(s);
      grouped[s.employeeId].totalGross += s.totalGross;
      grouped[s.employeeId].totalNet +=
        (s.firstReceived ?? 0) + (s.actualReceived ?? 0);
    }

    const data = Object.values(grouped).map((g) => {
      const base = {
        employee: {
          id: g.employee.id,
          employeeCode: g.employee.employeeCode,
          name: g.employee.name,
          department: g.employee.workInfo?.department?.name ?? null,
          departmentAbbr: g.employee.workInfo?.department?.abbreviation ?? null,
          position: g.employee.workInfo?.position?.name ?? null,
          contractType: g.employee.workInfo?.contractType ?? null,
        },
        totalAnnualGross: g.totalGross,
        totalAnnualNet: g.totalNet,
        monthlySummary: g.months.map((s) => ({
          month: s.month,
          year: s.year,
          type: s.type,
          workingDays: s.workingDays,
          totalGross: s.totalGross,
          totalNet: s.totalNet,
          firstReceived: s.firstReceived,
          actualReceived: s.actualReceived,
        })),
      };

      // Admin xem thêm toàn bộ chi tiết các khoản
      if (isAdmin) {
        return {
          ...base,
          salaryDetails: Object.fromEntries(
            g.months.map((s) => [
              s.month,
              {
                // Phụ cấp
                baseSalary: s.baseSalary,
                efficiencySalary: s.efficiencySalary,
                salary70: s.salary70,
                phoneAllowance: s.phoneAllowance,
                seniorityAllowance: s.seniorityAllowance,
                mealAllowance: s.mealAllowance,
                maternityAllowance: s.maternityAllowance,
                houseAllowance: s.houseAllowance,
                // Năng suất
                productivitySalary: s.productivitySalary,
                productivityOther: s.productivityOther,
                // Thưởng
                bonusDay10: s.bonusDay10,
                bonusDay25: s.bonusDay25,
                bonus: s.bonus,
                overtime: s.overtime,
                otherIncome: s.otherIncome,
                salaryAdjust: s.salaryAdjust,
                // Khấu trừ
                insuranceDeduction: s.insuranceDeduction,
                unemploymentInsu: s.unemploymentInsu,
                unionFee: s.unionFee,
                advancePayment: s.advancePayment,
                taxTNCN: s.taxTNCN,
                phoneDeduction: s.phoneDeduction,
                salaryDeductionFinal: s.salaryDeductionFinal,
                // Tổng
                totalGross: s.totalGross,
                totalNet: s.totalNet,
                firstReceived: s.firstReceived,
                bonusReceived: s.bonusReceived,
                actualReceived: s.actualReceived,
              },
            ]),
          ),
        };
      }

      return base;
    });

    return NextResponse.json({
      year,
      month: month ?? null,
      isAdmin,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("Lỗi xem lương:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
