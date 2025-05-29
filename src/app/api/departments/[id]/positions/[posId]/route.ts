/* eslint-disable @typescript-eslint/no-unused-vars */
// Import các module cần thiết từ Next.js và Prisma
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Hàm PATCH: Cập nhật tên chức danh (position)
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string; posId: string } }
) {
  const { params } = context;
  const positionId = Number(params.posId); // Chuyển posId từ string sang number

  if (isNaN(positionId)) {
    return NextResponse.json({ error: "Invalid position ID" }, { status: 400 });
  }

  const body = await request.json();
  const name = body.name;

  if (!name) {
    return NextResponse.json(
      { error: "Position name is required" },
      { status: 400 }
    );
  }

  try {
    // Cập nhật tên chức danh trong database
    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: { name },
    });

    return NextResponse.json(updatedPosition);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// Hàm DELETE: Xóa chức danh (position) khỏi database
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string; posId: string } }
) {
  const { params } = context;
  const positionId = Number(params.posId);

  if (isNaN(positionId)) {
    return NextResponse.json({ error: "Invalid position ID" }, { status: 400 });
  }

  try {
    // Xóa chức danh theo ID
    await prisma.position.delete({
      where: { id: positionId },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
