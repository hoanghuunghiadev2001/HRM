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

    // isAdmin = true → thấy toàn bộ + chi tiết đầy đủ mọi khoản
    const isAdmin = decoded.role === "ADMIN";

    // ── Xác định allowedTargetIds ────────────────────────────────────────────
    let allowedTargetIds: number[] | "all";

    if (isAdmin) {
      allowedTargetIds = "all";
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
          isAdmin: false,
        });
      }
    }

    // Kiểm tra quyền khi filter theo 1 target
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

    // ── Build where clause ───────────────────────────────────────────────────
    const salaryWhere: any = { year };
    if (month) salaryWhere.month = month;

    if (filterTargetId) {
      salaryWhere.employeeId = filterTargetId;
    } else if (allowedTargetIds !== "all") {
      salaryWhere.employeeId = { in: allowedTargetIds };
    }

    // ── Query ────────────────────────────────────────────────────────────────
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

    // ── Group by employee ────────────────────────────────────────────────────
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

    // ── Build response ───────────────────────────────────────────────────────
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

      // Admin → trả toàn bộ chi tiết mọi khoản khớp với Salary model
      if (isAdmin) {
        return {
          ...base,
          salaryDetails: Object.fromEntries(
            g.months.map((s) => [
              s.month,
              {
                // Lương cố định
                baseSalary: s.baseSalary,
                efficiencySalary: s.efficiencySalary,
                salary70: s.salary70,
                // Phụ cấp
                phoneAllowance: s.phoneAllowance,
                seniorityAllowance: s.seniorityAllowance,
                mealAllowance: s.mealAllowance,
                maternityAllowance: s.maternityAllowance,
                houseAllowance: s.houseAllowance,
                // Năng suất
                productivitySalary: s.productivitySalary,
                productivityOther: s.productivityOther,
                productivitySCC: s.productivitySCC,
                productivityPaint: s.productivityPaint,
                productivityAccessory: s.productivityAccessory,
                productivityParts: s.productivityParts,
                // Thưởng & cộng thêm
                bonusDay10: s.bonusDay10,
                bonusDay25: s.bonusDay25,
                bonus: s.bonus,
                otherWork: s.otherWork,
                salaryAdjust: s.salaryAdjust,
                otherIncome: s.otherIncome,
                // Tăng ca
                overtime15: s.overtime15,
                overtime2: s.overtime2,
                overtime3: s.overtime3,
                overtime: s.overtime,
                // Khấu trừ
                salaryDeduction: s.salaryDeduction,
                insuranceDeduction: s.insuranceDeduction,
                unemploymentInsu: s.unemploymentInsu,
                unionFee: s.unionFee,
                advancePayment: s.advancePayment,
                socialWorkDeduction: s.socialWorkDeduction,
                healthCardDeduction: s.healthCardDeduction,
                insuranceArrears: s.insuranceArrears,
                taxCompensation: s.taxCompensation,
                taxTNCN: s.taxTNCN,
                phoneDeduction: s.phoneDeduction,
                taxRefund: s.taxRefund,
                salaryDeductionFinal: s.salaryDeductionFinal,
                // Tổng & thực nhận
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

      // Non-admin → chỉ trả summary, không có salaryDetails
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
