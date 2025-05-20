// /app/api/leave/my-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Lấy token từ cookie
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

    // Giải mã token để lấy userId
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId: decoded.id,
      },
      include: {
        employee: {
          select: {
            name: true,
            employeeCode: true,
            avatar: true,
            workInfo: {
              select: {
                department: true,
                position: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(leaveRequests, { status: 200 });
  } catch (error) {
    console.error("Lỗi token hoặc truy vấn:", error);
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 }
    );
  }
}
