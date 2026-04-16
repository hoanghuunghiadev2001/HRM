/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";
import { ProposalReminderService } from "@/services/proposal-reminder-service"; // Kiểm tra lại đường dẫn này
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Lấy ID từ URL (đợi params vì là Promise trong Next.js mới)
    const proposalId = Number.parseInt((await params).id);

    // 2. Lấy token từ cookies giống hệt file Approve
    const token = request.cookies.get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Thiếu token xác thực" },
        { status: 401 },
      );
    }

    // 3. Giải mã token để lấy ID người dùng (callerId)
    let callerId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      callerId = decoded.id;
    } catch (err) {
      console.error("Token verification error:", err);
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 },
      );
    }

    // 4. Gọi Service xử lý logic nhắc nhở
    const result = await ProposalReminderService.remindPendingActors(
      proposalId,
      callerId,
    );

    // 5. Trả về kết quả
    if (result.success) {
      return NextResponse.json({
        message: result.message,
        remindedTo: result.remindedTo,
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 },
      );
    }
  } catch (error) {
    console.error("API Remind Error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
