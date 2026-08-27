/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // ============================================================
    // 1. LẤY USER ĐANG ĐĂNG NHẬP
    // ============================================================

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Bạn chưa đăng nhập",
        },
        {
          status: 401,
        },
      );
    }

    // ============================================================
    // 2. QUERY PARAMS
    // ============================================================

    const url = new URL(req.url);

    const isActiveParam = url.searchParams.get("isActive");

    const employeeCode = url.searchParams.get("employeeCode") || "";

    const name = url.searchParams.get("name") || "";

    const departmentParam = url.searchParams.get("department");

    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);

    const pageSize = Math.min(
      Math.max(parseInt(url.searchParams.get("pageSize") || "10", 10), 1),
      100,
    );

    // ============================================================
    // 3. PARSE ACTIVE
    // ============================================================

    const isActive =
      isActiveParam === "true"
        ? true
        : isActiveParam === "false"
          ? false
          : null;

    if (isActive === null) {
      return NextResponse.json(
        {
          message: "Missing or invalid isActive query parameter",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // 4. BUILD WHERE
    // ============================================================

    const whereFilter: any = {
      isActive,
    };

    // ============================================================
    // 5. PHÂN QUYỀN CHI NHÁNH
    // ============================================================

    if (currentUser.role === "ADMIN") {
      // ----------------------------------------------------------
      // ADMIN GLOBAL
      // ----------------------------------------------------------

      if (currentUser.global === true) {
        // Không giới hạn brand
      }

      // ----------------------------------------------------------
      // ADMIN THEO CHI NHÁNH
      // ----------------------------------------------------------
      else {
        if (!currentUser.brand) {
          return NextResponse.json(
            {
              message: "Tài khoản ADMIN chưa được cấu hình chi nhánh",
            },
            {
              status: 403,
            },
          );
        }

        whereFilter.brand = currentUser.brand;
      }
    }

    // ============================================================
    // 6. FILTER MSNV
    // ============================================================

    if (employeeCode.trim()) {
      whereFilter.employeeCode = {
        contains: employeeCode.trim(),
      };
    }

    // ============================================================
    // 7. FILTER NAME
    // ============================================================

    if (name.trim()) {
      whereFilter.name = {
        contains: name.trim(),
      };
    }

    // ============================================================
    // 8. FILTER DEPARTMENT / POSITION
    // ============================================================

    if (departmentParam) {
      const parts = departmentParam.split("-");

      const departmentId = parts[0] ? parseInt(parts[0], 10) : undefined;

      const positionId = parts[1] ? parseInt(parts[1], 10) : undefined;

      whereFilter.workInfo = {
        ...(departmentId && !Number.isNaN(departmentId)
          ? {
              departmentId,
            }
          : {}),

        ...(positionId && !Number.isNaN(positionId)
          ? {
              positionId,
            }
          : {}),
      };
    }

    // ============================================================
    // 9. TOTAL
    // ============================================================

    const total = await prisma.employee.count({
      where: whereFilter,
    });

    // ============================================================
    // 10. DATA
    // ============================================================

    const employees = await prisma.employee.findMany({
      where: whereFilter,

      skip: (page - 1) * pageSize,

      take: pageSize,

      orderBy: {
        employeeCode: "asc",
      },

      select: {
        id: true,
        employeeCode: true,
        name: true,
        isActive: true,

        // ⭐ mới
        brand: true,
        global: true,
        birthDate: true,
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

    // ============================================================
    // 11. FORMAT
    // ============================================================

    const result = employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      name: emp.name,
      isActive: emp.isActive,

      brand: emp.brand,
      global: emp.global,

      department: emp.workInfo?.department?.name || null,

      position: emp.workInfo?.position?.name || null,
    }));

    // ============================================================
    // 12. RESPONSE
    // ============================================================

    return NextResponse.json({
      data: result,
      total,
      page,
      pageSize,

      // thông tin quyền hiện tại
      permission: {
        role: currentUser.role,
        global: currentUser.global,
        brand: currentUser.brand,
      },
    });
  } catch (error) {
    console.error("Failed to fetch employees:", error);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
