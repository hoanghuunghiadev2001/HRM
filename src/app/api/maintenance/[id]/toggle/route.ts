import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  const { isActive } = await req.json();

  const updated = await prisma.maintenanceNotice.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json(updated);
}
