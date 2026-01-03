/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { AttendanceLogicService } from "@/services/attendance-logic.service";

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra Authorization (API Secret)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.JWT_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Thanh toán phải là JSON" },
        { status: 400 }
      );
    }
    const { logs } = await req.json();

    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // 2. Đưa vào Service xử lý logic
    await AttendanceLogicService.processMachineLogs(logs);

    return NextResponse.json({
      success: true,
      message: "Attendance synced successfully",
    });
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
