/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tính level từ tên chức vụ nếu FE không gửi
function getLevelFromPositionName(name: string): number {
  const lower = name.toLowerCase();
  if (lower.includes("quản đốc")) return 2;
  if (lower.includes("tổ trưởng")) return 2;
  if (lower.includes("trưởng phòng")) return 3;
  if (lower.includes("phó tổng giám đốc") || lower.includes("tổng giám đốc"))
    return 5;
  if (lower.includes("giám đốc")) return 4;
  return 1;
}

export async function PATCH(req: NextRequest) {
  try {
    const posIdStr = req.nextUrl.searchParams.get("posId");
    const positionId = Number(posIdStr);

    if (isNaN(positionId)) {
      return NextResponse.json({ error: "Invalid position ID" }, { status: 400 });
    }

    const body = await req.json();

    // Chỉ lấy name và level
    const name: string = body.name;
    let level: number | undefined = body.level;

    if (!name) {
      return NextResponse.json({ error: "Position name required" }, { status: 400 });
    }

    // Ép kiểu level về number
    if (level !== undefined && level !== null) {
      level = Number(level);
      if (isNaN(level)) {
        return NextResponse.json({ error: "Level phải là số" }, { status: 400 });
      }
    } else {
      level = getLevelFromPositionName(name);
    }

    // Update position
    const updated = await prisma.position.update({
      where: { id: positionId },
      data: {
        name,
        level, // chắc chắn là number
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update position failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const posIdStr = req.nextUrl.searchParams.get("posId");
    const positionId = Number(posIdStr);

    if (isNaN(positionId)) {
      return NextResponse.json({ error: "Invalid position ID" }, { status: 400 });
    }

    await prisma.position.delete({ where: { id: positionId } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
