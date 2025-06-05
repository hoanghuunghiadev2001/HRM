/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const isActiveParam = url.searchParams.get("isActive");
    const employeeCode = url.searchParams.get("employeeCode") || "";
    const name = url.searchParams.get("name") || "";
    const departmentParam = url.searchParams.get("department"); // Format: "1-2"
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);

    // parse isActive param
    const isActive =
      isActiveParam === "true"
        ? true
        : isActiveParam === "false"
        ? false
        : null;

    if (isActive === null) {
      return NextResponse.json(
        { message: "Missing or invalid isActive query parameter" },
        { status: 400 }
      );
    }

    // Build where filter
    const whereFilter: any = {
      isActive,
    };

    if (employeeCode) {
      whereFilter.employeeCode = {
        contains: employeeCode,
        mode: "insensitive",
      };
    }

    if (name) {
      whereFilter.name = {
        contains: name,
      };
    }

    if (departmentParam) {
      const parts = departmentParam.split("-");
      const departmentId = parts[0] ? parseInt(parts[0], 10) : undefined;
      const positionId = parts[1] ? parseInt(parts[1], 10) : undefined;

      whereFilter.workInfo = {
        ...(departmentId && { departmentId }),
        ...(positionId ? { positionId } : {}),
      };
    }

    // Fetch total count
    const total = await prisma.employee.count({
      where: whereFilter,
    });

    // Fetch paginated employees
    const employees = await prisma.employee.findMany({
      where: whereFilter,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        isActive: true,
        workInfo: {
          select: {
            department: {
              select: {
                name: true,
              },
            },
            position: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Format result
    const result = employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      name: emp.name,
      isActive: emp.isActive,
      department: emp.workInfo?.department?.name || null,
      position: emp.workInfo?.position?.name || null,
    }));

    return NextResponse.json({
      data: result,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
