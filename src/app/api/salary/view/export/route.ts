/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * GET /api/salary/view/export
 * Xuất CSV lương dựa trên SalaryViewPermission (không phụ thuộc role)
 * Admin → tất cả cột chi tiết
 * Người được cấp quyền → cột tóm tắt (tổng gộp + thực lãnh)
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
    const isAdmin = false;

    // Xác định targetIds được phép
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
        const empty = "\uFEFFMã NV,Họ tên\nKhông có dữ liệu\n";
        return new NextResponse(empty, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="luong_${year}.csv"`,
          },
        });
      }
    }

    const salaryWhere: any = { year };
    if (month) salaryWhere.month = month;
    if (allowedTargetIds !== "all")
      salaryWhere.employeeId = { in: allowedTargetIds };

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
      orderBy: [{ employeeId: "asc" }, { month: "asc" }],
    });

    const BOM = "\uFEFF";
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const num = (v: number | null | undefined) => (v ?? 0).toFixed(0);

    let csv: string;

    if (isAdmin) {
      const header = [
        "Mã NV",
        "Họ tên",
        "Phòng ban",
        "Chức vụ",
        "Tháng",
        "Năm",
        "Loại",
        "Ngày công",
        "Lương BHXH",
        "Lương HQ",
        "Lương 70%",
        "PC ĐT",
        "PC TN",
        "PC BĂ",
        "PC TS",
        "PC NR",
        "Năng suất",
        "Năng suất khác",
        "Thưởng 10",
        "Thưởng 25",
        "Thưởng",
        "OT",
        "Thu nhập khác",
        "Bù lương",
        "BHXH-YT 9.5%",
        "BHTN 1%",
        "Công đoàn",
        "Tạm ứng",
        "Thuế TNCN",
        "PC ĐT trừ",
        "Trừ lương cuối",
        "Tổng gộp (1)",
        "Tổng (2)",
        "Nhận lần 1",
        "Thưởng nhận",
        "Thực lãnh",
      ].join(",");

      const rows = salaries.map((s) =>
        [
          esc(s.employee.employeeCode),
          esc(s.employee.name),
          esc(s.employee.workInfo?.department?.name),
          esc(s.employee.workInfo?.position?.name),
          s.month,
          s.year,
          esc(s.type),
          num(s.workingDays),
          num(s.baseSalary),
          num(s.efficiencySalary),
          num(s.salary70),
          num(s.phoneAllowance),
          num(s.seniorityAllowance),
          num(s.mealAllowance),
          num(s.maternityAllowance),
          num(s.houseAllowance),
          num(s.productivitySalary),
          num(s.productivityOther),
          num(s.bonusDay10),
          num(s.bonusDay25),
          num(s.bonus),
          num(s.overtime),
          num(s.otherIncome),
          num(s.salaryAdjust),
          num(s.insuranceDeduction),
          num(s.unemploymentInsu),
          num(s.unionFee),
          num(s.advancePayment),
          num(s.taxTNCN),
          num(s.phoneDeduction),
          num(s.salaryDeductionFinal),
          num(s.totalGross),
          num(s.totalNet),
          num(s.firstReceived),
          num(s.bonusReceived),
          num(s.actualReceived),
        ].join(","),
      );

      csv = BOM + [header, ...rows].join("\n");
    } else {
      const header = [
        "Mã NV",
        "Họ tên",
        "Phòng ban",
        "Chức vụ",
        "Tháng",
        "Năm",
        "Loại",
        "Ngày công",
        "Tổng lương gộp",
        "Nhận lần 1",
        "Thực lãnh",
      ].join(",");

      const rows = salaries.map((s) =>
        [
          esc(s.employee.employeeCode),
          esc(s.employee.name),
          esc(s.employee.workInfo?.department?.name),
          esc(s.employee.workInfo?.position?.name),
          s.month,
          s.year,
          esc(s.type),
          num(s.workingDays),
          num(s.totalGross),
          num(s.firstReceived),
          num(s.actualReceived),
        ].join(","),
      );

      csv = BOM + [header, ...rows].join("\n");
    }

    const filename = `luong_${year}${month ? `_thang${month}` : ""}.csv`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Lỗi xuất CSV:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
