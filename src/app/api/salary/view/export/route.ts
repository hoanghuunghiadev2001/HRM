/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs"; // Cần cài đặt: npm install exceljs

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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

    // GIỮ NGUYÊN LOGIC PHÂN QUYỀN CỦA BẠN
    const isAdmin = false;

    let allowedTargetIds: number[] | "all";
    if (!isAdmin) {
      allowedTargetIds = "all";
    } else {
      const perms = await prisma.salaryViewPermission.findMany({
        where: { viewerId: decoded.id, isActive: true },
        select: { targetId: true },
      });
      allowedTargetIds = perms.map((p) => p.targetId);

      if (allowedTargetIds.length === 0) {
        return NextResponse.json(
          { message: "Không có dữ liệu để xuất" },
          { status: 404 },
        );
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

    // BẮT ĐẦU LÀM ĐẸP VỚI EXCELJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bảng Lương");

    // 1. Định nghĩa cột (Column Headers)
    let columns = [
      { header: "Mã NV", key: "code", width: 12 },
      { header: "Họ tên", key: "name", width: 25 },
      { header: "Phòng ban", key: "dept", width: 20 },
      { header: "Chức vụ", key: "pos", width: 15 },
      { header: "Tháng", key: "month", width: 10 },
      { header: "Năm", key: "year", width: 10 },
      { header: "Loại", key: "type", width: 12 },
      { header: "Ngày công", key: "days", width: 12 },
    ];

    // GIỮ NGUYÊN LOGIC CỘT CỦA BẠN: Admin thấy hết, User thấy tóm tắt
    if (!isAdmin) {
      columns = columns.concat([
        { header: "Lương BHXH", key: "base", width: 15 },
        { header: "Lương HQ", key: "eff", width: 15 },
        { header: "Lương 70%", key: "s70", width: 15 },
        { header: "PC ĐT", key: "p1", width: 12 },
        { header: "PC TN", key: "p2", width: 12 },
        { header: "PC BĂ", key: "p3", width: 12 },
        { header: "PC TS", key: "p4", width: 12 },
        { header: "PC NR", key: "p5", width: 12 },
        { header: "Năng suất", key: "prod", width: 15 },
        { header: "Năng suất khác", key: "prodO", width: 15 },
        { header: "Thưởng 10", key: "b10", width: 12 },
        { header: "Thưởng 25", key: "b25", width: 12 },
        { header: "Thưởng", key: "b", width: 12 },
        { header: "OT", key: "ot", width: 12 },
        { header: "Thu nhập khác", key: "other", width: 15 },
        { header: "Bù lương", key: "adj", width: 12 },
        { header: "BHXH-YT", key: "ins", width: 15 },
        { header: "Thuế TNCN", key: "tax", width: 15 },
        { header: "Tổng gộp", key: "gross", width: 18 },
        { header: "Tổng Net", key: "net", width: 18 },
        { header: "Nhận lần 1", key: "f", width: 18 },
        { header: "Thực lãnh", key: "act", width: 18 },
      ]);
    } else {
      columns = columns.concat([
        { header: "Tổng gộp (1)", key: "gross", width: 18 },
        { header: "Tổng (2)", key: "net", width: 18 },
        { header: "Nhận lần 1", key: "f", width: 18 },
        { header: "Thực lãnh", key: "act", width: 18 },
      ]);
    }

    worksheet.columns = columns;

    // 2. Thêm dữ liệu vào rows
    salaries.forEach((s) => {
      const baseData = {
        code: s.employee.employeeCode,
        name: s.employee.name,
        dept: s.employee.workInfo?.department?.name,
        pos: s.employee.workInfo?.position?.name,
        month: s.month,
        year: s.year,
        type: s.type,
        days: s.workingDays,
        gross: s.totalGross,
        net: s.totalNet,
        f: s.firstReceived,
        act: s.actualReceived,
      };

      if (!isAdmin) {
        Object.assign(baseData, {
          base: s.baseSalary,
          eff: s.efficiencySalary,
          s70: s.salary70,
          p1: s.phoneAllowance,
          p2: s.seniorityAllowance,
          p3: s.mealAllowance,
          p4: s.maternityAllowance,
          p5: s.houseAllowance,
          prod: s.productivitySalary,
          prodO: s.productivityOther,
          b10: s.bonusDay10,
          b25: s.bonusDay25,
          b: s.bonus,
          ot: s.overtime,
          other: s.otherIncome,
          adj: s.salaryAdjust,
          ins: (s.insuranceDeduction || 0) + (s.unemploymentInsu || 0),
          tax: s.taxTNCN,
        });
      }
      worksheet.addRow(baseData);
    });

    // 3. STYLE CHO FILE CHUYÊN NGHIỆP
    // Row 1 (Tiêu đề)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1F4E78" }, // Màu xanh Navy
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Định dạng số và Border cho toàn bộ bảng
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          // Nếu là các cột số tiền (từ cột 8 trở đi là phần lương)
          if (colNumber >= 8) {
            cell.numFmt = "#,##0";
            cell.alignment = { horizontal: "right" };
          }
        });
      }
    });

    // Cố định dòng 1 và bật Auto Filter
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };

    // 4. Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `BangLuong_${year}${month ? `_T${month}` : ""}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Lỗi xuất Excel:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
