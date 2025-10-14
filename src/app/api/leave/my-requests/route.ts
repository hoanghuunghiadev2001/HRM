/* eslint-disable @typescript-eslint/no-unused-vars */
// /app/api/leave/my-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { sendEmail } from "@/lib/mail";

dayjs.extend(utc);
dayjs.extend(timezone);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET: Lấy danh sách đơn nghỉ phép của chính user
// GET: Lấy danh sách đơn nghỉ phép của chính user
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((c) => c.trim().split("="))
        .map(([k, v]) => [k, decodeURIComponent(v)])
    );
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { employeeId: decoded.id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            avatar: true,
            workInfo: { select: { department: true, position: true } },
            contactInfo: true,
          },
        },
        approvalSteps: {
          include: {
            approvers: {
              include: {
                approver: {
                  select: {
                    id: true,
                    name: true,
                    employeeCode: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 🔹 Build thêm approvalHistory và approversSummary
    const enriched = leaveRequests.map((leave) => {
      const approvalHistory = leave.approvalSteps
        .flatMap((step) =>
          step.approvers.map((a) => ({
            stepId: step.id,
            level: step.level,
            status: step.status,
            approvedAt: step.approvedAt,

            approverId: a.approver?.id,
            name: a.approver?.name,
            employeeCode: a.approver?.employeeCode,
            approverStatus: a.status,
            approverApprovedAt: a.approvedAt,
          }))
        )
        .sort((a, b) => a.level - b.level);

      const approversSummary = approvalHistory
        .map(
          (h) =>
            `${h.name} (${h.employeeCode}) - ${
              h.approverStatus === "approved"
                ? "Đã duyệt"
                : h.approverStatus === "rejected"
                ? "Từ chối"
                : h.approverStatus === "revoked"
                ? "Thu hồi"
                : "Đang chờ"
            }`
        )
        .join("; ");

      return {
        ...leave,
        approvalHistory,
        approversSummary,
      };
    });

    return NextResponse.json(enriched, { status: 200 });
  } catch (error) {
    console.error("Lỗi token hoặc truy vấn:", error);
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 }
    );
  }
}

// PUT: Thu hồi đơn nghỉ phép
export async function PUT(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((c) => c.trim().split("="))
        .map(([k, v]) => [k, decodeURIComponent(v)])
    );
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ message: "Không có token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    const body = await req.json();
    const { leaveRequestId } = body;

    if (!leaveRequestId) {
      return NextResponse.json(
        { message: "Thiếu leaveRequestId" },
        { status: 400 }
      );
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        employee: { select: { id: true, name: true, contactInfo: true } },
        approvalSteps: {
          include: {
            approvers: {
              include: {
                approver: {
                  select: { id: true, name: true, contactInfo: true },
                },
              },
            },
          },
        },
      },
    });

    if (!leave) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ phép" },
        { status: 404 }
      );
    }

    // if (leave.employeeId !== userId) {
    //   return NextResponse.json({ message: "Bạn không có quyền thu hồi đơn này" }, { status: 403 });
    // }

    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const startDate = dayjs.utc(leave.startDate).tz("Asia/Ho_Chi_Minh");

    if (now.isAfter(startDate)) {
      return NextResponse.json(
        { message: "Không thể thu hồi đơn vì đã tới ngày nghỉ" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái thành revoked
    const revokedLeave = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: { status: "revoked" },
    });

    // Lấy danh sách email người đã duyệt
    const approverEmails = leave.approvalSteps
      .flatMap((step) => step.approvers)
      .map((a) => a.approver?.contactInfo?.email)
      .filter(Boolean) as string[];

    // Gửi mail thông báo
    if (approverEmails.length > 0) {
      const employeeName = leave.employee?.name || "Nhân viên";
      const startVN = startDate.format("DD/MM/YYYY HH:mm");
      const endVN = dayjs
        .utc(leave.endDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm");

      await sendEmail({
        to: approverEmails,
        subject: `Thông báo: Đơn nghỉ phép của ${employeeName} đã bị thu hồi`,
        html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2F54EB;">Thông báo thu hồi đơn nghỉ phép</h2>
      <p>Xin chào,</p>
      <p>Đơn nghỉ phép của <strong>${employeeName}</strong> đã bị <span style="color: #EB2128; font-weight: bold;">thu hồi</span>.</p>
      <table style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 6px 12px; font-weight: bold; border: 1px solid #ccc;">Ngày bắt đầu</td>
          <td style="padding: 6px 12px; border: 1px solid #ccc;">${startVN}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px; font-weight: bold; border: 1px solid #ccc;">Ngày kết thúc</td>
          <td style="padding: 6px 12px; border: 1px solid #ccc;">${endVN}</td>
        </tr>
      </table>
      <p>Vui lòng cập nhật thông tin công việc và điều chỉnh kế hoạch nếu cần.</p>
      <p style="margin-top: 20px; color: #555; font-size: 0.9em;">Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
  `,
      });
    }

    return NextResponse.json({
      message: "Thu hồi thành công",
      data: revokedLeave,
    });
  } catch (error) {
    console.error("Lỗi khi thu hồi đơn nghỉ phép:", error);
    return NextResponse.json({ message: "Thu hồi thất bại" }, { status: 500 });
  }
}
