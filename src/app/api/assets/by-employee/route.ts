/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/assets/by-employee/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

type DecodedToken = {
  role: string;
  id: number;
};

function formatDate(d?: Date | string | null) {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString(); // frontend dễ convert/format tiếp
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let employeeId = Number(searchParams.get("employeeId"));

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Không có token" },
        { status: 401 }
      );
    }

    // decode token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Token không hợp lệ" },
        { status: 401 }
      );
    }

    // Nếu user không phải ADMIN -> chỉ xem chính mình
    if (decoded.role !== "ADMIN") {
      employeeId = decoded.id;
    } else {
      // Nếu là ADMIN, employeeId phải hợp lệ (tránh trả toàn bộ khi query rỗng)
      if (!employeeId || Number.isNaN(employeeId)) {
        return NextResponse.json(
          {
            success: false,
            message: "ADMIN phải cung cấp employeeId hợp lệ (query param)",
          },
          { status: 400 }
        );
      }
    }

    // Lấy danh sách tài sản kèm thông tin người cấp (issuedBy) và thông tin asset
    const rows = await prisma.assetAssignment.findMany({
      where: { employeeId },
      include: {
        asset: true,
        // lấy thông tin người cấp (issuedBy). Không lấy password hay trường nhạy cảm.
        issuedBy: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
            role: true,
            avatar: true,
            isActive: true,
            // nếu muốn thêm email / contact, bỏ comment dưới (nếu có field email trong model)
            // contactInfo: { select: { email: true, phoneNumber: true } }
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    // Chuẩn hoá response cho frontend: chỉ những trường cần thiết, format ngày
    const assets = rows.map((r) => ({
      id: r.id,
      assetId: r.assetId,
      asset: r.asset
        ? {
            id: r.asset.id,
            name: r.asset.name,
            description: r.asset.description ?? null,
            unit: r.asset.unit,
            createdAt: formatDate(r.asset.createdAt),
            updatedAt: formatDate(r.asset.updatedAt),
          }
        : null,
      quantity: r.quantity,

      note: r.note ?? null,
      issuedAt: formatDate(r.issuedAt),
      issuedBy: r.issuedBy
        ? {
            id: r.issuedBy.id,
            employeeCode: r.issuedBy.employeeCode,
            name: r.issuedBy.name,
            role: r.issuedBy.role,
            avatar: r.issuedBy.avatar ?? null,
            isActive: r.issuedBy.isActive,
          }
        : null,
    }));

    return NextResponse.json(
      { success: true, employeeId, assets },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/assets/by-employee error:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
