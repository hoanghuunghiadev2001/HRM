/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitUntil } from "@vercel/functions";
import type { CreateProposalFormData } from "@/components/api";
import { FileService } from "./file-service";
import { EmailService } from "./email-prososal-service";
import { prisma } from "./prisma";
import type { Prisma } from "../../generated/prisma/client";
import { generateActionToken } from "@/utils/actionLink";

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONAL: Nếu deploy trên Vercel, import waitUntil để giữ process sống
// sau khi response đã trả về. Nếu không dùng Vercel, xóa 2 dòng này.
// ─────────────────────────────────────────────────────────────────────────────
// import { waitUntil } from "@vercel/functions";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─────────────────────────────────────────────────────────────────────────────
// sendWithRetry: Retry tối đa `retries` lần, delay tăng dần (exponential back‑off)
// Mỗi lần thất bại đều được log đầy đủ. Sau hết retry thì throw để caller xử lý.
// ─────────────────────────────────────────────────────────────────────────────
async function sendWithRetry(
  label: string,
  fn: () => Promise<any>,
  retries = 3,
  baseDelay = 500,
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fn();
      console.log(`✅ [Email] "${label}" gửi thành công (lần ${attempt})`);
      return;
    } catch (error) {
      const isLast = attempt === retries;
      console.error(
        `❌ [Email] "${label}" thất bại lần ${attempt}/${retries}:`,
        error,
      );
      if (isLast) {
        // Đã hết retry — persist lỗi để có thể xử lý thủ công sau
        await persistFailedEmail(label, error).catch(() => {});
        throw error;
      }
      // Exponential back‑off: 1s, 2s, 4s, 8s …
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// persistFailedEmail: Lưu mail thất bại vào DB để có thể retry thủ công / cron.
// Nếu chưa có bảng FailedEmail trong schema, bỏ hàm này hoặc thay bằng logger.
// ─────────────────────────────────────────────────────────────────────────────
async function persistFailedEmail(
  label: string,
  error: unknown,
): Promise<void> {
  try {
    await (prisma as any).failedEmail?.create?.({
      data: {
        label,
        errorMessage: error instanceof Error ? error.message : String(error),
        createdAt: new Date(),
      },
    });
  } catch {
    // Bảng chưa tồn tại hoặc DB lỗi — chỉ log, không throw
    console.warn(`[FailedEmail] Không thể persist email thất bại: "${label}"`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// runBackground: Bọc toàn bộ tác vụ nền.
//  - Nếu dùng Vercel: uncomment dòng waitUntil ở trên và dùng nó.
//  - Nếu dùng Node.js standalone: Promise tự chạy, process không bị kill.
// ─────────────────────────────────────────────────────────────────────────────
function runBackground(label: string, task: () => Promise<void>): void {
  // Thực thi task và bắt lỗi để không làm sập process chính
  const promise = task().catch((err) =>
    console.error(`[Background] Tác vụ "${label}" thất bại hoàn toàn:`, err),
  );

  // Kiểm tra nếu đang chạy trên môi trường Vercel thì mới dùng waitUntil
  // Vercel tự động set VERCEL=1 khi bạn deploy
  if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
    try {
      waitUntil(promise);
    } catch (e) {
      console.warn(`[Background] Không thể gọi waitUntil:`, e);
    }
  }

  // Ở Local, Promise vẫn sẽ tiếp tục chạy trong event loop của Node.js
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers tạo approve/reject link
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
export class ProposalService {
  // ── Selects ──────────────────────────────────────────────────────────────

  static FULL_EMPLOYEE_SELECT: Prisma.EmployeeSelect = {
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

  static FULL_PROPOSAL_INCLUDE: Prisma.ProposalInclude = {
    files: true,
    vehicle: true,
    proposer: { select: ProposalService.FULL_EMPLOYEE_SELECT },
    createdBy: { select: ProposalService.FULL_EMPLOYEE_SELECT },
    signers: {
      select: {
        id: true,
        level: true,
        status: true,
        signerId: true,
        signedAt: true,
        reason: true,
        signer: { select: ProposalService.FULL_EMPLOYEE_SELECT },
      },
    },
    approvers: {
      select: {
        id: true,
        level: true,
        status: true,
        approverId: true,
        approvedAt: true,
        reason: true,
        approver: { select: ProposalService.FULL_EMPLOYEE_SELECT },
      },
    },
  } as Prisma.ProposalInclude;

  static getFullIncludeObject() {
    return this.FULL_PROPOSAL_INCLUDE;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  static async createProposal(
    proposalData: CreateProposalFormData,
    files: File[] | null,
    createdById: number,
  ) {
    try {
      // 1. Upload files
      const uploadedFileIds: number[] = [];
      const fileUrls: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const { valid, error } = FileService.validateFile(file);
          if (!valid) {
            return {
              success: false,
              error: `File ${file.name} không hợp lệ: ${error}`,
            };
          }
          const { fileId } = await FileService.uploadFile(file);
          uploadedFileIds.push(fileId);
          fileUrls.push(`${baseUrl}/api/files/${fileId}`);
        }
      }

      // 2. Tạo Proposal
      const newProposal = await prisma.proposal.create({
        data: {
          name: proposalData.name,
          title: proposalData.title,
          description: proposalData.description,
          proposerId: proposalData.proposerId,
          createdById,
          proposalType: proposalData.proposalType || "REGULAR",
          vehicleId: proposalData.vehicleId || null,
          startAt: proposalData.startAt || null,
          endAt: proposalData.endAt || null,
          dropoffPlace: proposalData.dropoffPlace || null,
          pickupPlace: proposalData.pickupPlace || null,
          customerName: proposalData.customerName || null,
          roNumber: proposalData.roNumber || null,
          vehicleKm: proposalData.vehicleKm || null,
          vehicleAmount: proposalData.vehicleAmount || null,
          roAmount: proposalData.roAmount || null,
          files: { connect: uploadedFileIds.map((id) => ({ id })) },
          signers: {
            create: proposalData.signerIds.map((id, idx) => ({
              level: idx + 1,
              status: "pending",
              signer: { connect: { id } },
            })),
          },
          approvers: {
            create: proposalData.approverIds.map((id, idx) => ({
              level: idx + 1,
              status: "pending",
              approver: { connect: { id } },
            })),
          },
        },
        include: {
          ...this.FULL_PROPOSAL_INCLUDE,
          files: true,
          proposer: { include: { contactInfo: { select: { email: true } } } },
        },
      });

      const filePayload = {
        fileUrl: fileUrls.length > 0 ? fileUrls[0] : null,
        allFiles: fileUrls,
      };

      // 3. Gửi email — chạy ngầm nhưng ĐẦY ĐỦ await bên trong
      runBackground("create-proposal-emails", async () => {
        // 3a. Xác nhận cho proposer
        await sendWithRetry(
          `proposal-created-confirm [proposalId=${newProposal.id}]`,
          () =>
            EmailService.sendProposalCreatedConfirmation(newProposal.proposer, {
              ...newProposal,
              ...filePayload,
            }),
        );

        // 3b. Thông báo cho signer level 1
        const firstSigner = (newProposal.signers as any[])
          .filter((s) => s.status === "pending")
          .sort((a, b) => a.level - b.level)[0];

        if (firstSigner) {
          const signerInfo = await prisma.employee.findUnique({
            where: { id: firstSigner.signerId },
            select: this.FULL_EMPLOYEE_SELECT,
          });

          if (signerInfo) {
            const links = buildActionLinks(
              newProposal.id,
              signerInfo.id,
              "signer",
            );

            const isVehicle = ["VEHICLE_GRAB"].includes(
              newProposal.proposalType,
            );
            if (isVehicle) {
              await sendWithRetry(
                `vehicle-request signer[${signerInfo.id}] proposal[${newProposal.id}]`,
                () =>
                  EmailService.sendVehicleRequest(signerInfo, {
                    ...newProposal,
                    ...links,
                  }),
              );
            } else {
              await sendWithRetry(
                `signature-request signer[${signerInfo.id}] proposal[${newProposal.id}]`,
                () =>
                  EmailService.sendSignatureRequest(signerInfo, {
                    ...newProposal,
                    ...filePayload,
                    ...links,
                  }),
              );
            }
          }
        }
      });

      return { success: true, data: newProposal };
    } catch (error) {
      console.error("[ProposalService] ❌ createProposal error:", error);
      return {
        success: false,
        error: "Không thể tạo đề xuất, vui lòng kiểm tra lại dữ liệu.",
      };
    }
  }

  // ── Get ───────────────────────────────────────────────────────────────────

  static async getProposal(proposalId: number, userId?: string) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: { ...this.getFullIncludeObject(), files: true },
      });

      if (!proposal) return { success: false, error: "Không tìm thấy đề xuất" };

      // Dự phòng file cũ (1-1)
      let finalFiles = proposal.files || [];
      if (finalFiles.length === 0 && (proposal as any).fileId) {
        const legacyFile = await prisma.file.findUnique({
          where: { id: (proposal as any).fileId },
        });
        if (legacyFile) finalFiles = [legacyFile];
      }

      const sortedSigners = ([...(proposal.signers || [])] as any[]).sort(
        (a, b) => a.level - b.level,
      );
      const sortedApprovers = ([...(proposal.approvers || [])] as any[]).sort(
        (a, b) => a.level - b.level,
      );

      const isRejected =
        sortedSigners.some((s) => s.status === "rejected") ||
        sortedApprovers.some((a) => a.status === "rejected");

      const nextSignerIndex = !isRejected
        ? sortedSigners.findIndex(
            (s, idx) =>
              s.status === "pending" &&
              sortedSigners.slice(0, idx).every((p) => p.status === "approved"),
          )
        : -1;

      const allSignersApproved = sortedSigners.every(
        (s) => s.status === "approved",
      );

      const nextApproverIndex =
        !isRejected && allSignersApproved
          ? sortedApprovers.findIndex(
              (a, idx) =>
                a.status === "pending" &&
                sortedApprovers
                  .slice(0, idx)
                  .every((p) => p.status === "approved"),
            )
          : -1;

      const signers = sortedSigners.map((s, i) => ({
        ...s,
        isCurrent: i === nextSignerIndex,
      }));
      const approvers = sortedApprovers.map((a, i) => ({
        ...a,
        isCurrent: i === nextApproverIndex,
      }));

      let currentStep: { step: string; userId: string | null } = {
        step: "done",
        userId: null,
      };
      if (isRejected) currentStep = { step: "rejected", userId: null };
      else if (nextSignerIndex >= 0)
        currentStep = {
          step: "sign",
          userId: String(signers[nextSignerIndex].signerId),
        };
      else if (nextApproverIndex >= 0)
        currentStep = {
          step: "approve",
          userId: String(approvers[nextApproverIndex].approverId),
        };

      const statusSign = signers.some(
        (s) => s.isCurrent && String(s.signerId) === String(userId),
      );
      const statusApprove = approvers.some(
        (a) => a.isCurrent && String(a.approverId) === String(userId),
      );

      return {
        success: true,
        data: {
          ...proposal,
          files: finalFiles,
          signers,
          approvers,
          currentStep,
          statusSign,
          statusApprove,
        },
      };
    } catch (error) {
      console.error("[ProposalService] ❌ getProposal error:", error);
      return { success: false, error: "Lỗi khi lấy thông tin đề xuất" };
    }
  }

  // ── Sign ──────────────────────────────────────────────────────────────────

  static async signProposal(
    proposalId: number,
    employeeId: number,
    status: "approved" | "rejected",
    reason?: string,
  ) {
    try {
      // 1. Kiểm tra quyền
      const currentSigner = await prisma.proposalSigner.findFirst({
        where: { proposalId, signerId: employeeId, status: "pending" },
      });

      if (!currentSigner) {
        return {
          success: false,
          error: "Bạn không có quyền ký hoặc đề xuất đã được xử lý.",
        };
      }

      // 2. Cập nhật DB trong Transaction
      const updatedProposal = await prisma.$transaction(
        async (tx) => {
          await tx.proposalSigner.update({
            where: { id: currentSigner.id },
            data: { status, signedAt: new Date(), reason: reason || null },
          });

          if (status === "rejected") {
            await tx.proposal.update({
              where: { id: proposalId },
              data: { status: "rejected" },
            });
          }

          return tx.proposal.findUnique({
            where: { id: proposalId },
            include: {
              proposer: { include: { contactInfo: true } },
              signers: { orderBy: { level: "asc" } },
              approvers: { orderBy: { level: "asc" } },
            },
          });
        },
        { timeout: 10000 },
      );

      if (!updatedProposal) {
        return { success: false, error: "Lỗi khi cập nhật dữ liệu." };
      }

      // 3. Gửi email ngầm — đảm bảo await đầy đủ bên trong
      runBackground(`sign-emails proposal[${proposalId}]`, () =>
        this.handleSignEmailNotifications(
          updatedProposal,
          status,
          employeeId,
          reason,
        ),
      );

      return {
        success: true,
        message:
          status === "approved"
            ? "Ký duyệt thành công."
            : "Đã từ chối đề xuất.",
      };
    } catch (error) {
      console.error("[ProposalService] ❌ signProposal error:", error);
      return { success: false, error: "Hệ thống gặp lỗi khi xử lý ký duyệt." };
    }
  }

  private static async handleSignEmailNotifications(
    proposal: any,
    status: string,
    actorId: number,
    reason?: string,
  ): Promise<void> {
    // TH1: Từ chối
    if (status === "rejected") {
      const actor = proposal.signers.find((s: any) => s.signerId === actorId);
      await sendWithRetry(
        `sign-rejected proposer[${proposal.proposer?.id}] proposal[${proposal.id}]`,
        () =>
          EmailService.sendProposalRejectedBySigner(
            proposal.proposer,
            proposal,
            actor,
            reason || "",
          ),
      );
      return;
    }

    // TH2: Tìm signer kế tiếp
    const nextSigner = proposal.signers.find(
      (s: any) => s.status === "pending",
    );

    if (nextSigner) {
      const signerInfo = await prisma.employee.findUnique({
        where: { id: nextSigner.signerId },
        select: this.FULL_EMPLOYEE_SELECT,
      });

      if (signerInfo) {
        const links = buildActionLinks(proposal.id, signerInfo.id, "signer");
        await sendWithRetry(
          `signature-request signer[${signerInfo.id}] proposal[${proposal.id}]`,
          () =>
            EmailService.sendSignatureRequest(signerInfo, {
              ...proposal,
              ...links,
            }),
        );
      }
    } else {
      // TH3: Hết signer → chuyển sang approver đầu tiên
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: "waiting_approval" },
      });

      const firstApprover = proposal.approvers.find(
        (a: any) => a.status === "pending",
      );
      if (firstApprover) {
        const approverInfo = await prisma.employee.findUnique({
          where: { id: firstApprover.approverId },
          select: this.FULL_EMPLOYEE_SELECT,
        });

        if (approverInfo) {
          const links = buildActionLinks(
            proposal.id,
            approverInfo.id,
            "approver",
          );
          await sendWithRetry(
            `approval-request approver[${approverInfo.id}] proposal[${proposal.id}]`,
            () =>
              EmailService.sendApprovalRequest(approverInfo, {
                ...proposal,
                ...links,
              }),
          );
        }
      }
    }
  }

  // ── Approve ───────────────────────────────────────────────────────────────

  static async approveProposal(
    proposalId: number,
    employeeId: number,
    status: "approved" | "rejected",
    reason?: string,
  ) {
    try {
      // 1. Kiểm tra quyền
      const currentApprover = await prisma.proposalApprover.findFirst({
        where: { proposalId, approverId: employeeId, status: "pending" },
      });

      if (!currentApprover) {
        return {
          success: false,
          error: "Bạn không có quyền duyệt hoặc đề xuất đã được xử lý.",
        };
      }

      // 2. Đảm bảo đúng thứ tự level
      const minPending = await prisma.proposalApprover.aggregate({
        where: { proposalId, status: "pending" },
        _min: { level: true },
      });

      if (currentApprover.level !== minPending._min.level) {
        return { success: false, error: "Chưa đến lượt duyệt của bạn." };
      }

      // 3. Cập nhật DB trong Transaction
      const updated = await prisma.$transaction(
        async (tx) => {
          await tx.proposalApprover.update({
            where: { id: currentApprover.id },
            data: { status, approvedAt: new Date(), reason: reason || null },
          });

          if (status === "rejected") {
            await tx.proposal.update({
              where: { id: proposalId },
              data: { status: "rejected" },
            });
          }

          return tx.proposal.findUnique({
            where: { id: proposalId },
            include: {
              proposer: { include: { contactInfo: true } },
              approvers: { orderBy: { level: "asc" } },
            },
          });
        },
        { timeout: 10000 },
      );

      if (!updated) return { success: false, error: "Lỗi đồng bộ dữ liệu." };

      // 4. Gửi email ngầm — đảm bảo await đầy đủ bên trong
      runBackground(`approve-emails proposal[${proposalId}]`, () =>
        this.handleApprovalEmailNotifications(
          updated,
          status,
          employeeId,
          reason,
        ),
      );

      return {
        success: true,
        message:
          status === "approved"
            ? "Phê duyệt thành công."
            : "Đã từ chối đề xuất.",
      };
    } catch (error) {
      console.error("[ProposalService] ❌ approveProposal error:", error);
      return { success: false, error: "Lỗi hệ thống khi phê duyệt." };
    }
  }

  private static async handleApprovalEmailNotifications(
    proposal: any,
    status: string,
    actorId: number,
    reason?: string,
  ): Promise<void> {
    // TH1: Từ chối
    if (status === "rejected") {
      await sendWithRetry(
        `approve-rejected proposer[${proposal.proposer?.id}] proposal[${proposal.id}]`,
        () =>
          EmailService.sendStatusUpdate(
            proposal.proposer,
            proposal,
            "rejected",
            reason || "",
          ),
      );
      return;
    }

    // TH2: Tìm approver kế tiếp
    const nextApprover = proposal.approvers.find(
      (a: any) => a.status === "pending",
    );

    if (nextApprover) {
      const approverInfo = await prisma.employee.findUnique({
        where: { id: nextApprover.approverId },
        select: this.FULL_EMPLOYEE_SELECT,
      });

      if (approverInfo) {
        const links = buildActionLinks(
          proposal.id,
          approverInfo.id,
          "approver",
        );
        await sendWithRetry(
          `approval-request approver[${approverInfo.id}] proposal[${proposal.id}]`,
          () =>
            EmailService.sendApprovalRequest(approverInfo, {
              ...proposal,
              ...links,
            }),
        );
      }
    } else {
      // TH3: Tất cả đã duyệt → hoàn tất
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: "approved" },
      });

      await sendWithRetry(
        `proposal-approved-final proposer[${proposal.proposer?.id}] proposal[${proposal.id}]`,
        () =>
          EmailService.sendStatusUpdate(
            proposal.proposer,
            proposal,
            "approved",
          ),
      );
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  static async deleteProposal(proposalId: number) {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: { files: true, signers: true, approvers: true },
      });

      if (!proposal) {
        return {
          success: false,
          error: "Đề xuất không tìm thấy hoặc đã bị xóa trước đó.",
        };
      }

      if (proposal.files && proposal.files.length > 0) {
        await Promise.all(
          proposal.files.map((file) => FileService.deleteFile(file.id)),
        );
      }

      await prisma.proposal.delete({ where: { id: proposalId } });

      return {
        success: true,
        message: "Đề xuất đã được xóa thành công cùng các tài liệu đính kèm.",
      };
    } catch (error) {
      console.error("[ProposalService] ❌ deleteProposal error:", error);
      return { success: false, error: "Lỗi hệ thống khi xóa đề xuất." };
    }
  }
}
