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

    // Lấy thông tin cơ bản
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    // Signers & Approvers
    const signerIds = JSON.parse(formData.get("signerIds") as string);
    const approverIds = JSON.parse(formData.get("approverIds") as string);

    // Loại proposal & vehicle
    const rawProposalType = formData.get("proposalType") as string | null;
    const proposalType: "REGULAR" | "VEHICLE" | undefined =
      rawProposalType === "REGULAR" || rawProposalType === "VEHICLE"
        ? rawProposalType
        : "REGULAR"; // "REGULAR" | "VEHICLE"
    const vehicleId = formData.get("vehicleId")
      ? Number(formData.get("vehicleId"))
      : undefined;
    const startAt = formData.get("startAt")
      ? new Date(formData.get("startAt") as string)
      : undefined;
    const endAt = formData.get("endAt")
      ? new Date(formData.get("endAt") as string)
      : undefined;
    const dropoffPlace =
      (formData.get("dropoffPlace") as string | null) ?? undefined;

    const file = formData.get("file") as File | null;

    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Thiếu token xác thực" },
        { status: 401 }
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
        { status: 401 }
      );
    }

    // Validate required fields
    if (!name || !title) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    if (!signerIds || signerIds.length === 0) {
      return NextResponse.json(
        { error: "Phải có ít nhất một người đồng ý" },
        { status: 400 }
      );
    }

    if (!approverIds || approverIds.length === 0) {
      return NextResponse.json(
        { error: "Phải có ít nhất một người phê duyệt" },
        { status: 400 }
      );
    }

    // Nếu là proposal xe, cần vehicleId, startAt, endAt
    if (proposalType === "VEHICLE") {
      if (!vehicleId || !startAt || !endAt) {
        return NextResponse.json(
          { error: "Proposal xe phải có vehicleId, startAt và endAt" },
          { status: 400 }
        );
      }
    }

    // Tạo proposal data
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
    };

    const createdById = employeeId;

    const result = await ProposalService.createProposal(
      proposalData,
      file,
      createdById
    );

    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Thiếu token xác thực" },
        { status: 401 }
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
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID đề xuất" }, { status: 400 });
    }

    const proposalId = Number(id);
    if (isNaN(proposalId)) {
      return NextResponse.json(
        { error: "ID đề xuất không hợp lệ" },
        { status: 400 }
      );
    }

    const result = await ProposalService.getProposal(
      proposalId,
      String(employeeId)
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
