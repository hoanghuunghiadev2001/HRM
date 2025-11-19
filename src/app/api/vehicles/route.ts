/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        plateNumber: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });

    return new Response(JSON.stringify({ vehicles }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }
    const body = await request.json();
    const { code, name, plateNumber } = body;

    if (!code || !name) {
      return new Response(
        JSON.stringify({ message: "Code and name are required" }),
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: { code, name, plateNumber },
    });

    return new Response(JSON.stringify({ vehicle }), { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({ message: "Duplicate code or plateNumber" }),
        { status: 400 }
      );
    }
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role === "USER") {
      return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
    }

    const body = await request.json();
    const { id, code, name, plateNumber } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ message: "Vehicle ID is required" }),
        { status: 400 }
      );
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { code, name, plateNumber },
    });

    return new Response(JSON.stringify({ vehicle: updatedVehicle }), {
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2025") {
      return new Response(JSON.stringify({ message: "Vehicle not found" }), {
        status: 404,
      });
    }
    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({ message: "Duplicate code or plateNumber" }),
        { status: 400 }
      );
    }
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user || user.role === "USER") {
      return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return new Response(
        JSON.stringify({ message: "Vehicle ID is required" }),
        { status: 400 }
      );
    }

    await prisma.vehicle.delete({ where: { id } });

    return new Response(
      JSON.stringify({ message: "Vehicle deleted successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2025") {
      return new Response(JSON.stringify({ message: "Vehicle not found" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
