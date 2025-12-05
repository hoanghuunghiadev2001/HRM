/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// ------------------------- CREATE -------------------------
export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

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
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    const asset = await prisma.asset.create({
      data: { name, description },
    });

    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ------------------------- GET ALL -------------------------
export async function GET() {
  const assets = await prisma.asset.findMany({
    include: { assignments: true },
  });
  return NextResponse.json({ success: true, assets });
}

// ------------------------- UPDATE (PUT) -------------------------
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Không có token" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "ADMIN")
      return NextResponse.json(
        { message: "Không có quyền truy cập" },
        { status: 403 }
      );

    const body = await req.json();
    const { id, name, description } = body;

    const asset = await prisma.asset.update({
      where: { id },
      data: { name, description },
    });

    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ------------------------- DELETE -------------------------
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Không có token" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "ADMIN")
      return NextResponse.json(
        { message: "Không có quyền truy cập" },
        { status: 403 }
      );

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu id" },
        { status: 400 }
      );
    }

    // Kiểm tra còn cấp phát không
    const countAssignments = await prisma.assetAssignment.count({
      where: { assetId: id },
    });

    if (countAssignments > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể xóa. Tài sản đang có người được cấp.",
        },
        { status: 400 }
      );
    }

    await prisma.asset.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Đã xóa tài sản" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
