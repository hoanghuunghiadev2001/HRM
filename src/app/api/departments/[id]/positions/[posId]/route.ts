/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Định nghĩa kiểu RouteContext để đảm bảo tính chính xác
interface RouteContext {
  params: {
    id: string;
    posId: string;
  };
}

// PATCH: Cập nhật tên position
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { params } = context;
  const departmentId = Number(params.id);
  const positionId = Number(params.posId);

  if (isNaN(departmentId) || isNaN(positionId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { name } = await request.json();
  if (!name) {
    return NextResponse.json(
      { error: "Position name required" },
      { status: 400 }
    );
  }

  try {
    // Kiểm tra position có thuộc về department không
    const existingPosition = await prisma.position.findFirst({
      where: { id: positionId, departmentId: departmentId },
    });

    if (!existingPosition) {
      return NextResponse.json(
        { error: "Position does not belong to the department" },
        { status: 404 }
      );
    }

    // Tiến hành cập nhật
    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: { name },
    });

    return NextResponse.json(updatedPosition);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE: Xóa position
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { params } = context;
  const departmentId = Number(params.id);
  const positionId = Number(params.posId);

  if (isNaN(departmentId) || isNaN(positionId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    // Kiểm tra position có thuộc về department không
    const existingPosition = await prisma.position.findFirst({
      where: { id: positionId, departmentId: departmentId },
    });

    if (!existingPosition) {
      return NextResponse.json(
        { error: "Position does not belong to the department" },
        { status: 404 }
      );
    }

    // Tiến hành xóa
    await prisma.position.delete({
      where: { id: positionId },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
