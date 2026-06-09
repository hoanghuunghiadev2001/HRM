// app/api/proposals/[id]/add-signer/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { EmailService } from "@/lib/email-prososal-service";
import { ProposalService } from "@/lib/proposal-service";
import { generateActionToken } from "@/utils/actionLink";

const ALLOWED_IDS = [201, 317, 318];
const SERVICE_DIRECTOR_ID = 18;

function buildActionLinks(
  proposalId: number,
  actorId: number,
  role: "signer" | "approver",
) {
  const approve = generateActionToken({
    proposalId,
    actorId,
    role,
    action: "approve",
  });
  const reject = generateActionToken({
    proposalId,
    actorId,
    role,
    action: "reject",
  });
  return { approveLink: approve.directApi, rejectLink: reject.directApi };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const proposalId = Number((await params).id);

  const cookieStore = cookies();
  const token = (await cookieStore).get("token-hrm")?.value;
  if (!token)
    return NextResponse.json({ error: "Thiếu token" }, { status: 401 });

  const user = verifyToken(token);
  if (!user || !ALLOWED_IDS.includes(Number(user.id))) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  if (isNaN(proposalId)) {
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  // Kiểm tra proposal tồn tại và đúng type
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      signers: { orderBy: { level: "asc" } },
      proposer: { include: { contactInfo: true } },
    },
  });

  if (!proposal) {
    return NextResponse.json(
      { error: "Không tìm thấy đề xuất" },
      { status: 404 },
    );
  }
  if (proposal.proposalType !== "VEHICLE_GRAB") {
    return NextResponse.json(
      { error: "Chỉ áp dụng cho đề xuất đặt xe GSM" },
      { status: 400 },
    );
  }

  // Kiểm tra GĐ DV chưa có trong danh sách ký
  const alreadyExists = proposal.signers.some(
    (s) => s.signerId === SERVICE_DIRECTOR_ID,
  );
  if (alreadyExists) {
    return NextResponse.json(
      { error: "Giám đốc Dịch vụ đã có trong danh sách ký" },
      { status: 409 },
    );
  }

  // Tính level tiếp theo
  const maxLevel = proposal.signers.reduce(
    (max, s) => Math.max(max, s.level),
    0,
  );
  const newLevel = maxLevel + 1;

  // Thêm signer mới
  await prisma.proposalSigner.create({
    data: {
      proposalId,
      signerId: SERVICE_DIRECTOR_ID,
      level: newLevel,
      status: "pending",
    },
  });

  // Gửi mail cho GĐ DV — fire and forget
  (async () => {
    try {
      const signerInfo = await prisma.employee.findUnique({
        where: { id: SERVICE_DIRECTOR_ID },
        select: ProposalService.FULL_EMPLOYEE_SELECT,
      });

      if (signerInfo) {
        const links = buildActionLinks(
          proposalId,
          SERVICE_DIRECTOR_ID,
          "signer",
        );
        await EmailService.sendSignatureRequest(signerInfo, {
          ...proposal,
          ...links,
        });
        console.log(
          `✅ [add-signer] Đã gửi mail cho GĐ DV id=${SERVICE_DIRECTOR_ID}`,
        );
      }
    } catch (err) {
      console.error("[add-signer] Gửi mail thất bại:", err);
    }
  })();

  return NextResponse.json({
    success: true,
    message: "Đã thêm Giám đốc Dịch vụ vào danh sách ký",
  });
}
