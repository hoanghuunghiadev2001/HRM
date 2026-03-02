/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// [GET]: Lấy danh sách lương
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Lấy các tham số phân trang
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Các tham số lọc
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const employeeCode = searchParams.get("code");
    const type = searchParams.get("type"); // "QL" hoặc "NV"

    const where: any = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (type) where.type = type;
    if (employeeCode) {
      where.OR = [
        { employeeCode: { contains: employeeCode } },
        { fullName: { contains: employeeCode } }, // Cho phép tìm theo tên luôn cho tiện
      ];
    }

    // Chạy song song: Lấy dữ liệu và Đếm tổng số bản ghi để tối ưu tốc độ
    const [salaries, totalCount] = await Promise.all([
      prisma.salary.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: {
            select: {
              name: true,
              employeeCode: true,
              avatar: true, // Thêm avatar nếu bạn muốn hiển thị ở bảng
            },
          },
        },
        orderBy: { employeeCode: "asc" }, // Sắp xếp theo mã NV cho dễ nhìn
      }),
      prisma.salary.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: salaries,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Salary GET Error:", error);
    return NextResponse.json(
      { error: "Lỗi lấy danh sách lương" },
      { status: 500 },
    );
  }
}

// [POST]: Tạo mới thủ công 1 bản ghi lương
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, month, year, type, ...data } = body;

    const newSalary = await prisma.salary.upsert({
      where: {
        employeeId_month_year_type: { employeeId, month, year, type },
      },
      update: data,
      create: { employeeId, month, year, type, ...data },
    });

    return NextResponse.json(newSalary);
  } catch (error) {
    return NextResponse.json(
      { error: "Lỗi tạo bản ghi lương" },
      { status: 500 },
    );
  }
}
