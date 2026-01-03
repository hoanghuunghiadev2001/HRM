/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Cập nhật món ăn theo ID
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    const body = await request.json();

    const updated = await prisma.lunchMenu.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 400 });
  }
}

// DELETE: Xóa món ăn
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    await prisma.lunchMenu.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Đã xóa thành công" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khi xóa" }, { status: 400 });
  }
}
