// app/api/proposals/[id]/update/route.ts (Next.js App Router)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

interface UpdateProposalBody {
  vehicleId?: number;
  startAt?: string; // ISO string
  endAt?: string; // ISO string
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const proposalIdStr = (await params).id;
  const proposalId = Number(proposalIdStr);

  // Lấy token từ cookie
  const cookieStore = cookies();
  const token = (await cookieStore).get("token-hrm")?.value;

  if (!token) {
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  }

  // Verify token
  const user = verifyToken(token);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }
  if (isNaN(proposalId)) {
    return NextResponse.json(
      { error: "ID đề xuất không hợp lệ" },
      { status: 400 }
    );
  }

  const body: UpdateProposalBody = await req.json();

  try {
    const updatedProposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        vehicleId: body.vehicleId ?? undefined,
        startAt: body.startAt ? new Date(body.startAt) : undefined,
        endAt: body.endAt ? new Date(body.endAt) : undefined,
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
