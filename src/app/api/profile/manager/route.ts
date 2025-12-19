// /app/api/leave/my-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    // =====================
    // 1️⃣ Auth
    // =====================
    const token = req.cookies.get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const managerIds = new Set<number>();

    // =====================
    // 2️⃣ Lấy manager trực tiếp
    // =====================
    const employee = await prisma.employee.findUnique({
      where: { id: decoded.id },
      select: { managerId: true },
    });

    if (!employee?.managerId) {
      return NextResponse.json({ managerIds: [] });
    }

    const directManagerId = employee.managerId;

    // =====================
    // 3️⃣ Case đặc biệt: tự chọn chính mình
    // =====================
    if (directManagerId === decoded.id) {
      return NextResponse.json({
        managerIds: [decoded.id],
      });
    }

    // Thêm manager trực tiếp
    managerIds.add(directManagerId);

    // =====================
    // 4️⃣ Lấy manager cấp trên
    // =====================
    const manager = await prisma.employee.findUnique({
      where: { id: directManagerId },
      select: { managerId: true },
    });

    const upperManagerId = manager?.managerId;

    if (
      upperManagerId &&
      upperManagerId !== decoded.id &&
      upperManagerId !== directManagerId
    ) {
      managerIds.add(upperManagerId);
    }

    return NextResponse.json({
      managerIds: Array.from(managerIds),
    });
  } catch (error) {
    console.error("❌ Error fetching managers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
