// app/api/kpi/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: number } }
) {
  const { params } = context;
  const resolvedParams = await params; // await params trước
  const id = resolvedParams.id;
  const kpi = await prisma.kPI.findUnique({
    where: { id },
    include: {
      kpiEmployees: {
        include: {
          entries: true,
          employee: true,
        },
      },
    },
  });
  if (!kpi)
    return NextResponse.json({ error: "KPI not found" }, { status: 404 });
  return NextResponse.json(kpi);
}

export async function PUT(
  request: Request,
  context: { params: { id: number } }
) {
  const { params } = context;
  const resolvedParams = await params; // await params trước
  const id = resolvedParams.id;
  const data = await request.json();
  /*
  data có thể gồm: { name, period }
  */
  const updatedKPI = await prisma.kPI.update({
    where: { id },
    data,
  });
  return NextResponse.json(updatedKPI);
}

export async function DELETE(
  request: Request,
  context: { params: { id: number } }
) {
  const { params } = context;
  const resolvedParams = await params; // await params trước
  const id = resolvedParams.id;
  await prisma.kPI.delete({ where: { id } });
  return NextResponse.json({ message: "KPI deleted" });
}
