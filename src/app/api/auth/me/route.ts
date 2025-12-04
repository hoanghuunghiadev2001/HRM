// /api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await prisma.employee.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Blocked" }, { status: 403 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Lỗi API /user:", err);
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 }
    );
  }
}
