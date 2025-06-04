/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function getLevelFromPositionName(name: string): number {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("tổ trưởng")) return 2;
  if (lowerName.includes("trưởng phòng")) return 3;
  if (
    lowerName.includes("phó tổng giám đốc") ||
    lowerName.includes("tổng giám đốc")
  )
    return 5;
  if (lowerName.includes("giám đốc")) return 4;
  return 1; // mặc định nhân viên thường
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { departments } = body;

    const createdDepartments = await Promise.all(
      departments.map(async (dept: any) => {
        return prisma.department.create({
          data: {
            name: dept.name,
            abbreviation: dept.abbreviation,
            positions: {
              create: dept.positions.map((pos: any) => ({
                name: pos.name,
                level: getLevelFromPositionName(pos.name),
              })),
            },
          },
          include: { positions: true },
        });
      })
    );

    return NextResponse.json({ data: createdDepartments }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Lỗi khi tạo phòng ban" },
      { status: 500 }
    );
  }
}
