// app/api/leaveRequests/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { differenceInCalendarDays } from "date-fns";
import { LeaveStatus } from "../../../../../generated/prisma";
import { sendEmail } from "@/lib/mail";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Hàm gửi mail đẹp mắt
async function sendLeaveRequestEmail({
  to,
  subject,
  employeeName,
  employeeCode,
  department,
  position,
  leaveType,
  startDate,
  endDate,
  totalHours,
  reason,
  action = "new",
  detailUrl = process.env.detailUrlRequest || "#",
}: {
  to: string[];
  subject: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  reason: string;
  action?: "new" | "approved" | "rejected";
  detailUrl?: string;
}) {
  let title = "";
  let message = "";

  switch (action) {
    case "new":
      title = "📌 Đơn nghỉ phép mới";
      message = `Bạn có đơn nghỉ phép mới cần phê duyệt.`;
      break;
    case "approved":
      title = "✅ Đơn nghỉ phép đã được duyệt";
      message = `Đơn nghỉ phép của bạn đã được duyệt.`;
      break;
    case "rejected":
      title = "⛔ Đơn nghỉ phép bị từ chối";
      message = `Đơn nghỉ phép của bạn đã bị từ chối.`;
      break;
  }

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e0e0e0; border-radius:10px; background:#f9f9f9;">
    <h2 style="color:#2a8af6; margin-bottom:10px;">${title}</h2>
    <p style="font-size:14px; margin-bottom:20px;">${message}</p>

    <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
      <tr>
        <td style="font-weight:bold; padding:6px 8px; border:1px solid #ddd;">Nhân viên</td>
        <td style="padding:6px 8px; border:1px solid #ddd;">${employeeName} (${employeeCode})</td>
      </tr>
      <tr>
        <td style="font-weight:bold; padding:6px 8px; border:1px solid #ddd;">Bộ phận</td>
        <td style="padding:6px 8px; border:1px solid #ddd;">${department}</td>
      </tr>
      <tr>
        <td style="font-weight:bold; padding:6px 8px; border:1px solid #ddd;">Chức vụ</td>
        <td style="padding:6px 8px; border:1px solid #ddd;">${position}</td>
      </tr>
      <tr>
        <td style="font-weight:bold; padding:6px 8px; border:1px solid #ddd;">Loại phép</td>
        <td style="padding:6px 8px; border:1px solid #ddd;">${leaveType}</td>
      </tr>
      <tr>
        <td style="font-weight:bold; padding:6px 8px; border:1px solid #ddd;">Thời gian</td>
        <td style="padding:6px 8px; border:1px solid #ddd;">${startDate} - ${endDate}</td>
      </tr>
      <tr>
        <td style="font-weight:bold; padding:6px 8px; border:1px solid #ddd;">Tổng giờ</td>
        <td style="padding:6px 8px; border:1px solid #ddd;">${totalHours} tiếng</td>
      </tr>
      <tr>
        <td style="font-weight:bold; padding:6px 8px; border:1px solid #ddd;">Lý do</td>
        <td style="padding:6px 8px; border:1px solid #ddd;">${reason || "Không có"}</td>
      </tr>
    </table>

    <div style="text-align:center; margin-top:20px;">
      <a href="${detailUrl}" style="background:#2a8af6; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; display:inline-block;">Xem chi tiết</a>
    </div>

    <p style="font-size:12px; color:#999; margin-top:20px;">Đây là email tự động từ hệ thống HRM, vui lòng không trả lời trực tiếp.</p>
  </div>
  `;

  await sendEmail({ to, subject, html });
}

/**
 * 📌 Tạo đơn nghỉ phép
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      startDateTime,
      endDateTime,
      leaveType,
      reason,
      employeeId,
      totalHours,
      approverIds,
    } = body.payload;

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const totalDays = differenceInCalendarDays(end, start) + 1;

    if (totalDays <= 0)
      return NextResponse.json({ error: "Thời gian nghỉ không hợp lệ." }, { status: 400 });

    if (!approverIds?.length)
      return NextResponse.json({ error: "Cần chọn ít nhất một người duyệt." }, { status: 400 });

    const workInfo = await prisma.workInfo.findUnique({
      where: { employeeId },
      include: { department: true, position: true, employee: true },
    });

    if (!workInfo)
      return NextResponse.json({ error: "Không tìm thấy thông tin nhân viên." }, { status: 404 });

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        startDate: start,
        endDate: end,
        totalHours: Number(totalHours),
        leaveType,
        reason,
        status: LeaveStatus.pending,
      },
    });

    const createdSteps = [];
    for (let i = 0; i < approverIds.length; i++) {
      const approverId = approverIds[i];
      const step = await prisma.leaveApprovalStep.create({
        data: {
          leaveRequestId: leaveRequest.id,
          level: i + 1,
          status: LeaveStatus.pending,
          approvers: { create: { approverId, status: LeaveStatus.pending } },
        },
        include: { approvers: true },
      });
      createdSteps.push(step);
    }

    // Gửi mail cho người duyệt đầu tiên
    const firstStep = createdSteps[0];
    const firstApprover = await prisma.employee.findUnique({
      where: { id: firstStep.approvers[0].approverId },
      include: { contactInfo: true },
    });

    if (firstApprover?.contactInfo?.email) {
      await sendLeaveRequestEmail({
        to: [firstApprover.contactInfo.email],
        subject: `[Thông báo] Đơn nghỉ phép mới từ ${workInfo.employee?.name}`,
        employeeName: workInfo.employee?.name,
        employeeCode: workInfo.employee?.employeeCode,
        department: workInfo.department?.name || "",
        position: workInfo.position?.name || "",
        leaveType,
        startDate: dayjs(start).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm"),
        endDate: dayjs(end).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm"),
        totalHours: Number(totalHours),
        reason: reason || "",
        action: "new",
      });
    }

    return NextResponse.json({
      message: "Tạo đơn nghỉ phép thành công",
      leaveRequest,
      approvalSteps: createdSteps,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

/**
 * 📌 Phê duyệt/từ chối đơn nghỉ phép
 */
export async function PUT(req: Request) {
  try {
    const { stepId, approverId, decision } = await req.json();

    // Cập nhật trạng thái người duyệt
    await prisma.leaveApprovalStepApprover.updateMany({
      where: { leaveApprovalStepId: stepId, approverId },
      data: { status: decision as LeaveStatus },
    });

    const step = await prisma.leaveApprovalStep.findUnique({
      where: { id: stepId },
      include: { approvers: true, leaveRequest: true },
    });

    if (!step) return NextResponse.json({ error: "Không tìm thấy step." }, { status: 404 });

    const leaveRequest = step.leaveRequest;

    if (decision === LeaveStatus.rejected) {
      // Từ chối → cập nhật toàn bộ
      await prisma.leaveApprovalStep.update({ where: { id: step.id }, data: { status: LeaveStatus.rejected } });
      await prisma.leaveRequest.update({ where: { id: leaveRequest.id }, data: { status: LeaveStatus.rejected } });

      // Gửi mail thông báo từ chối
      const employee = await prisma.employee.findUnique({
        where: { id: leaveRequest.employeeId },
        include: { contactInfo: true, workInfo: { include: { department: true, position: true } } },
      });

      if (employee?.contactInfo?.email) {
        await sendLeaveRequestEmail({
          to: [employee.contactInfo.email],
          subject: "Đơn nghỉ phép bị từ chối",
          employeeName: employee.name,
          employeeCode: employee.employeeCode,
          department: employee.workInfo?.department?.name || "",
          position: employee.workInfo?.position?.name || "",
          leaveType: leaveRequest.leaveType,
          startDate: dayjs(leaveRequest.startDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm"),
          endDate: dayjs(leaveRequest.endDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm"),
          totalHours: leaveRequest.totalHours ?? 0,
          reason: leaveRequest.reason || "",
          action: "rejected",
        });
      }

      return NextResponse.json({ message: "Đơn đã bị từ chối." });
    }

    // Nếu approved → cập nhật step
    await prisma.leaveApprovalStep.update({ where: { id: step.id }, data: { status: LeaveStatus.approved } });

    // Tìm step tiếp theo
    const nextStep = await prisma.leaveApprovalStep.findFirst({
      where: { leaveRequestId: leaveRequest.id, level: step.level + 1 },
      include: { approvers: { include: { approver: { include: { contactInfo: true } } } } },
    });

    if (nextStep) {
      await prisma.leaveApprovalStep.update({ where: { id: nextStep.id }, data: { status: LeaveStatus.pending } });

      // Gửi mail cho approver tiếp theo
      const nextApprover = nextStep.approvers[0]?.approver;
      if (nextApprover?.contactInfo?.email) {
        await sendLeaveRequestEmail({
          to: [nextApprover.contactInfo.email],
          subject: "Đơn nghỉ phép cần phê duyệt",
          employeeName: leaveRequest.employeeId.toString(),
          employeeCode: leaveRequest.employeeId.toString(),
          department: "",
          position: "",
          leaveType: leaveRequest.leaveType,
          startDate: dayjs(leaveRequest.startDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm"),
          endDate: dayjs(leaveRequest.endDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm"),
          totalHours: leaveRequest.totalHours ?? 0,
          reason: leaveRequest.reason || "",
          action: "new",
        });
      }
    } else {
      // Nếu không còn step → request được duyệt hoàn toàn
      await prisma.leaveRequest.update({ where: { id: leaveRequest.id }, data: { status: LeaveStatus.approved } });

      const employee = await prisma.employee.findUnique({
        where: { id: leaveRequest.employeeId },
        include: { contactInfo: true, workInfo: { include: { department: true, position: true } } },
      });

      if (employee?.contactInfo?.email) {
        await sendLeaveRequestEmail({
          to: [employee.contactInfo.email],
          subject: "Đơn nghỉ phép đã được duyệt",
          employeeName: employee.name,
          employeeCode: employee.employeeCode,
          department: employee.workInfo?.department?.name || "",
          position: employee.workInfo?.position?.name || "",
          leaveType: leaveRequest.leaveType,
          startDate: dayjs(leaveRequest.startDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm"),
          endDate: dayjs(leaveRequest.endDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm"),
          totalHours: leaveRequest.totalHours ?? 0,
          reason: leaveRequest.reason || "",
          action: "approved",
        });
      }
    }

    return NextResponse.json({ message: "Cập nhật quyết định thành công" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
