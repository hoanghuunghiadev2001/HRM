/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: { id: number } }
) {
  const { params } = context;
  const resolvedParams = await params; // await params trước
  const id = resolvedParams.id;

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    // Xóa KPIEmployee theo id
    await prisma.kPIEmployee.delete({
      where: { id },
    });
    return NextResponse.json(
      { message: "Deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Delete failed or not found" },
      { status: 404 }
    );
  }
}
export async function PUT(
  request: Request,
  context: { params: { id: number } }
) {
  const { params } = context;
  const resolvedParams = await params; // await params trước
  const id = resolvedParams.id;
  const data = await request.json();

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const updated = await prisma.kPIEmployee.update({
      where: { id },
      data: {
        kpiId: data.kpiId,
        employeeId: data.employeeId,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Update failed or not found" },
      { status: 404 }
    );
  }
}
