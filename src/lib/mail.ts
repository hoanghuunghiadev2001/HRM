/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Gửi email an toàn, có log + retry
 */
export async function sendEmail({
  to,
  subject,
  html,
  retry = 3,
}: {
  to: string[];
  subject: string;
  html: string;
  retry?: number;
}) {
  const mailOptions = {
    from: `HRM <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Sent] ${subject} → ${to.join(", ")}`);
    return info;
  } catch (error: any) {
    console.error(
      `❌ [Email Error] ${subject} → ${to.join(", ")}:`,
      error?.message || error
    );

    // Retry cơ bản nếu gặp lỗi tạm thời (mạng, Gmail giới hạn, timeout...)
    if (retry > 0) {
      console.log(`🔁 Retry sending email... (${retry} left)`);
      await new Promise((r) => setTimeout(r, 1500)); // đợi 1.5s rồi gửi lại
      return sendEmail({ to, subject, html, retry: retry - 1 });
    }

    // Nếu retry hết mà vẫn lỗi
    console.error("🚨 [Email Failed Permanently]");
    throw error;
  }
}
