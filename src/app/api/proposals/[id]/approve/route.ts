// app/api/proposals/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProposalService } from "@/lib/proposal-service";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1️⃣ Validate proposal ID
    const proposalId = Number((await params).id);
    if (isNaN(proposalId)) {
      return NextResponse.json(
        { error: "ID đề xuất không hợp lệ" },
        { status: 400 }
      );
    }

    // 2️⃣ Lấy token từ cookie
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Thiếu token xác thực" },
        { status: 401 }
      );
    }

    // 3️⃣ Giải mã token
    let employeeId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      employeeId = decoded.id;
    } catch (err) {
      console.error("Token verification error:", err);
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      );
    }

    // 4️⃣ Parse body
    const body = await request.json();
    const { status, reason } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái phê duyệt không hợp lệ" },
        { status: 400 }
      );
    }

    // 5️⃣ Gọi service xử lý
    const result = await ProposalService.approveProposal(
      proposalId,
      employeeId,
      status,
      reason
    );

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: result.error || "Phê duyệt thất bại" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Lỗi server trong approveProposal API:", error);
    return NextResponse.json({ error: "Lỗi server nội bộ" }, { status: 500 });
  }
}
