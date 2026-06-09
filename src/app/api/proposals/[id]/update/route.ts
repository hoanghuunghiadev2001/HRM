import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

interface UpdateProposalBody {
  // ADMIN only
  vehicleId?: number;
  startAt?: string;
  endAt?: string;
  // GSM editors (id 201, 317, 318)
  vehicleAmount?: number;
  vehicleKm?: number;
}

const GSM_EDITOR_IDS = [201, 317, 318];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const proposalId = Number((await params).id);

  const cookieStore = cookies();
  const token = (await cookieStore).get("token-hrm")?.value;

  if (!token) {
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 },
    );
  }

  const isAdmin = user.role === "ADMIN";
  const isGsmEditor = GSM_EDITOR_IDS.includes(Number(user.id));

  if (!isAdmin && !isGsmEditor) {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  if (isNaN(proposalId)) {
    return NextResponse.json(
      { error: "ID đề xuất không hợp lệ" },
      { status: 400 },
    );
  }

  const body: UpdateProposalBody = await req.json();

  // Kiểm tra GSM editor không được đụng vào field của ADMIN
  if (!isAdmin && (body.vehicleId || body.startAt || body.endAt)) {
    return NextResponse.json(
      { message: "Không có quyền chỉnh sửa thông tin này" },
      { status: 403 },
    );
  }

  // Kiểm tra nếu GSM editor thì proposal phải là VEHICLE_GRAB
  if (isGsmEditor && !isAdmin) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { proposalType: true },
    });
    if (proposal?.proposalType !== "VEHICLE_GRAB") {
      return NextResponse.json(
        { message: "Chỉ được chỉnh sửa đề xuất đặt xe GSM" },
        { status: 403 },
      );
    }
  }

  try {
    const updatedProposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        // ADMIN fields
        ...(isAdmin && {
          vehicleId: body.vehicleId ?? undefined,
          startAt: body.startAt ? new Date(body.startAt) : undefined,
          endAt: body.endAt ? new Date(body.endAt) : undefined,
        }),
        // GSM editor fields
        ...(body.vehicleAmount !== undefined && {
          vehicleAmount: body.vehicleAmount,
        }),
        ...(body.vehicleKm !== undefined && { vehicleKm: body.vehicleKm }),
      },
    });

    return NextResponse.json({
      message: "Cập nhật thành công",
      proposal: updatedProposal,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Cập nhật thất bại" }, { status: 500 });
  }
}
