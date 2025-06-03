import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  // Ví dụ pathname = /api/departments/8 => parts = ["", "api", "departments", "8"]

  // Lấy phần thứ 3 (index 3) là '8' trong ví dụ trên
  const idStr = parts[3];

  if (!idStr) {
    return NextResponse.json({ error: "ID not found in URL" }, { status: 400 });
  }

  const id = Number(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const department = await prisma.department.findUnique({
    where: { id },
    include: { positions: true },
  });

  if (!department) {
    return NextResponse.json(
      { error: "Department not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(department);
}

export async function PATCH(request: NextRequest) {
  const url = new URL(request.url);
  const idStr = url.pathname.split("/")[3];

  if (!idStr) {
    return NextResponse.json({ error: "ID not found in URL" }, { status: 400 });
  }

  const id = Number(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const { name, abbreviation } = body;

  if (!name && !abbreviation) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const updated = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(abbreviation && { abbreviation }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const idStr = url.pathname.split("/")[3];

  if (!idStr) {
    return NextResponse.json({ error: "ID not found in URL" }, { status: 400 });
  }

  const id = Number(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    await prisma.position.deleteMany({ where: { departmentId: id } });
    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
