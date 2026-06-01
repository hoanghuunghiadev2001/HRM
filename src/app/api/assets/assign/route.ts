/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      role: string;
      id: number;
    };

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { assetId, employeeId, quantity, note } = body;

    // 📌 Tìm bản ghi cũ
    const existing = await prisma.assetAssignment.findFirst({
      where: { assetId, employeeId },
    });

    let record;

    if (existing) {
      if (quantity === 0) {
        // 🗑️ Nếu số lượng = 0 → XÓA tài sản đã cấp
        await prisma.assetAssignment.delete({
          where: { id: existing.id },
        });

        return NextResponse.json({
          success: true,
          deleted: true,
          message: "Đã thu hồi tài sản (quantity = 0)",
        });
      }

      // ✏️ Nếu số lượng > 0 → update như bình thường
      record = await prisma.assetAssignment.update({
        where: { id: existing.id },
        data: {
          quantity,
          note,
          issuedById: decoded.id,
        },
      });
    } else if (quantity > 0) {
      // ➕ Nếu không có → tạo mới
      record = await prisma.assetAssignment.create({
        data: {
          assetId,
          employeeId,
          issuedById: decoded.id,
          quantity,
          note,
        },
      });
    }

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
