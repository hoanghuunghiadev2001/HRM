import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const departments = await prisma.department.findMany({
    include: {
      positions: true,
    },
  });
  return NextResponse.json(departments);
}

export async function POST(request: Request) {
  const { name, abbreviation } = await request.json();

  if (!name || !abbreviation) {
    return NextResponse.json(
      { error: "Name and abbreviation are required" },
      { status: 400 }
    );
  }

  const newDepartment = await prisma.department.create({
    data: { name, abbreviation },
  });

  return NextResponse.json(newDepartment, { status: 201 });
}
