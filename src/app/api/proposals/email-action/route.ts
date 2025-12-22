import { NextRequest } from "next/server";
import { verifyActionToken } from "@/utils/actionLink";
import { prisma } from "@/lib/prisma";
import { ProposalService } from "@/lib/proposal-service";

/* =========================
   Helpers
========================= */

function html(content: string, status = 200) {
  return new Response(content, {
    status,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
}

type ActionPageProps = {
  title: string;
  message: string;
  icon: string;
  color: string;
  buttonText?: string;
  buttonUrl?: string;
};

function renderActionPage({
  title,
  message,
  icon,
  color,
  buttonText,
  buttonUrl,
}: ActionPageProps) {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f4f6f8;
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #fff;
      padding: 40px;
      border-radius: 12px;
      width: 90%;
      max-width: 480px;
      box-shadow: 0 10px 25px rgba(0,0,0,.1);
      text-align: center;
    }
    .icon {
      font-size: 56px;
      margin-bottom: 16px;
    }
    h1 {
      margin-bottom: 12px;
    }
    p {
      color: #555;
      margin-bottom: 28px;
      line-height: 1.6;
    }
    a.btn {
      display: inline-block;
      padding: 14px 28px;
      background: ${color};
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
    a.btn:hover {
      opacity: .9;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${
      buttonText && buttonUrl
        ? `<a href="${buttonUrl}" class="btn">${buttonText}</a>`
        : ""
    }
  </div>
</body>
</html>
`;
}

/* =========================
   Pages
========================= */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "/";

const pageSuccess = () =>
  renderActionPage({
    title: "Thành công",
    message: "Bạn đã thực hiện hành động thành công.",
    icon: "✅",
    color: "#28a745",
    buttonText: "Về hệ thống",
    buttonUrl: APP_URL,
  });

const pageAlreadyUsed = () =>
  renderActionPage({
    title: "Đã xử lý",
    message: "Liên kết này đã được sử dụng trước đó.",
    icon: "⚠️",
    color: "#ffc107",
    buttonText: "Về hệ thống",
    buttonUrl: APP_URL,
  });

const pageExpired = () =>
  renderActionPage({
    title: "Hết hạn",
    message: "Liên kết đã hết hạn, vui lòng yêu cầu lại.",
    icon: "⌛",
    color: "#dc3545",
  });

const pageInvalidToken = () =>
  renderActionPage({
    title: "Liên kết không hợp lệ",
    message: "Liên kết không tồn tại hoặc đã bị thay đổi.",
    icon: "❌",
    color: "#dc3545",
  });

const pageFailed = (msg?: string) =>
  renderActionPage({
    title: "Thất bại",
    message: msg || "Không thể thực hiện hành động.",
    icon: "❌",
    color: "#dc3545",
  });

const pageServerError = () =>
  renderActionPage({
    title: "Lỗi hệ thống",
    message: "Đã có lỗi xảy ra, vui lòng thử lại sau.",
    icon: "💥",
    color: "#dc3545",
  });

/* =========================
   Utils
========================= */

function isBot(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  return /bot|crawler|preview|facebook|slack|discord|whatsapp/i.test(ua);
}

/* =========================
   GET – click từ email
========================= */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token-hrm");
  const direct = url.searchParams.get("direct") === "1";

  if (!token) return html(pageInvalidToken(), 400);

  // Bot preview KHÔNG được phép xử lý
  if (isBot(req)) {
    return html(pageInvalidToken(), 403);
  }

  const data = verifyActionToken(token);
  if (!data) return html(pageExpired(), 410);

  let record = await prisma.emailActionToken.findUnique({
    where: { token },
  });

  // Lưu token lần đầu (idempotent)
  if (!record) {
    record = await prisma.emailActionToken.create({
      data: {
        token,
        proposalId: data.proposalId,
        actorId: String(data.actorId),
        role: data.role,
        action: data.action,
        expiresAt: new Date(data.expiry * 1000),
      },
    });
  }

  // Token đã dùng → trang thông báo (KHÔNG 400)
  if (record.usedAt) {
    return html(pageAlreadyUsed(), 410);
  }

  // 1-click action
  if (direct) {
    return handleAction(token, data, req);
  }

  // Trang xác nhận
  return html(
    renderActionPage({
      title: data.action === "approve" ? "Xác nhận duyệt" : "Xác nhận từ chối",
      message: `Bạn sắp ${
        data.action === "approve" ? "duyệt" : "từ chối"
      } đề xuất #${data.proposalId}`,
      icon: "📝",
      color: data.action === "approve" ? "#28a745" : "#dc3545",
      buttonText: "Xác nhận",
      buttonUrl: `${APP_URL}/api/proposals/email-action?token-hrm=${token}&direct=1`,
    }),
    200
  );
}

/* =========================
   POST – fallback
========================= */

export async function POST(req: NextRequest) {
  if (isBot(req)) {
    return html(pageInvalidToken(), 403);
  }

  let token: string | null = null;
  const ct = req.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    const body = await req.json();
    token = body?.token || body?.["token-hrm"];
  } else {
    const form = await req.formData();
    token = form.get("token-hrm") as string;
  }

  if (!token) return html(pageInvalidToken(), 400);

  const data = verifyActionToken(token);
  if (!data) return html(pageExpired(), 410);

  return handleAction(token, data, req);
}

/* =========================
   Core handler
========================= */

async function handleAction(
  token: string,
  data: NonNullable<ReturnType<typeof verifyActionToken>>,
  req: NextRequest
) {
  try {
    const record = await prisma.emailActionToken.findUnique({
      where: { token },
    });

    if (!record) return html(pageInvalidToken(), 400);
    if (record.usedAt) return html(pageAlreadyUsed(), 410);

    let result: { success: boolean; message?: string } | null = null;

    if (data.role === "signer") {
      result = await ProposalService.signProposal(
        data.proposalId,
        data.actorId,
        data.action === "approve" ? "approved" : "rejected"
      );
    }

    if (data.role === "approver") {
      result = await ProposalService.approveProposal(
        data.proposalId,
        data.actorId,
        data.action === "approve" ? "approved" : "rejected"
      );
    }

    if (!result?.success) {
      return html(pageFailed(result?.message), 400);
    }

    await prisma.emailActionToken.update({
      where: { token },
      data: {
        usedAt: new Date(),
        ip: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "",
      },
    });

    return html(pageSuccess(), 200);
  } catch (err) {
    console.error("[email-action]", err);
    return html(pageServerError(), 500);
  }
}
