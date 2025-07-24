/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const role = searchParams.get("role") || "USER";
    const department = searchParams.get("department") || "";
    const name = searchParams.get("name") || "";
    const employeeCode = searchParams.get("employeeCode") || "";
    const workStatus = searchParams.get("workStatus") || ""; // OFFICIAL | PROBATION | RESIGNED
    const pageSizeParam = searchParams.get("pageSize");
    const pageParam = searchParams.get("page");

    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : undefined;
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    if (role === "USER") {
      return NextResponse.json(
        { message: "Bạn không có quyền truy cập" },
        { status: 401 }
      );
    }

    // Xử lý lọc phòng ban
    let departmentId: number | undefined;
    let positionId: number | undefined;
    if (department) {
      const parts = department.split("-");
      departmentId = parts[0] ? parseInt(parts[0], 10) : undefined;
      positionId = parts[1] ? parseInt(parts[1], 10) : undefined;
    }

    // Bộ lọc chung
    const whereFilter: Prisma.EmployeeWhereInput = {
      AND: [
        name
          ? {
              name: {
                contains: name,
              },
            }
          : {},
        employeeCode
          ? {
              employeeCode: {
                contains: employeeCode,
              },
            }
          : {},
        departmentId || positionId
          ? {
              workInfo: {
                ...(departmentId && { departmentId }),
                ...(positionId && { positionId }),
              },
            }
          : {},
        workStatus
          ? {
              otherInfo: {
                workStatus: workStatus as any,
              },
            }
          : {
              otherInfo: {
                workStatus: {
                  in: ["OFFICIAL", "PROBATION"],
                },
              },
            },
      ],
    };

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
        otherInfo: {
          select: {
            workStatus: true,
          },
        },
      },
    };

    if (pageSize) {
      findManyOptions.skip = (page - 1) * pageSize;
      findManyOptions.take = pageSize;
    }

    const [data, total] = await Promise.all([
      prisma.employee.findMany(findManyOptions),
      prisma.employee.count({ where: whereFilter }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách nhân viên:", error);
    return NextResponse.json(
      { message: "Không lấy được danh sách nhân viên" },
      { status: 500 }
    );
  }
}
