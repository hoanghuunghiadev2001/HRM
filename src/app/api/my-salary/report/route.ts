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

    const salaries = await prisma.salary.findMany({
      where: {
        employeeId: decoded.id,
        year: year,
      },
      orderBy: { month: "asc" },
    });

    const reportData = salaries.map((s) => {
      // 1. Tính tổng các khoản giảm trừ
      const totalDeductions =
        (s.insuranceDeduction || 0) +
        (s.unemploymentInsu || 0) +
        (s.unionFee || 0) +
        (s.taxTNCN || 0) +
        (s.advancePayment || 0) +
        (s.phoneDeduction || 0) +
        (s.salaryDeductionFinal || 0);

      // 2. Tính TỔNG THỰC NHẬN CẢ THÁNG (Lần 1 + Thực nhận còn lại)
      // Đây là số tiền thực tế chảy vào túi nhân viên
      const totalMonthlyNet = (s.firstReceived || 0) + (s.actualReceived || 0);

      return {
        ...s,
        displayMonth: `Tháng ${s.month}`,
        totalDeductions: totalDeductions,
        totalMonthlyNet: totalMonthlyNet, // Trường mới để hiển thị trên bảng/biểu đồ

        // Cập nhật lại key cho biểu đồ để phản ánh đúng tổng thu nhập
        chartNet: totalMonthlyNet,
        chartGross: s.totalGross,
      };
    });

    return NextResponse.json(reportData, { status: 200 });
  } catch (error) {
    console.error("Lỗi báo cáo lương:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
