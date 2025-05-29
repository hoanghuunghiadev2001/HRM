/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  const departmentId = Number(params.id);
  if (isNaN(departmentId))
    return NextResponse.json(
      { error: "Invalid department ID" },
      { status: 400 }
    );

  const positions = await prisma.position.findMany({
    where: { departmentId },
  });

  return NextResponse.json(positions);
}

export async function POST(request: Request, { params }: { params: Params }) {
  const departmentId = Number(params.id);
  if (isNaN(departmentId))
    return NextResponse.json(
      { error: "Invalid department ID" },
      { status: 400 }
    );

  const { name } = await request.json();

  if (!name) {
    return NextResponse.json(
      { error: "Position name required" },
      { status: 400 }
    );
  }

  try {
    const newPosition = await prisma.position.create({
      data: { name, departmentId },
    });
    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Create position failed" },
      { status: 500 }
    );
  }
}
