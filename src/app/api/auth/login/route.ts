import "server-only";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

// 🔹 PRE-FLIGHT (bắt buộc cho mobile)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeCode, password, remember } = body;

    if (!employeeCode || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
      include: { workInfo: { include: { department: true, position: true } } },
    });

    if (
      !employee ||
      !employee.password ||
      !(await bcrypt.compare(password, employee.password))
    ) {
      return NextResponse.json(
        { message: "Tài khoản không chính xác" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    if (!employee.isActive) {
      return NextResponse.json(
        {
          message: "Tài khoản chưa được kích hoạt. Vui lòng liên hệ quản trị.",
        },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const payload = {
      id: employee.id,
      employeeCode: employee.employeeCode,
      role: employee.role,
      departmentId: employee.workInfo?.departmentId || null,
      isActive: employee.isActive,
    };

    const expiresIn = remember ? "7d" : "1d";
    const maxAge = remember ? 604800 : 86400;

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    (await cookies()).set("token-hrm", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        name: employee.name,
        avt: employee.avatar,
        role: employee.role,
        id: employee.id,
        employeeCode: employee.employeeCode,
        department: employee.workInfo?.department?.name,
        position: employee.workInfo?.position?.name,
        departmentID: employee.workInfo?.departmentId,
        token,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Không thể kết nối server" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
