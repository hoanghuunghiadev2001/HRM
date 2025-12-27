/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from "next/server";
import { verifyActionToken } from "@/utils/actionLink";
import { prisma } from "@/lib/prisma";
import { ProposalService } from "@/lib/proposal-service";

/* =========================
   Helpers & UI Components
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

/**
 * Render trang thông báo kết quả (Thành công, Lỗi, Hết hạn...)
 */
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root { --primary: ${color}; }
    body { font-family: 'Inter', -apple-system, system-ui, sans-serif; background: #f8fafc; margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; color: #1e293b; }
    .card { background:#fff; padding:48px 32px; border-radius:24px; width:90%; max-width:440px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); text-align:center; }
    .icon-wrapper { width: 80px; height: 80px; background: ${color}15; color: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 24px; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
    p { color:#64748b; margin-bottom: 32px; line-height: 1.6; font-size: 16px; }
    .btn { display: inline-block; width: 100%; padding: 14px; border-radius: 12px; font-weight: 600; text-decoration: none; color: #fff; background: var(--primary); border: none; cursor: pointer; transition: all 0.2s; font-size: 16px; box-sizing: border-box; }
    .btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrapper">${icon}</div>
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
   Page Variations
========================= */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "/";

const pageAlreadyUsed = () =>
  renderActionPage({
    title: "Yêu cầu đã xử lý",
    message:
      "Liên kết này đã được sử dụng trước đó. Bạn không thể thực hiện lại hành động này.",
    icon: "⚠️",
    color: "#f59e0b",
    buttonText: "Quay lại hệ thống",
    buttonUrl: APP_URL,
  });

const pageExpired = () =>
  renderActionPage({
    title: "Liên kết hết hạn",
    message:
      "Thời gian hiệu lực của liên kết đã kết thúc. Vui lòng yêu cầu một liên kết mới.",
    icon: "⌛",
    color: "#ef4444",
  });

const pageInvalidToken = () =>
  renderActionPage({
    title: "Không hợp lệ",
    message: "Liên kết không tồn tại hoặc đã bị thay đổi trái phép.",
    icon: "🚫",
    color: "#ef4444",
  });

const pageFailed = (msg?: string) =>
  renderActionPage({
    title: "Thao tác thất bại",
    message: msg || "Hệ thống không thể thực hiện hành động này vào lúc này.",
    icon: "❌",
    color: "#ef4444",
  });

const pageServerError = () =>
  renderActionPage({
    title: "Lỗi hệ thống",
    message: "Đã có lỗi xảy ra trên máy chủ. Vui lòng thử lại sau vài phút.",
    icon: "🔥",
    color: "#ef4444",
  });

function pageActionSuccess(action: "approve" | "reject") {
  return renderActionPage({
    title: action === "approve" ? "Đã duyệt đề xuất" : "Đã từ chối đề xuất",
    message:
      action === "approve"
        ? "Hệ thống đã ghi nhận quyết định DUYỆT của bạn."
        : "Hệ thống đã ghi nhận quyết định TỪ CHỐI của bạn.",
    icon: action === "approve" ? "✅" : "📩",
    color: action === "approve" ? "#10b981" : "#ef4444",
    buttonText: "Về trang chủ",
    buttonUrl: APP_URL,
  });
}

function isBot(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  return /bot|crawler|preview|facebook|slack|discord|whatsapp/i.test(ua);
}

/* =========================
   GET – Click từ Email
========================= */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token-hrm");
  const direct = url.searchParams.get("direct") === "1";

  if (!token) return html(pageInvalidToken(), 400);
  if (isBot(req)) return html(pageInvalidToken(), 403);

  const data = verifyActionToken(token);
  if (!data) return html(pageExpired(), 410);

  let record = await prisma.emailActionToken.findUnique({ where: { token } });
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

  if (record.usedAt) return html(pageAlreadyUsed(), 410);

  // Xử lý nhanh nếu là "Duyệt" và có flag direct
  if (direct && data.action === "approve") {
    return handleAction(token, data, req);
  }

  // Trang xác nhận (Duyệt hoặc Từ chối có nhập lý do)
  const isReject = data.action === "reject";
  const primaryColor = isReject ? "#ef4444" : "#10b981";

  return html(
    `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận hành động</title>
  <style>
    :root { --primary: ${primaryColor}; }
    body { font-family: 'Inter', sans-serif; background:#f8fafc; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; color: #1e293b; }
    .card { background:#fff; padding:40px; border-radius:24px; width:90%; max-width:440px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); text-align:center; }
    h1 { font-size: 24px; margin-bottom: 8px; color: #0f172a; }
    p { color: #64748b; margin-bottom: 24px; font-size: 15px; }
    .form-group { text-align: left; margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 600; color: #334155; font-size: 14px; }
    textarea { width:100%; padding:12px; border-radius:12px; border:1px solid #e2e8f0; resize:vertical; font-family:inherit; box-sizing: border-box; font-size: 15px; }
    textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px ${primaryColor}20; }
    button { width: 100%; padding:14px; background: var(--primary); color:#fff; border:none; border-radius:12px; font-weight:600; cursor:pointer; font-size: 16px; transition: all 0.2s; }
    button:disabled { background: #94a3b8; cursor: not-allowed; transform: none !important; }
    .loader { display: none; border: 2px solid #f3f3f3; border-top: 2px solid #fff; border-radius: 50%; width: 16px; height: 16px; animation: spin 0.8s linear infinite; margin-right: 8px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <h1>${isReject ? "Xác nhận từ chối" : "Xác nhận duyệt"}</h1>
    <p>Bạn đang thực hiện thao tác cho đề xuất <strong>#${
      data.proposalId
    }</strong></p>
    <form id="actionForm" method="POST" action="${APP_URL}/api/proposals/email-action">
      <input type="hidden" name="token-hrm" value="${token}" />
      ${
        isReject
          ? `
      <div class="form-group">
        <label>Lý do từ chối (bắt buộc):</label>
        <textarea name="reason" rows="4" placeholder="Vui lòng nhập lý do cụ thể..." required></textarea>
      </div>`
          : ""
      }
      <button type="submit" id="submitBtn">
        <span id="loader" class="loader"></span>
        <span id="btnText">Xác nhận ${isReject ? "từ chối" : "duyệt"}</span>
      </button>
    </form>
  </div>

  <script>
    const form = document.getElementById('actionForm');
    const btn = document.getElementById('submitBtn');
    const loader = document.getElementById('loader');
    const btnText = document.getElementById('btnText');
    
    form.onsubmit = function() {
      // Vô hiệu hóa nút để chặn bấm nhiều lần
      btn.disabled = true;
      loader.style.display = 'inline-block';
      btnText.innerText = 'Đang xử lý...';
      return true;
    };
  </script>
</body>
</html>
`,
    200
  );
}

/* =========================
   POST – Nhận từ Form xác nhận
========================= */

export async function POST(req: NextRequest) {
  if (isBot(req)) return html(pageInvalidToken(), 403);

  let token: string | null = null;
  let reason: string | null = null;

  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const body = await req.json();
      token = body?.token || body?.["token-hrm"];
      reason = body?.reason || null;
    } else {
      const form = await req.formData();
      token = form.get("token-hrm") as string;
      reason = (form.get("reason") as string) || null;
    }
  } catch (e) {
    return html(pageInvalidToken(), 400);
  }

  if (!token) return html(pageInvalidToken(), 400);

  const data = verifyActionToken(token);
  if (!data) return html(pageExpired(), 410);

  return handleAction(token, data, req, reason);
}

/* =========================
   Core Handler
========================= */

async function handleAction(
  token: string,
  data: NonNullable<ReturnType<typeof verifyActionToken>>,
  req: NextRequest,
  reason?: string | null
) {
  try {
    const record = await prisma.emailActionToken.findUnique({
      where: { token },
    });
    if (!record) return html(pageInvalidToken(), 400);
    if (record.usedAt) return html(pageAlreadyUsed(), 410);

    let result: { success: boolean; message?: string } | null = null;
    const actionStatus = data.action === "approve" ? "approved" : "rejected";

    // Gọi Service xử lý Logic nghiệp vụ
    if (data.role === "signer") {
      result = await ProposalService.signProposal(
        data.proposalId,
        data.actorId,
        actionStatus,
        reason || undefined
      );
    } else if (data.role === "approver") {
      result = await ProposalService.approveProposal(
        data.proposalId,
        data.actorId,
        actionStatus,
        reason || undefined
      );
    }

    if (!result?.success) {
      return html(pageFailed(result?.message), 400);
    }

    // Đánh dấu token đã sử dụng và lưu thông tin vết (Audit log)
    await prisma.emailActionToken.update({
      where: { token },
      data: {
        usedAt: new Date(),
        ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        userAgent: req.headers.get("user-agent") || "",
      },
    });

    return html(pageActionSuccess(data.action), 200);
  } catch (err) {
    console.error("[Email-Action Error]:", err);
    return html(pageServerError(), 500);
  }
}
