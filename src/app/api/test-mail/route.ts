// app/api/test-mail/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    // 1. Cấu hình transporter (sử dụng Gmail hoặc SMTP server khác)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ví dụ: your.email@gmail.com
        pass: process.env.EMAIL_PASS, // App password từ Gmail hoặc SMTP password
      },
    });

    // 2. Tạo nội dung email
    const mailOptions = {
      from: `"HRM System" <${process.env.EMAIL_USER}>`,
      to: "nghia47407@donga.edu.vn", // hoặc nhiều email: "a@example.com, b@example.com"
      subject: "🔔 Test Gửi Email từ HRM",
      html: `<h2>Thành công!</h2><p>Email gửi từ hệ thống HRM.</p>`,
    };

    // 3. Gửi mail
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Đã gửi email test thành công" });
  } catch (error) {
    console.error("Lỗi gửi mail:", error);
    return NextResponse.json({ message: "Gửi mail thất bại" }, { status: 500 });
  }
}
