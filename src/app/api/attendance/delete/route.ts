/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const employeeCode = searchParams.get("employeeCode");

    if (!dateStr) {
      return NextResponse.json({
        success: false,
        message: "Thiếu ngày cần xóa",
      });
    }

    // ✅ CHUYỂN SANG ĐỐI TƯỢNG DATE
    const dateObj = new Date(dateStr);

    let where: any = { date: dateObj };

    if (employeeCode) {
      const numeric = Number(employeeCode);
      const padded = numeric.toString().padStart(5, "0");

      where.employee = {
        OR: [
          { employeeCode },
          { employeeCode: padded },
          { employeeCode: numeric.toString() },
        ],
      };
    }

    const countBefore = await prisma.attendance.count({ where });
    const deleted = await prisma.attendance.deleteMany({ where });

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${deleted.count}/${countBefore} bản ghi chấm công của ${
        employeeCode || "toàn bộ"
      } ngày ${dateStr}`,
    });
  } catch (err: any) {
    console.error("❌ Lỗi xóa chấm công:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
