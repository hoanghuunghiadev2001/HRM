import { sendEmail } from "@/lib/mail";

/**
 * =========================================================
 *  NOTIFICATION MAILER – ENTERPRISE / CORPORATE STANDARD
 * =========================================================
 */

const COMPANY_FOOTER = `
<hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;" />

<div style="font-size:12px;line-height:1.6;color:#6b7280;">
  <p style="margin:0 0 6px 0; text-align:center; ">
    Đây là email <b>tự động</b> được gửi từ hệ thống quản lý nhân sự (HRM).
    Vui lòng <b>không phản hồi</b> email này.
  </p>

  <p style="margin:0 0 6px 0;">
    <b>CÔNG TY CỔ PHẦN TOYOTA BÌNH DƯƠNG</b><br/>
    Địa chỉ: Lô C13A đường Hùng Vương, P. Bình Dương, TP. Hồ Chí Minh<br/>
    Điện thoại: 1900 633 697 &nbsp;|&nbsp; Website: https://binhduong.toyota.com.vn/
  </p>

  <p style="margin:0; text-align:center; color:#9ca3af;">
    © ${new Date().getFullYear()} Toyota Bình Dương. All rights reserved.
  </p>
</div>
`;

/**
 * =========================================================
 * SEND MAIL – SAFE BATCH
 * =========================================================
 */
export async function sendNotificationMail({
  emails,
  subject,
  html,
  forceTo = false, // 👉 optional
}: {
  emails: string[];
  subject: string;
  html: string;
  forceTo?: boolean;
}) {
  if (!emails || emails.length === 0) return;

  const uniqueEmails = Array.from(new Set(emails));
  const BATCH_SIZE = 40;

  const finalHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f9fafb;">
  <div style="max-width:680px;margin:0 auto;padding:24px;background:#ffffff;">
    ${html}
    ${COMPANY_FOOTER}
  </div>
</body>
</html>
`;

  for (let i = 0; i < uniqueEmails.length; i += BATCH_SIZE) {
    const batch = uniqueEmails.slice(i, i + BATCH_SIZE);

    try {
      await sendEmail({
        to: forceTo ? batch : ["it@toyota.binhduong.vn"],
        bcc: !forceTo ? batch : ["it@toyota.binhduong.vn"],
        subject,
        html: finalHtml,
      });
    } catch (error) {
      console.error(`Send mail failed [${i} → ${i + batch.length}]:`, error);
    }
  }
}
