/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
  posId: string;
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const positionId = Number(params.posId);
  if (isNaN(positionId))
    return NextResponse.json({ error: "Invalid position ID" }, { status: 400 });

  const { name } = await request.json();
  if (!name) {
    return NextResponse.json(
      { error: "Position name required" },
      { status: 400 }
    );
  }

  try {
    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: { name },
    });
    return NextResponse.json(updatedPosition);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const positionId = Number(params.posId);
  if (isNaN(positionId))
    return NextResponse.json({ error: "Invalid position ID" }, { status: 400 });

  try {
    await prisma.position.delete({ where: { id: positionId } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
