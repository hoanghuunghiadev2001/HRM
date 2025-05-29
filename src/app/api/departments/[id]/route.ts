/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

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

export async function PATCH(request: Request, { params }: { params: Params }) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

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
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    // Có thể xóa các position trước hoặc dùng cascade nếu thiết lập
    await prisma.position.deleteMany({ where: { departmentId: id } });

    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
