import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        workInfo: {
          position: {
            level: {
              gte: 2, // từ Tổ trưởng trở lên
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        workInfo: {
          select: {
            position: {
              select: {
                name: true,
                level: true,
              },
            },
          },
        },
        contactInfo: {
          select: { email: true },
        },
      },
    });

    const formatted = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      avatar: emp.avatar,
      email: emp.contactInfo?.email ?? null,
      position: emp.workInfo?.position?.name ?? null,
      level: emp.workInfo?.position?.level ?? null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}
