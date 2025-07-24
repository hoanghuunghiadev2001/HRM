// app/api/proposals/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProposalService } from "@/lib/proposal-service";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest,  { params }: { params: Promise<{ id: number }> }) {
  try {
    // 1. Validate proposal ID
    const proposalId = (await params).id;
    if (isNaN(proposalId)) {
      return NextResponse.json({ error: "ID đề xuất không hợp lệ" }, { status: 400 });
    }

    // 2. Lấy và kiểm tra token từ header Authorization

        const token = request.cookies.get("token")?.value;
        console.log("Token from cookie:", token);
    
        if (!token) {
          return NextResponse.json({ error: "Thiếu token xác thực" }, { status: 401 });
        }
    
        let employeeId: number;
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
          employeeId = decoded.id;
          console.log("Employee ID from token:", employeeId);
        } catch (err) {
          console.error("Token verification error:", err);
          return NextResponse.json({ error: "Token không hợp lệ hoặc đã hết hạn" }, { status: 401 });
        }

    // 3. Parse body
    const body = await request.json();
    const { status } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Trạng thái phê duyệt không hợp lệ" }, { status: 400 });
    }

    // 4. Gọi service để xử lý logic phê duyệt
    const result = await ProposalService.approveProposal(proposalId, employeeId, status);

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.error || "Phê duyệt thất bại" }, { status: 500 });
    }
  } catch (error) {
    console.error("Lỗi server trong approveProposal API:", error);
    return NextResponse.json({ error: "Lỗi server nội bộ" }, { status: 500 });
  }
}
