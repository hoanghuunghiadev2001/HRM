/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Đảm bảo đường dẫn này đúng với dự án của bạn

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Next.js 15 khuyến nghị dùng Promise cho params
) {
  try {
    // 1. Lấy ID từ params (await nếu dùng Next.js 15)
    const { id } = await params;
    const salaryId = parseInt(id);

    if (isNaN(salaryId)) {
      return NextResponse.json(
        { error: "ID lương không hợp lệ" },
        { status: 400 },
      );
    }

    // 2. Đọc dữ liệu từ body
    const body = await req.json();

    /**
     * 3. Trích xuất dữ liệu (Destructuring)
     * Loại bỏ các trường hệ thống và quan hệ (employee) để tránh lỗi Prisma
     * Chỉ giữ lại các trường số liệu lương trong updateData
     */
    const {
      id: _id,
      createdAt,
      updatedAt,
      employee,
      batchId,
      employeeId,
      ...updateData
    } = body;

    // 4. Thực hiện cập nhật trong Database
    const updated = await prisma.salary.update({
      where: { id: salaryId },
      data: updateData,
    });

    // 5. Trả về kết quả thành công
    return NextResponse.json({
      message: "Cập nhật thông tin lương thành công",
      data: updated,
    });
  } catch (error: any) {
    console.error("❌ [PATCH SALARY ERROR]:", error);

    // Xử lý lỗi đặc thù của Prisma (ví dụ: không tìm thấy bản ghi)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Không tìm thấy bản ghi lương này để cập nhật" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu đầu vào." },
      { status: 500 },
    );
  }
}

/**
 * (Tùy chọn) Viết thêm API DELETE để xóa lẻ từng dòng lương nếu cần
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const salaryId = parseInt(id);

    await prisma.salary.delete({
      where: { id: salaryId },
    });

    return NextResponse.json({ message: "Đã xóa dòng lương thành công" });
  } catch (error) {
    return NextResponse.json({ error: "Xóa thất bại" }, { status: 500 });
  }
}
