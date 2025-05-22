import { NextRequest, NextResponse } from "next/server";
import { handleAttendance } from "@/lib/attendanceHandler";

export async function POST(req: NextRequest) {
  try {
    const { employeeCode, timeScan } = await req.json();
    const result = await handleAttendance(employeeCode, timeScan);
    return NextResponse.json(result.json, { status: result.status });
  } catch (error) {
    console.error("Error checkin/out:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
