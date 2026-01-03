/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/lunch-menu/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Nếu không có param trên URL, tự động lấy tuần/năm hiện tại
    const week = searchParams.get("week")
      ? Number(searchParams.get("week"))
      : dayjs().week();
    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : dayjs().year();

    const menu = await prisma.lunchMenu.findMany({
      where: {
        weekNumber: week,
        year: year,
      },
      // Sắp xếp theo ID hoặc bạn có thể thêm trường order để Thứ 2 luôn trên cùng
      orderBy: { id: "asc" },
    });

    return NextResponse.json(menu);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

// POST: Thêm một ngày vào thực đơn
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = await prisma.lunchMenu.create({
      data: {
        dayOfWeek: body.dayOfWeek,
        salty: body.salty,
        vegetarian: body.vegetarian,
        stir: body.stir,
        soup: body.soup,
        dessert: body.dessert,
        weekNumber: body.weekNumber,
        year: body.year,
      },
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tạo thực đơn" }, { status: 400 });
  }
}
