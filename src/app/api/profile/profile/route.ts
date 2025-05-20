// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Hàm định dạng ngày từ Date sang chuỗi dd/mm/yyyy
function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = req.cookies;
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const employee = await prisma.employee.findUnique({
      where: { id: decoded.id },
      include: {
        personalInfo: true,
        contactInfo: true,
        workInfo: true,
        otherInfo: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Không tìm thấy nhân viên" },
        { status: 404 }
      );
    }

    const formattedEmployee = {
      ...employee,
      birthDate: formatDate(employee.birthDate),
      personalInfo: {
        ...employee.personalInfo,
        issueDate: formatDate(employee.personalInfo?.issueDate),
      },
      workInfo: employee.workInfo
        ? {
            ...employee.workInfo,
            joinedTBD: formatDate(employee.workInfo.joinedTBD),
            joinedTeSCC: formatDate(employee.workInfo.joinedTeSCC),
            seniorityStart: formatDate(employee.workInfo.seniorityStart),
            contractDate: formatDate(employee.workInfo.contractDate),
            contractEndDate: formatDate(employee.workInfo.contractEndDate),
          }
        : null,
    };

    return NextResponse.json(formattedEmployee);
  } catch (error) {
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 }
    );
  }
}
