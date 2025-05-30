/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "../../../../../generated/prisma";

const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const role = searchParams.get("role") || "USER";
    const department = searchParams.get("department") || "";
    const name = searchParams.get("name") || "";
    const employeeCode = searchParams.get("employeeCode") || "";
    const pageSizeParam = searchParams.get("pageSize");
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : undefined; // undefined nếu không truyền

    const pageParam = searchParams.get("page");
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    if (role === "USER") {
      return NextResponse.json(
        { message: "Bạn không có quyền truy cập" },
        { status: 401 }
      );
    }
    // Bộ lọc chung
    const whereFilter: Prisma.EmployeeWhereInput = {
      AND: [
        name
          ? {
              name: {
                contains: name,
                mode: "insensitive",
              },
            }
          : {},
        employeeCode
          ? {
              employeeCode: {
                contains: employeeCode,
                mode: "insensitive",
              },
            }
          : {},
      ],
    };

    // Lọc phòng ban
    if (department) {
      const parts = department.split("-");
      const departmentId = parts[0] ? parseInt(parts[0], 10) : undefined;
      const positionId = parts[1] ? parseInt(parts[1], 10) : undefined;

      whereFilter.workInfo = {
        ...(departmentId && { departmentId }),
        ...(positionId && { positionId }),
      };
    }

    // Nếu cần logic riêng cho role MANAGER giới hạn phòng ban, bạn có thể mở rộng logic ở đây
    const findManyOptions: any = {
      where: whereFilter,
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        gender: true,
        avatar: true,
        workInfo: {
          select: {
            department: true,
            position: true,
          },
        },
      },
    };

    if (pageSize) {
      findManyOptions.skip = (page - 1) * pageSize;
      findManyOptions.take = pageSize;
    }

    const data = await prisma.employee.findMany(findManyOptions);
    const total = await prisma.employee.count({ where: whereFilter });
    // const [data, total] = await Promise.all([
    //   prisma.employee.findMany({
    //     where: whereFilter,
    //     skip: (page - 1) * pageSize,
    //     take: pageSize,
    //     orderBy: {
    //       name: "asc",
    //     },
    //     select: {
    //       id: true,
    //       employeeCode: true,
    //       name: true,
    //       gender: true,
    //       avatar: true,
    //       workInfo: {
    //         select: {
    //           department: true,
    //           position: true,
    //         },
    //       },
    //     },
    //   }),
    //   prisma.employee.count({ where: whereFilter }),
    // ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách nhân viên rút gọn:", error);
    return NextResponse.json(
      { message: "Không lấy được danh sách nhân viên" },
      { status: 500 }
    );
  }
}
