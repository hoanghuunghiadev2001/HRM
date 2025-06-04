import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";

function generateStrongPassword(length = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  return Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map((x) => charset[x % charset.length])
    .join("");
}

export async function POST(req: Request) {
  const { employeeCode } = await req.json();

  if (!employeeCode) {
    return NextResponse.json(
      { error: "employeeCode is required" },
      { status: 400 }
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { employeeCode },
    include: { contactInfo: true },
  });

  if (!employee || !employee.contactInfo?.email) {
    return NextResponse.json(
      { error: "Employee or email not found" },
      { status: 404 }
    );
  }

  const newPassword = generateStrongPassword();
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.employee.update({
    where: { id: employee.id },
    data: { password: hashedPassword },
  });

  // Gửi email
  await sendEmail({
    to: [employee.contactInfo.email],
    subject: "Thay đổi mật khẩu",
    html: `
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #2E86C1;">Thông báo kích hoạt tài khoản</h2>
      <p>Xin chào <strong>${employee.name}</strong>,</p>
      <p>Tài khoản của bạn đã được <span style="color: green; font-weight: bold;">kích hoạt thành công</span>.</p>
      <p>Mật khẩu mới của bạn là:</p>
      <p style="font-size: 24px; font-weight: bold; color: #D35400; background: #FDEBD0; padding: 10px 15px; border-radius: 5px; display: inline-block;">
        ${newPassword}
      </p>
      <p>Vui lòng đăng nhập và đổi mật khẩu để bảo mật thông tin.</p>
      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">Nếu bạn không yêu cầu thay đổi này, vui lòng liên hệ bộ phận hỗ trợ ngay lập tức.</p>
      <p style="font-size: 12px; color: #888;">HRM Team</p>
    </div>
`,
  });

  return NextResponse.json({
    message: "Password reset and email sent successfully",
    employeeCode,
  });
}
