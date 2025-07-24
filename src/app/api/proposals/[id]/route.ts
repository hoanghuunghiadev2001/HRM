import { ProposalService } from "@/lib/proposal-service"
import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

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

    const name = formData.get("name") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const proposerId = Number.parseInt(formData.get("proposerId") as string)
    const signerIds = JSON.parse(formData.get("signerIds") as string)
    const approverIds = JSON.parse(formData.get("approverIds") as string)
    const file = formData.get("file") as File | null

    // Validate required fields
    if (!name || !title || !proposerId || !signerIds || !approverIds) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 })
    }

    if (signerIds.length === 0) {
      return NextResponse.json({ error: "Phải có ít nhất một người đồng ý" }, { status: 400 })
    }

    if (approverIds.length === 0) {
      return NextResponse.json({ error: "Phải có ít nhất một người phê duyệt" }, { status: 400 })
    }

    // Tạo proposal data
    const proposalData = {
      name,
      title,
      description,
      proposerId: employeeId, // Sử dụng employeeId từ token
      signerIds,
      approverIds,
    }

    const createdById = employeeId // Tạm thời dùng proposerId

    const result = await ProposalService.createProposal(proposalData, file, createdById)

    if (result.success) {
      return NextResponse.json(result.data, { status: 201 })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

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

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID đề xuất" }, { status: 400 })
    }

    const proposalId = Number.parseInt(id)

    if (isNaN(proposalId)) {
      return NextResponse.json({ error: "ID đề xuất không hợp lệ" }, { status: 400 })
    }

    const result = await ProposalService.getProposal(proposalId, employeeId)

    if (result.success) {
      return NextResponse.json(result.data)
    } else {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
