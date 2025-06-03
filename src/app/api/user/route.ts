// /app/api/employee/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const isActiveParam = url.searchParams.get("isActive");

    // parse isActive param sang boolean
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

    const employees = await prisma.employee.findMany({
      where: {
        isActive,
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

    const result = employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      name: emp.name,
      isActive: emp.isActive,
      department: emp.workInfo?.department?.name || null,
      position: emp.workInfo?.position?.name || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
