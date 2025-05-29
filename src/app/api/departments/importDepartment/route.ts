/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
