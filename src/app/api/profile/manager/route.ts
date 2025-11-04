/* eslint-disable @typescript-eslint/no-unused-vars */
// /app/api/leave/my-requests/route.ts

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { sendEmail } from "@/lib/mail";

dayjs.extend(utc);
dayjs.extend(timezone);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET: Lấy danh sách đơn nghỉ phép của chính user
// GET: Lấy danh sách đơn nghỉ phép của chính user
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((c) => c.trim().split("="))
        .map(([k, v]) => [k, decodeURIComponent(v)])
    );
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const employee = await prisma.employee.findUnique({
      where: { id: Number(decoded.id) },
      select: { managerId: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ managerId: employee.managerId });
  } catch (error) {
    console.error("❌ Error fetching managerId:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
