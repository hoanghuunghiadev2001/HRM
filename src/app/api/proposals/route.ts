/* eslint-disable @typescript-eslint/no-unused-vars */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { ProposalService } from "../../../lib/proposal-service";
import jwt from "jsonwebtoken";
import { CreateProposalFormData } from "@/components/api";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 1. Lấy thông tin cơ bản (Khớp với Frontend gửi lên)
    const name = formData.get("name") as string;
    // Nếu frontend gửi 'name' mà logic cũ dùng 'title', ta lấy name làm title
    const title = (formData.get("title") as string) || name;
    const description = (formData.get("description") as string) || "";
    // Thêm vào sau phần lấy dropoffPlace
    const customerName = formData.get("customerName") as string | null;
    const roNumber = formData.get("roNumber") as string | null;
    const vehicleKm = formData.get("vehicleKm")
      ? Number(formData.get("vehicleKm"))
      : null;
    const vehicleAmount = formData.get("vehicleAmount")
      ? Number(formData.get("vehicleAmount"))
      : null;
    // 2. Parse Signers & Approvers
    const signerIds = JSON.parse((formData.get("signerIds") as string) || "[]");
    const approverIds = JSON.parse(
      (formData.get("approverIds") as string) || "[]",
    );

    // 3. Xử lý loại Proposal & Thông tin xe
    const rawProposalType = formData.get("proposalType") as string | null;

    // Chấp nhận cả 3 loại
    const proposalType =
      rawProposalType === "VEHICLE" || rawProposalType === "VEHICLE_GRAB"
        ? rawProposalType
        : "REGULAR";

    const vehicleId = formData.get("vehicleId")
      ? Number(formData.get("vehicleId"))
      : undefined;
    const startAt = formData.get("startAt")
      ? new Date(formData.get("startAt") as string)
      : undefined;
    const endAt = formData.get("endAt")
      ? new Date(formData.get("endAt") as string)
      : undefined;
    const pickupPlace =
      (formData.get("pickupPlace") as string | null) ?? undefined;
    const dropoffPlace =
      (formData.get("dropoffPlace") as string | null) ?? undefined;

    // 4. XỬ LÝ ĐA FILE (Quan trọng)
    // Frontend dùng formData.append("files", ...), nên ta dùng getAll
    const files = formData.getAll("files") as File[];
    // 5. Xác thực User từ Token
    const token = request.cookies.get("token-hrm")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Thiếu token xác thực" },
        { status: 401 },
      );
    }

    let employeeId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      employeeId = decoded.id;
    } catch (err) {
      return NextResponse.json(
        { error: "Token không hợp lệ" },
        { status: 401 },
      );
    }

    // 6. Validation
    if (!name || !title) {
      return NextResponse.json(
        { error: "Thiếu tiêu đề đề xuất" },
        { status: 400 },
      );
    }

    if (signerIds.length === 0 || approverIds.length === 0) {
      return NextResponse.json(
        { error: "Thiếu người duyệt hoặc người phê duyệt" },
        { status: 400 },
      );
    }

    if (proposalType === "VEHICLE" && (!vehicleId || !startAt || !endAt)) {
      return NextResponse.json(
        { error: "Thiếu thông tin lịch trình xe" },
        { status: 400 },
      );
    }

    // Sửa lại đoạn số 6: Validation
    if (proposalType === "VEHICLE" && (!vehicleId || !startAt || !endAt)) {
      return NextResponse.json(
        { error: "Thiếu thông tin lịch trình xe" },
        { status: 400 },
      );
    }

    if (proposalType === "VEHICLE_GRAB" && (!customerName || !roNumber)) {
      return NextResponse.json(
        { error: "Thiếu thông tin khách hàng hoặc mã RO" },
        { status: 400 },
      );
    }

    // 7. Gọi Service để lưu DB
    // Lưu ý: Bạn cần cập nhật ProposalService.createProposal để nhận mảng files[]
    // thay vì 1 file đơn lẻ nếu muốn lưu nhiều tài liệu.
    const proposalData: CreateProposalFormData = {
      name,
      title,
      description,
      proposerId: employeeId,
      signerIds,
      approverIds,
      proposalType,
      vehicleId,
      startAt,
      endAt,
      dropoffPlace,
      customerName: customerName ?? undefined,
      roNumber: roNumber ?? undefined,
      vehicleKm: vehicleKm ?? undefined,
      vehicleAmount: vehicleAmount ?? undefined,
      pickupPlace: pickupPlace ?? undefined,
    };

    // Nếu Service của bạn chưa hỗ trợ mảng, hãy lấy file đầu tiên: files[0]

    const result = await ProposalService.createProposal(
      proposalData,
      files, // Truyền cả mảng file xuống service
      employeeId,
    );

    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Lỗi server nội bộ" }, { status: 500 });
  }
}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const token = request.cookies.get("token-hrm")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Thiếu token xác thực" },
        { status: 401 },
      );
    }

    let employeeId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      employeeId = decoded.id;
    } catch (err) {
      console.error("Token verification error:", err);
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 },
      );
    }

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID đề xuất" }, { status: 400 });
    }

    const proposalId = Number(id);
    if (isNaN(proposalId)) {
      return NextResponse.json(
        { error: "ID đề xuất không hợp lệ" },
        { status: 400 },
      );
    }

    const result = await ProposalService.getProposal(
      proposalId,
      String(employeeId),
    );

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
