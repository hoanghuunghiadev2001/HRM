/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

type Brand = "TBD" | "TMP";
const parseBrand = (v: unknown): Brand => (v === "TMP" ? "TMP" : "TBD");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const week = searchParams.get("week")
      ? Number(searchParams.get("week"))
      : dayjs().week();
    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : dayjs().year();
    const brand = parseBrand(searchParams.get("brand"));

    const menu = await prisma.lunchMenu.findMany({
      where: { weekNumber: week, year, brand },
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

    const nextWeekDate = dayjs().add(1, "week");
    const nextWeekNumber = nextWeekDate.week();
    const nextWeekYear = nextWeekDate.year();

    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

    // trong POST
    if (!str(body.dayOfWeek)) {
      return NextResponse.json(
        { error: "Thiếu ngày trong tuần" },
        { status: 400 },
      );
    }

    const newItem = await prisma.lunchMenu.create({
      data: {
        dayOfWeek: str(body.dayOfWeek),
        salty: str(body.salty),
        salty2: str(body.salty2), // ⭐
        vegetarian: str(body.vegetarian),
        stir: str(body.stir),
        soup: str(body.soup),
        dessert: str(body.dessert),
        weekNumber: body.weekNumber ?? nextWeekNumber,
        year: body.year ?? nextWeekYear,
        brand: parseBrand(body.brand),
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Lỗi POST:", error);
    return NextResponse.json({ error: "Lỗi tạo thực đơn" }, { status: 400 });
  }
}
