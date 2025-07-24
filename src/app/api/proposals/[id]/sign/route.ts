/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/proposals/[id]/approve/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { ProposalService } from "@/lib/proposal-service";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest,  { params }: { params: Promise<{ id: string }> }) {
  try {
    const proposalId = Number.parseInt((await params).id);
    const body = await request.json();
    const { status } = body;

    console.log("Proposal ID:", proposalId);
    console.log("Status:", status);

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
    }

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

    const result = await ProposalService.signProposal(proposalId, employeeId, status);

    console.log("ProposalService result:", result);

    if (result.success) {
      return NextResponse.json({ message: result.message });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error); // 🛑 Đây là lỗi quan trọng
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

