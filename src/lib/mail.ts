/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ưu tiên App Password nếu Gmail
  },
});

export async function sendEmail({
  to,
  bcc,
  cc,
  subject,
  html,
  retry = 3,
}: {
  to?: string[];
  bcc?: string[];
  cc?: string[];
  subject: string;
  html: string;
  retry?: number;
}) {
  const mailOptions = {
    from: `HRM <${process.env.EMAIL_USER}>`,
    to,
    bcc,
    cc,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error: any) {
    if (retry > 0) {
      await new Promise((r) => setTimeout(r, 1500));
      return sendEmail({ to, bcc, cc, subject, html, retry: retry - 1 });
    }

    throw error;
  }
}
