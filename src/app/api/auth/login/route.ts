// app/api/auth/login/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeCode, password, remember } = body;

    if (!employeeCode || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
    });

    if (
      !employee ||
      !employee.password ||
      !(await bcrypt.compare(password, employee.password))
    ) {
      return NextResponse.json(
        { message: "Tài khoản không chính xác" },
        { status: 401 }
      );
    }

    if (!employee.isActive) {
      // Trả về lỗi nếu chưa kích hoạt
      return NextResponse.json(
        {
          message: "Tài khoản chưa được kích hoạt. Vui lòng liên hệ quản trị.",
        },
        { status: 403 }
      );
    }

    const payload = {
      id: employee.id,
      employeeCode: employee.employeeCode,
      role: employee.role,
    };

    const expiresIn = remember ? "7d" : "1d";
    const maxAge = remember ? 7 * 24 * 60 * 60 : 24 * 60 * 60;

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    // ✅ Ghi token vào cookie
    (
      await // ✅ Ghi token vào cookie
      cookies()
    ).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Không thể kết nối server" },
      { status: 500 }
    );
  }
}
