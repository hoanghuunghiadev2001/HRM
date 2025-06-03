/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const feature = req?.nextUrl?.searchParams.get("posId");

  const positionId = Number(feature);
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

  try {
    const updated = await prisma.position.update({
      where: { id: positionId },
      data: { name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const feature = req?.nextUrl?.searchParams.get("posId");

  const positionId = Number(feature);
  if (isNaN(positionId)) {
    return NextResponse.json({ error: "Invalid position ID" }, { status: 400 });
  }

  try {
    await prisma.position.delete({ where: { id: positionId } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
