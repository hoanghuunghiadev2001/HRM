import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendEmail } from "@/lib/mail";

function generateRandomPassword(length = 10) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "!@#$%^&*()_+";
  const all = upper + lower + numbers + specials;

  if (length < 4) {
    throw new Error("Độ dài mật khẩu phải >= 4 để đảm bảo đủ các loại ký tự");
  }

  // Chọn ít nhất 1 ký tự mỗi loại
  let password = "";
  password += upper.charAt(Math.floor(Math.random() * upper.length));
  password += lower.charAt(Math.floor(Math.random() * lower.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specials.charAt(Math.floor(Math.random() * specials.length));

  // Phần còn lại lấy ngẫu nhiên từ tất cả
  for (let i = 4; i < length; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }

  // Xáo trộn chuỗi để không bị theo thứ tự cố định
  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return password;
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive } = body;

    if (typeof id !== "number" || typeof isActive !== "boolean") {
      return NextResponse.json(
        { message: "Invalid id or isActive" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        contactInfo: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    if (isActive === true) {
      const email = employee.contactInfo?.email;
      if (!email) {
        return NextResponse.json(
          { message: "Cannot activate: employee has no email", status: 2 },
          { status: 400 }
        );
      }

      const newPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.employee.update({
        where: { id },
        data: {
          isActive: true,
          password: hashedPassword,
        },
      });

      await sendEmail({
        to: [email],
        subject: "Your account has been activated",
        html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #2E86C1;">Thông báo kích hoạt tài khoản</h2>
    <p>Xin chào <strong>${employee.name}</strong>,</p>
    <p>Tài khoản của bạn đã được <span style="color: green; font-weight: bold;">kích hoạt thành công</span>.</p>
    <p>Mật khẩu mới của bạn là:</p>
    <p style="font-size: 24px; font-weight: bold; color: #D35400; background: #FDEBD0; padding: 10px 15px; border-radius: 5px; display: inline-block;">${newPassword}</p>
    <p>Vui lòng đăng nhập và đổi mật khẩu để bảo mật thông tin.</p>
    <hr style="margin: 20px 0;" />
    <p style="font-size: 12px; color: #888;">Nếu bạn không yêu cầu thay đổi này, vui lòng liên hệ bộ phận hỗ trợ ngay lập tức.</p>
    <p style="font-size: 12px; color: #888;">HRM Team</p>
  </div>
`,
      });

      return NextResponse.json(
        { message: "Employee activated and password sent" },
        { status: 200 }
      );
    } else {
      // Deactivate
      await prisma.employee.update({
        where: { id },
        data: {
          isActive: false,
        },
      });
      return NextResponse.json(
        { message: "Employee deactivated" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("❌ Error updating isActive:", error);
    return NextResponse.json(
      { message: "Failed to update isActive" },
      { status: 500 }
    );
  }
}
