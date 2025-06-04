import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Hàm xác định cấp bậc từ tên chức danh
function getLevelFromPositionName(name: string): number {
  const lower = name.toLowerCase();
  if (lower.includes("tổ trưởng")) return 2;
  if (lower.includes("trưởng phòng")) return 3;
  if (lower.includes("phó tổng giám đốc") || lower.includes("tổng giám đốc"))
    return 5;
  if (lower.includes("giám đốc")) return 4;
  return 1; // Mặc định là nhân viên thường
}

// GET: Lấy danh sách chức danh theo phòng ban
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const departmentIdStr = url.pathname.split("/").at(-2);

  if (!departmentIdStr) {
    return NextResponse.json(
      { error: "Department ID not found in URL" },
      { status: 400 }
    );
  }

  const departmentId = Number(departmentIdStr);

  if (isNaN(departmentId)) {
    return NextResponse.json(
      { error: "Invalid department ID" },
      { status: 400 }
    );
  }

  try {
    const positions = await prisma.position.findMany({
      where: { departmentId },
    });

    return NextResponse.json(positions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Tạo chức danh mới trong phòng ban
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const departmentIdStr = url.pathname.split("/").at(-2);

  if (!departmentIdStr) {
    return NextResponse.json(
      { error: "Department ID not found in URL" },
      { status: 400 }
    );
  }

  const departmentId = Number(departmentIdStr);

  if (isNaN(departmentId)) {
    return NextResponse.json(
      { error: "Invalid department ID" },
      { status: 400 }
    );
  }

  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Position name required" },
        { status: 400 }
      );
    }

    const level = getLevelFromPositionName(name);

    const newPosition = await prisma.position.create({
      data: {
        name,
        level,
        departmentId,
      },
    });

    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    console.error("Create position failed:", error);
    return NextResponse.json(
      { error: "Create position failed" },
      { status: 500 }
    );
  }
}
