// lib/mail.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}) {
  return transporter.sendMail({
    from: `HRM <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
