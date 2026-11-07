/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EDITABLE_FIELDS = [
  "dayOfWeek",
  "salty",
  "salty2",
  "vegetarian",
  "stir",
  "soup",
  "dessert",
  "weekNumber",
  "year",
  "isActive",
] as const;

// PATCH: Cập nhật món ăn theo ID
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = parseInt((await params).id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();

    const data: Record<string, unknown> = {};
    for (const key of EDITABLE_FIELDS) {
      if (body[key] !== undefined) data[key] = body[key];
    }

    // ⭐ brand chỉ nhận TBD | TMP
    if (body.brand !== undefined) {
      if (body.brand !== "TBD" && body.brand !== "TMP") {
        return NextResponse.json(
          { error: "Chi nhánh không hợp lệ" },
          { status: 400 },
        );
      }
      data.brand = body.brand;
    }

    const updated = await prisma.lunchMenu.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 400 });
  }
}

// DELETE giữ nguyên
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
