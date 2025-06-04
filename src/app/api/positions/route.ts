/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Hàm tính cấp bậc từ tên chức danh
function getLevelFromPositionName(name: string): number {
  const lower = name.toLowerCase();
  if (lower.includes("tổ trưởng")) return 2;
  if (lower.includes("trưởng phòng")) return 3;
  if (lower.includes("phó tổng giám đốc") || lower.includes("tổng giám đốc"))
    return 5;
  if (lower.includes("giám đốc")) return 4;
  return 1; // Mặc định nhân viên thường
}

export async function PATCH(req: NextRequest) {
  const posIdStr = req?.nextUrl?.searchParams.get("posId");
  const positionId = Number(posIdStr);

  if (isNaN(positionId)) {
    return NextResponse.json({ error: "Invalid position ID" }, { status: 400 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json(
      { error: "Position name required" },
      { status: 400 }
    );
  }

  const level = getLevelFromPositionName(name);

  try {
    const updated = await prisma.position.update({
      where: { id: positionId },
      data: { name, level },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const posIdStr = req?.nextUrl?.searchParams.get("posId");
  const positionId = Number(posIdStr);

  if (isNaN(positionId)) {
    return NextResponse.json({ error: "Invalid position ID" }, { status: 400 });
  }

  try {
    await prisma.position.delete({ where: { id: positionId } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
