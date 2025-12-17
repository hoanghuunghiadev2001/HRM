import { sendEmail } from "@/lib/mail";

/**
 * =========================================================
 *  NOTIFICATION MAILER – HRM ENTERPRISE GRADE
 * =========================================================
 */

export type NotificationType = "MAINTENANCE" | "SYSTEM" | "HR" | "SECURITY";

const THEME = {
  MAINTENANCE: {
    color: "#faad14",
    icon: "🔧",
    defaultTitle: "Thông báo bảo trì hệ thống",
  },
  SYSTEM: {
    color: "#1677ff",
    icon: "📢",
    defaultTitle: "Thông báo hệ thống",
  },
  HR: {
    color: "#52c41a",
    icon: "👥",
    defaultTitle: "Thông báo nhân sự",
  },
  SECURITY: {
    color: "#ff4d4f",
    icon: "🔒",
    defaultTitle: "Cảnh báo bảo mật",
  },
};

/**
 * Build HTML email (INLINE CSS – SAFE FOR GMAIL/OUTLOOK)
 */
function buildHtmlTemplate({
  type,
  title,
  message,
  startTime,
  endTime,
}: {
  type: NotificationType;
  title?: string;
  message: string;
  startTime?: Date | null;
  endTime?: Date | null;
}) {
  const theme = THEME[type];

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${title || theme.defaultTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">

          <!-- HEADER -->
          <tr>
            <td style="background:${
              theme.color
            };padding:20px 28px;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;font-weight:600;">
                ${theme.icon} ${title || theme.defaultTitle}
              </h1>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:28px;color:#1f2937;font-size:14px;line-height:1.7;">
              <p style="margin-top:0;">
                Kính gửi Anh/Chị,
              </p>

              <p>
                ${message.replace(/\n/g, "<br/>")}
              </p>

              ${
                startTime && endTime
                  ? `
                <div style="margin:20px 0;padding:14px 16px;background:#fafafa;border-left:4px solid ${
                  theme.color
                };border-radius:4px;">
                  <div style="font-weight:600;margin-bottom:6px;">⏰ Thời gian áp dụng</div>
                  <div>
                    ${startTime.toLocaleString("vi-VN")}<br/>
                    → ${endTime.toLocaleString("vi-VN")}
                  </div>
                </div>
              `
                  : ""
              }

              ${
                type === "MAINTENANCE"
                  ? `
                <div style="margin-top:16px;padding:12px;background:#fffbe6;border-radius:4px;color:#614700;">
                  ⚠ Trong thời gian bảo trì, hệ thống có thể tạm thời gián đoạn một số chức năng.
                  Rất mong Anh/Chị thông cảm.
                </div>
              `
                  : ""
              }

              <p style="margin-top:24px;">
                Trân trọng,<br/>
                <b>Phòng Công nghệ Thông tin</b>
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:16px 28px;background:#f9fafb;color:#6b7280;font-size:12px;">
              <div>
                Đây là email tự động từ hệ thống <b>HRM</b>.  
                Vui lòng không phản hồi email này.
              </div>
              <div style="margin-top:6px;">
                © ${new Date().getFullYear()} HRM System. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * =========================================================
 * SEND NOTIFICATION MAIL – SAFE BATCH SENDER
 * =========================================================
 */
export async function sendNotificationMail({
  emails,
  type,
  title,
  message,
  startTime,
  endTime,
}: {
  emails: string[];
  type: NotificationType;
  title?: string;
  message: string;
  startTime?: Date | null;
  endTime?: Date | null;
}) {
  if (!emails || emails.length === 0) return;

  const subject =
    type === "MAINTENANCE"
      ? "🔧 Thông báo bảo trì hệ thống HRM"
      : title || "📢 Thông báo từ hệ thống HRM";

  const html = buildHtmlTemplate({
    type,
    title,
    message,
    startTime,
    endTime,
  });

  // 👉 gửi theo batch tránh spam & timeout
  const BATCH_SIZE = 40;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    await sendEmail({
      to: batch,
      subject,
      html,
    });
  }
}
