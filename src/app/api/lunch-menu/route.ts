/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Mặc định lấy tuần hiện tại
    const week = searchParams.get("week")
      ? Number(searchParams.get("week"))
      : dayjs().week();
    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : dayjs().year();

    const menu = await prisma.lunchMenu.findMany({
      where: { weekNumber: week, year: year },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(menu);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

// POST: Tạo thực đơn cho TUẦN SAU
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- LOGIC TÍNH TUẦN SAU ---
    // Lấy thời điểm hiện tại + 1 tuần
    const nextWeekDate = dayjs().add(1, "week");
    const nextWeekNumber = nextWeekDate.week();
    const nextWeekYear = nextWeekDate.year();

    const newItem = await prisma.lunchMenu.create({
      data: {
        dayOfWeek: body.dayOfWeek,
        salty: body.salty,
        vegetarian: body.vegetarian,
        stir: body.stir,
        soup: body.soup,
        dessert: body.dessert,
        // Ưu tiên weekNumber từ body nếu có, nếu không thì dùng tuần sau
        weekNumber: body.weekNumber ?? nextWeekNumber,
        year: body.year ?? nextWeekYear,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Lỗi POST:", error);
    return NextResponse.json({ error: "Lỗi tạo thực đơn" }, { status: 400 });
  }
}
