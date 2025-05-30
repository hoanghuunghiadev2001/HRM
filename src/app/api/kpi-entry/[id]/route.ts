// app/api/kpi-entry/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: number } }
) {
  const { params } = context;
  const resolvedParams = await params; // await params trước
  const id = resolvedParams.id;
  const entry = await prisma.kPIEntry.findUnique({ where: { id } });
  if (!entry)
    return NextResponse.json({ error: "KPI Entry not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PUT(
  request: Request,
  context: { params: { id: number } }
) {
  const { params } = context;
  const resolvedParams = await params; // await params trước
  const id = resolvedParams.id;
  const data = await request.json();
  const updated = await prisma.kPIEntry.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  context: { params: { id: number } }
) {
  const { params } = context;
  const resolvedParams = await params; // await params trước
  const id = resolvedParams.id;
  await prisma.kPIEntry.delete({ where: { id } });
  return NextResponse.json({ message: "KPI Entry deleted" });
}
