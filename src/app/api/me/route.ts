import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    // Lấy cookie token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Giải mã token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Tìm user theo id
    const user = await prisma.employee.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        avatar: true,
        employeeCode: true,
        role: true,
        workInfo: {
          select: {
            department: true,
            position: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
