import { NextRequest } from "next/server";
import { verifyActionToken } from "@/utils/actionLink";
import { prisma } from "@/lib/prisma"; // điều chỉnh path nếu cần
import { ProposalService } from "@/lib/proposal-service";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token-hrm");
  const direct = url.searchParams.get("direct") === "1";

  if (!token)
    return new Response(JSON.stringify({ error: "Missing token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

  const data = verifyActionToken(token);
  if (!data)
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

  // Find or create token record
  let tokenRecord = await prisma.emailActionToken.findUnique({
    where: { token },
  });
  if (!tokenRecord) {
    tokenRecord = await prisma.emailActionToken.create({
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

  if (tokenRecord.usedAt) {
    return new Response(JSON.stringify({ error: "Token đã được sử dụng" }), {
      status: 410,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Direct 1-click
  if (direct) {
    return await handleAction(token, data, req);
  }

  // Otherwise, show confirmation HTML
  return new Response(
    `
    <html>
      <head><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
      <body style="font-family:Arial, sans-serif; padding:24px; max-width:720px; margin:0 auto; text-align:center;">
        <h2>${data.action === "approve" ? "Duyệt" : "Từ chối"} đề xuất</h2>
        <p>Đề xuất ID: <strong>${data.proposalId}</strong></p>
        <p>Vai trò: <strong>${data.role}</strong></p>
        <form method="POST">
          <input type="hidden" name="token" value="${token}" />
          <button type="submit" style="padding:12px 24px; border-radius:6px; border:none; background:${
            data.action === "approve" ? "#28a745" : "#dc3545"
          }; color:white; font-weight:bold;">
            Xác nhận ${data.action === "approve" ? "Duyệt" : "Từ chối"}
          </button>
        </form>
      </body>
    </html>
    `,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = body.token;

  if (!token)
    return new Response(JSON.stringify({ error: "Missing token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

  const data = verifyActionToken(token);
  if (!data)
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

  return await handleAction(token, data, req);
}

function renderEmailActionPage({
  title,
  message,
  buttonText,
  buttonUrl,
  success = true,
}: {
  title: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
  success?: boolean;
}) {
  const color = success ? "#28a745" : "#dc3545";
  const icon = success ? "✅" : "❌";

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f4f4f7;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      background: #fff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 90%;
      text-align: center;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 16px;
    }
    p {
      font-size: 16px;
      margin-bottom: 24px;
      color: #555;
    }
    a.button {
      display: inline-block;
      padding: 14px 28px;
      font-size: 16px;
      font-weight: bold;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      background-color: ${color};
      transition: background 0.3s;
    }
    a.button:hover {
      background-color: ${success ? "#218838" : "#c82333"};
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${buttonUrl}" class="button">${buttonText}</a>
  </div>
</body>
</html>
`;
}

// --- helper ---
async function handleAction(
  token: string,
  data: ReturnType<typeof verifyActionToken>,
  req: NextRequest
) {
  try {
    const fresh = await prisma.emailActionToken.findUnique({
      where: { token },
    });
    if (!fresh)
      return new Response(JSON.stringify({ error: "Token not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    if (fresh.usedAt)
      return new Response(JSON.stringify({ error: "Token đã được sử dụng" }), {
        status: 410,
        headers: { "Content-Type": "application/json" },
      });

    let result;

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (data.role === "signer") {
      result = await ProposalService.signProposal(
        data.proposalId,
        data.actorId,
        data.action === "approve" ? "approved" : "rejected"
      );
    } else {
      result = await ProposalService.approveProposal(
        data.proposalId,
        data.actorId,
        data.action === "approve" ? "approved" : "rejected"
      );
    }

    await prisma.emailActionToken.update({
      where: { token },
      data: {
        usedAt: new Date(),
        ip: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "",
      },
    });

    const ok = result?.success ?? true;
    return new Response(
      renderEmailActionPage({
        title: ok ? "Thành công" : "Thất bại",
        message: ok
          ? "Thực hiện thành công."
          : result?.message || "Không thể thực hiện action.",
        buttonText: "Trở về hệ thống",
        buttonUrl: process.env.NEXT_PUBLIC_APP_URL || "/",
        success: ok,
      }),
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=UTF-8" },
      }
    );
  } catch (err) {
    console.error("[email-action] error", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
