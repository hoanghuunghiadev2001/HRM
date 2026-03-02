/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Lấy thông tin cơ bản
    const employeeName = body.employeeName || "Nhân viên hệ thống";
    const employeeCode = body.employeeCode || "Chưa cập nhật";
    const month = body.month || "N/A";
    const year = body.year || "N/A";
    const position = body.position || "Chưa cập nhật";
    const reason = body.reason || "Không có nội dung chi tiết";

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
