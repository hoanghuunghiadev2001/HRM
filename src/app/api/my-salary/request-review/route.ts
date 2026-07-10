/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Thêm import cookies nếu chưa có
import { sendEmail } from "@/lib/mail";
import { verifyToken } from "@/lib/auth"; // Giả định đường dẫn verifyToken của bạn
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra Token authentication trước
    const cookieStore = await cookies();
    const token = cookieStore.get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Thiếu token xác thực" },
        { status: 401 },
      );
    }

    // Xác thực token và lấy thông tin user
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc hết hạn" },
        { status: 401 },
      );
    }

    // 2. Lấy thông tin từ body (chỉ lấy các thông tin nhập từ form)
    const body = await req.json();
    const month = body.month || "N/A";
    const year = body.year || "N/A";
    const reason = body.reason || "Không có nội dung chi tiết";

    // 3. Lấy thông tin nhân viên trực tiếp từ Token đã verify

    if (!user) {
      return NextResponse.json(
        { error: "Token không hợp lệ" },
        { status: 401 },
      );
    }

    // 1. Tìm thông tin nhân viên trong DB bằng user.id lấy từ token
    const employee = await prisma.employee.findUnique({
      // Thay bằng hàm query DB thực tế của bạn (Prisma, Mongoose, SQL...)
      where: { id: user.id },
      select: {
        name: true,
        employeeCode: true,
        workInfo: {
          select: {
            position: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Không tìm thấy nhân viên" },
        { status: 404 },
      );
    }

    // 2. Lấy thông tin từ DB để gửi mail
    const employeeName = employee.name || "Nhân viên hệ thống";
    const employeeCode = employee.employeeCode || "Chưa cập nhật";
    const position = employee.workInfo?.position?.name || "Chưa cập nhật";

    // 4. Tiến hành gửi mail
    await sendEmail({
      to: ["dao.tta@toyotabinhduong.com.vn"],
      subject: `[HRM] YÊU CẦU RÀ SOÁT LƯƠNG - ${employeeName.toUpperCase()}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 20px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; overflow: hidden; color: #1a1a1a;">
          
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 20px; text-align: center;">
            <div style="color: #60a5fa; font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Human Resources Management</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 300; letter-spacing: 0.5px;">Yêu Cầu Rà Soát Lương</h1>
          </div>

          <div style="padding: 40px;">
            <p style="font-size: 15px; color: #64748b; margin-bottom: 24px;">Kính gửi bộ phận Nhân sự,</p>
            
            <p style="font-size: 15px; line-height: 1.6; margin-bottom: 30px;">Hệ thống ghi nhận một đề nghị rà soát thông tin thu nhập từ nhân viên với các chi tiết sau:</p>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
              <div style="margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: flex; justify-content: space-between;">
                <span style="color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Nhân viên</span>
                <span style="font-size: 14px; font-weight: 700; color: #1e293b;">${employeeName} (${employeeCode})</span>
              </div>
              <div style="padding-top: 8px; display: flex; justify-content: space-between;">
                <span style="color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Vị trí</span>
                <span style="font-size: 14px; font-weight: 700; color: #1e293b;">${position}</span>
              </div>
              <div style="padding-top: 8px; display: flex; justify-content: space-between;">
                <span style="color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Kỳ lương</span>
                <span style="font-size: 14px; font-weight: 700; color: #2563eb;">Tháng ${month} / ${year}</span>
              </div>
            </div>

            <div style="margin-bottom: 35px;">
              <h4 style="font-size: 13px; font-weight: 800; color: #ef4444; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px;">Nội dung đề nghị:</h4>
              <div style="font-size: 15px; line-height: 1.7; color: #475569; padding: 20px; background-color: #fff1f2; border-radius: 12px; border-left: 4px solid #ef4444; font-style: italic;">
                "${reason}"
              </div>
            </div>

            <div style="text-align: center;">
              <a href="#" style="background-color: #1e293b; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block;">TRUY CẬP HỆ THỐNG</a>
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">© 2026 Toyota Bình Dương - HRM Automated Mail System</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Lỗi gửi mail rà soát:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
