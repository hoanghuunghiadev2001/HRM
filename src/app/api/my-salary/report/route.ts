/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token-hrm")?.value;
    if (!token)
      return NextResponse.json({ message: "Chưa xác thực" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const { searchParams } = new URL(req.url);
    const year = Number(searchParams.get("year")) || dayjs().year();

    // Lấy toàn bộ các trường lương của nhân viên trong năm được chọn
    const salaries = await prisma.salary.findMany({
      where: {
        employeeId: decoded.id,
        year: year,
      },
      orderBy: { month: "asc" },
    });

    // Format dữ liệu kết hợp cho cả biểu đồ và bảng
    const reportData = salaries.map((s) => {
      // Tính tổng các khoản giảm trừ để hiển thị nhanh trên bảng
      const totalDeductions =
        s.insuranceDeduction +
        s.unemploymentInsu +
        s.unionFee +
        s.taxTNCN +
        s.advancePayment +
        s.phoneDeduction +
        s.salaryDeductionFinal;

      return {
        ...s,
        displayMonth: `Tháng ${s.month}`,
        totalDeductions: totalDeductions,
        // Các key gọn cho biểu đồ
        chartNet: s.actualReceived,
        chartGross: s.totalGross,
      };
    });

    return NextResponse.json(reportData, { status: 200 });
  } catch (error) {
    console.error("Lỗi báo cáo lương:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
