import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail"; // Import hàm sendEmail

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      name: string;
      role: string;
    };

    if (!["ADMIN", "MANAGER"].includes(decoded.role)) {
      return NextResponse.json(
        { message: "Không có quyền phê duyệt" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { leaveRequestId, status, approvedBy } = body;

    if (!leaveRequestId || !status || !approvedBy) {
      return NextResponse.json(
        { message: "Thiếu dữ liệu bắt buộc" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { message: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    // Lấy thông tin đơn nghỉ và nhân viên
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        employee: {
          include: {
            contactInfo: true, // Nạp thêm thông tin liên hệ
          },
        },
      },
    });

    if (!leaveRequest || !leaveRequest.employee) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ" },
        { status: 404 }
      );
    }

    // Cập nhật đơn nghỉ
    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status,
        approvedBy,
        approvedAt: new Date(),
      },
    });

    const statusColor = status === "approved" ? "#28a745" : "#dc3545"; // Màu xanh lá hoặc đỏ

    await sendEmail({
      to: [leaveRequest.employee.contactInfo?.email ?? ""],
      subject: `Kết quả đơn nghỉ phép #${leaveRequestId}`,
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
      <h2 style="color: #4a90e2; text-align: center;">Thông báo kết quả đơn nghỉ phép</h2>
      <p>Xin chào <strong>${leaveRequest.employee.name}</strong>,</p>
      <p>Đơn nghỉ phép của bạn đã được xử lý với kết quả như sau:</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; background: #f0f0f0;">Trạng thái</td>
          <td style="padding: 8px; color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${
        status === "approved" ? "Phê duyệt" : "Từ chối"
      }</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; background: #f0f0f0;">Ngày nghỉ</td>
          <td style="padding: 8px;">${leaveRequest.startDate?.toLocaleDateString(
            "vi-VN"
          )} đến ${leaveRequest.endDate?.toLocaleDateString("vi-VN")}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; background: #f0f0f0;">Lý do</td>
          <td style="padding: 8px;">${leaveRequest.reason}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; background: #f0f0f0;">Phê duyệt bởi</td>
          <td style="padding: 8px;">${approvedBy}</td>
        </tr>
      </table>

      <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết.</p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${
          process.env.NEXT_PUBLIC_API_URL
        }dashboard/request" style="display: inline-block; padding: 10px 20px; background: #4a90e2; color: #fff; text-decoration: none; border-radius: 4px;">Truy cập hệ thống</a>
      </div>

      <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center; font-style: italic">
        Email được gửi tự động từ hệ thống HRM. Vui lòng không trả lời email này.
      </p>
    </div>
  `,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Approve leave request error:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
