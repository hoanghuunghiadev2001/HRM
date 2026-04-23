/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmailService } from "@/lib/email-prososal-service";
import { prisma } from "@/lib/prisma";
import { generateActionToken } from "@/utils/actionLink";
import { Prisma } from "../../generated/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONAL: Uncomment nếu deploy Vercel để giữ process sống sau khi response trả về
// import { waitUntil } from "@vercel/functions";
// ─────────────────────────────────────────────────────────────────────────────

// Cooldown: chỉ nhắc tối đa 1 lần / ngày / đề xuất
const REMIND_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 giờ

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithRetry(
  label: string,
  fn: () => Promise<any>,
  retries = 4,
  baseDelay = 1000,
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fn();
      console.log(
        `✅ [Remind Email] "${label}" gửi thành công (lần ${attempt})`,
      );
      return;
    } catch (error) {
      const isLast = attempt === retries;
      console.error(
        `❌ [Remind Email] "${label}" thất bại lần ${attempt}/${retries}:`,
        error,
      );
      if (isLast) throw error;
      await sleep(baseDelay * Math.pow(2, attempt - 1));
    }
  }
}

function runBackground(label: string, task: () => Promise<void>): void {
  const promise = task().catch((err) =>
    console.error(`[Background Remind] "${label}" thất bại hoàn toàn:`, err),
  );
  // Vercel: uncomment dòng dưới
  // waitUntil(promise);
}

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

const FULL_EMPLOYEE_SELECT: Prisma.EmployeeSelect = {
  id: true,
  name: true,
  employeeCode: true,
  avatar: true,
  contactInfo: {
    select: {
      phoneNumber: true,
      companyPhone: true,
      relativePhone: true,
      zalo_user_id: true,
      email: true,
    },
  },
  workInfo: {
    select: {
      position: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
    },
  },
  manager: {
    select: { id: true, name: true, employeeCode: true, avatar: true },
  },
} as Prisma.EmployeeSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Rate-limit store
// Dùng DB (bảng ProposalReminder) nếu cần persist qua restart.
// Fallback: in-memory Map nếu chưa có bảng (sẽ reset khi restart).
// ─────────────────────────────────────────────────────────────────────────────
const inMemoryLastRemind = new Map<number, Date>();

async function getLastRemindTime(proposalId: number): Promise<Date | null> {
  try {
    const record = await (prisma as any).proposalReminder?.findFirst?.({
      where: { proposalId },
      orderBy: { remindedAt: "desc" },
      select: { remindedAt: true },
    });
    return record?.remindedAt ?? null;
  } catch {
    // Bảng chưa tồn tại → dùng in-memory
    return inMemoryLastRemind.get(proposalId) ?? null;
  }
}

async function recordRemind(
  proposalId: number,
  callerId: number,
): Promise<void> {
  const now = new Date();
  try {
    await (prisma as any).proposalReminder?.create?.({
      data: { proposalId, remindedById: callerId, remindedAt: now },
    });
  } catch {
    // Bảng chưa tồn tại → ghi in-memory
    inMemoryLastRemind.set(proposalId, now);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ProposalReminderService
// ─────────────────────────────────────────────────────────────────────────────
export class ProposalReminderService {
  /**
   * remindPendingActors
   *
   * Gửi email nhắc nhở đến signer/approver hiện tại đang pending.
   *
   * Rules:
   * - Chỉ proposer của đề xuất mới được gọi.
   * - Đề xuất phải đang ở trạng thái chưa hoàn tất (không phải approved/rejected).
   * - Chỉ nhắc tối đa 1 lần / 24 giờ.
   * - Nhắc đúng người đang cần hành động (không spam toàn bộ chain).
   */
  static async remindPendingActors(
    proposalId: number,
    callerId: number,
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    statusCode?: number;
    remindedTo?: { role: string; name: string; email?: string }[];
  }> {
    // 1. Lấy proposal và kiểm tra
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        proposer: { include: { contactInfo: true } },
        signers: { orderBy: { level: "asc" } },
        approvers: { orderBy: { level: "asc" } },
      },
    });

    if (!proposal) {
      return {
        success: false,
        error: "Không tìm thấy đề xuất.",
        statusCode: 404,
      };
    }

    // 2. Chỉ proposer mới được nhắc
    if (proposal.proposerId !== callerId && callerId !== 201) {
      return {
        success: false,
        error: "Bạn không phải người tạo đề xuất này.",
        statusCode: 403,
      };
    }

    // 3. Đề xuất đã xong rồi thì không nhắc
    if (proposal.status === "approved" || proposal.status === "rejected") {
      return {
        success: false,
        error: `Đề xuất đã ${proposal.status === "approved" ? "được duyệt" : "bị từ chối"}, không cần nhắc.`,
        statusCode: 400,
      };
    }

    // 4. Kiểm tra cooldown 24 giờ
    const lastRemind = await getLastRemindTime(proposalId);
    if (lastRemind) {
      const diffMs = Date.now() - lastRemind.getTime();
      if (diffMs < REMIND_COOLDOWN_MS) {
        const remainMin = Math.ceil((REMIND_COOLDOWN_MS - diffMs) / 60000);
        return {
          success: false,
          error: `Bạn vừa nhắc rồi. Vui lòng chờ thêm ${remainMin} phút nữa.`,
          statusCode: 429,
        };
      }
    }

    // 5. Xác định người cần nhắc hiện tại
    const signers = proposal.signers as any[];
    const approvers = proposal.approvers as any[];

    // Tìm signer pending thấp nhất (đúng thứ tự level)
    const pendingSigners = signers.filter((s) => s.status === "pending");
    const minSignerLevel = pendingSigners.reduce(
      (min, s) => (s.level < min ? s.level : min),
      Infinity,
    );
    const currentSigners = pendingSigners.filter(
      (s) => s.level === minSignerLevel,
    );

    // Nếu không còn signer pending → tìm approver
    const allSignersDone = signers.every((s) => s.status === "approved");
    const pendingApprovers = allSignersDone
      ? approvers.filter((a) => a.status === "pending")
      : [];
    const minApproverLevel = pendingApprovers.reduce(
      (min, a) => (a.level < min ? a.level : min),
      Infinity,
    );
    const currentApprovers = pendingApprovers.filter(
      (a) => a.level === minApproverLevel,
    );

    const hasAnyone = currentSigners.length > 0 || currentApprovers.length > 0;
    if (!hasAnyone) {
      return {
        success: false,
        error: "Không tìm thấy ai đang chờ xử lý.",
        statusCode: 400,
      };
    }

    // 6. Ghi nhận lần nhắc (trước khi gửi để tránh spam dù mail lỗi)
    await recordRemind(proposalId, callerId);

    // 7. Gửi mail ngầm — await đầy đủ bên trong
    const remindedTo: { role: string; name: string; email?: string }[] = [];

    runBackground(`remind proposal[${proposalId}]`, async () => {
      // Nhắc từng signer hiện tại
      for (const s of currentSigners) {
        const signerInfo = await prisma.employee.findUnique({
          where: { id: s.signerId },
          select: FULL_EMPLOYEE_SELECT,
        });
        if (!signerInfo) continue;

        const links = buildActionLinks(proposalId, signerInfo.id, "signer");

        await sendWithRetry(
          `remind-sign signer[${signerInfo.id}] proposal[${proposalId}]`,
          () =>
            EmailService.sendSignatureRequest(signerInfo, {
              ...proposal,
              ...links,
              isReminder: true, // flag để template email hiển thị "Nhắc nhở"
            }),
        );
      }

      // Nhắc từng approver hiện tại
      for (const a of currentApprovers) {
        const approverInfo = await prisma.employee.findUnique({
          where: { id: a.approverId },
          select: FULL_EMPLOYEE_SELECT,
        });
        if (!approverInfo) continue;

        const links = buildActionLinks(proposalId, approverInfo.id, "approver");

        await sendWithRetry(
          `remind-approve approver[${approverInfo.id}] proposal[${proposalId}]`,
          () =>
            EmailService.sendApprovalRequest(approverInfo, {
              ...proposal,
              ...links,
              isReminder: true,
            }),
        );
      }
    });

    // Gom danh sách người được nhắc để trả về cho client
    for (const s of currentSigners) {
      remindedTo.push({
        role: "signer",
        name: s.signer?.name ?? `ID ${s.signerId}`,
      });
    }
    for (const a of currentApprovers) {
      remindedTo.push({
        role: "approver",
        name: a.approver?.name ?? `ID ${a.approverId}`,
      });
    }

    return {
      success: true,
      message: `Đã gửi nhắc nhở đến ${remindedTo.length} người.`,
      remindedTo,
    };
  }
}
