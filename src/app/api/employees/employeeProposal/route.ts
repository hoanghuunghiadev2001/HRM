import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true, // ID của nhân viên
        name: true,
        avatar: true,
        workInfo: {
          select: {
            position: {
              select: {
                name: true, // Tên chức vụ
              },
            },
          },
        },
        contactInfo: {
          select: {
            email: true, // Email
          },
        },
      },
    });

    // Flatten dữ liệu để dễ xử lý ở FE
    const formatted = employees.map(emp => ({
        id: emp.id,
      name: emp.name,
      avatar: emp.avatar,
      email: emp.contactInfo?.email ?? null,
      position: emp.workInfo?.position?.name ?? null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}
