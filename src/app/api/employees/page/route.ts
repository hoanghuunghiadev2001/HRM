// /app/api/employee/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function calculateSeniorityDetail(
  startDate: Date | null | undefined
): string | null {
  if (!startDate) return null;

  const today = new Date();
  const start = new Date(startDate);

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} năm ${months} tháng`;
}

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
    // Lấy token từ cookie (App Router lấy cookie thế này)
    const token = req.cookies.get("token")?.value;

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
            seniority: calculateSeniorityDetail(
              employee.workInfo?.seniorityStart
            ),
            seniorityStart: formatDate(employee.workInfo.seniorityStart),
            contractDate: formatDate(employee.workInfo.contractDate),
            contractEndDate: formatDate(employee.workInfo.contractEndDate),
          }
        : null,
      otherInfo: employee.otherInfo
        ? {
            ...employee.otherInfo,
            updatedAt: formatDate(employee.otherInfo?.updatedAt),
          }
        : null,
    };

    return NextResponse.json(formattedEmployee);
  } catch (error) {
    return NextResponse.json(
      { message: "Token không hợp lệ" + error },
      { status: 401 }
    );
  }
}
