/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/leave/create-requests/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { differenceInCalendarDays } from "date-fns";
import { LeaveStatus } from "../../../../../generated/prisma";
import { sendEmail } from "@/lib/mail";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { FileService } from "@/lib/file-service";

dayjs.extend(utc);
dayjs.extend(timezone);

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
  to: string[] | string;
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
  const toArr = Array.isArray(to) ? to : [to];

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
        <td style="padding:6px 8px; border:1px solid #ddd;">${
          reason || "Không có"
        }</td>
      </tr>
    </table>

    <div style="text-align:center; margin-top:20px;">
      <a href="${detailUrl}" style="background:#2a8af6; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; display:inline-block;">Xem chi tiết</a>
    </div>

    <p style="font-size:12px; color:#999; margin-top:20px;">Đây là email tự động từ hệ thống HRM, vui lòng không trả lời trực tiếp.</p>
  </div>
  `;

  await sendEmail({ to: toArr, subject, html });
}

/**
 * POST - Tạo đơn nghỉ phép (nhận FormData: "data" = JSON string, optional "handoverFile")
 */
export async function POST(req: Request) {
  try {
    // parse FormData
    const form = await req.formData();

    // Expect "data" contains JSON string like: JSON.stringify({ payload: {...} })
    const dataRaw = form.get("data");
    if (!dataRaw) {
      return NextResponse.json(
        { error: "Missing data payload" },
        { status: 400 }
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(String(dataRaw));
    } catch (e) {
      // sometimes frontend may send JSON directly as stringified payload without wrapper
      try {
        parsed = JSON.parse(String(dataRaw).replace(/^\-+/, ""));
      } catch (err) {
        console.error("Failed to parse data field:", String(dataRaw));
        return NextResponse.json(
          { error: "Invalid data payload" },
          { status: 400 }
        );
      }
    }

    const payload = parsed.payload ?? parsed; // support both { payload: {...} } and raw payload
    const {
      startDateTime,
      endDateTime,
      leaveType,
      reason,
      employeeId,
      totalHours,
      approverIds,
    } = payload;

    // validate required fields
    if (!startDateTime || !endDateTime || !employeeId || !approverIds?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const totalDays = differenceInCalendarDays(end, start) + 1;
    if (totalDays <= 0) {
      return NextResponse.json(
        { error: "Thời gian nghỉ không hợp lệ." },
        { status: 400 }
      );
    }

    // Optional file handling
    const fileField = form.get("handoverFile") as File | null;
    let handoverFileId: number | null = null;

    if (fileField && (fileField as unknown as any).size > 0) {
      // validate file via service if available
      if (FileService && typeof FileService.validateFile === "function") {
        const { valid, error } = await FileService.validateFile(fileField);
        if (!valid) {
          return NextResponse.json(
            { error: error || "File không hợp lệ" },
            { status: 400 }
          );
        }
      }

      if (FileService && typeof FileService.uploadFile === "function") {
        // upload via your FileService (should return { fileId })
        const { fileId } = await FileService.uploadFile(fileField);
        handoverFileId = fileId ?? null;
      } else {
        // fallback: store directly in prisma.files (if your File model supports Bytes)
        try {
          const buffer = Buffer.from(await (fileField as any).arrayBuffer());
          const created = await prisma.file.create({
            data: {
              filename: (fileField as any).name || "uploaded",
              mimeType: (fileField as any).type || "application/octet-stream",
              fileSize: buffer.length,
              data: buffer,
            },
          });
          handoverFileId = created.id;
        } catch (err) {
          console.error("Fallback file save failed:", err);
          return NextResponse.json({ error: "Lỗi lưu file" }, { status: 500 });
        }
      }
    }

    // find workInfo for employee
    const workInfo = await prisma.workInfo.findUnique({
      where: { employeeId },
      include: { department: true, position: true, employee: true },
    });

    if (!workInfo) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin nhân viên." },
        { status: 404 }
      );
    }

    // create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        startDate: start,
        endDate: end,
        totalHours: Number(totalHours || 0),
        leaveType,
        reason,
        status: LeaveStatus.pending,
        handoverFileId: handoverFileId,
      },
    });

    // create approval steps
    const createdSteps: any[] = [];
    for (let i = 0; i < approverIds.length; i++) {
      const approverId = approverIds[i];
      const step = await prisma.leaveApprovalStep.create({
        data: {
          leaveRequestId: leaveRequest.id,
          level: i + 1,
          status: LeaveStatus.pending,
          approvers: {
            create: { approverId, status: LeaveStatus.pending },
          },
        },
        include: { approvers: true },
      });
      createdSteps.push(step);
    }

    // send mail to first approver (if exists)
    const firstStep = createdSteps[0];
    if (firstStep?.approvers?.[0]) {
      const firstApproverId = firstStep.approvers[0].approverId;
      const firstApprover = await prisma.employee.findUnique({
        where: { id: firstApproverId },
        include: { contactInfo: true },
      });
      if (firstApprover?.contactInfo?.email) {
        await sendLeaveRequestEmail({
          to: firstApprover.contactInfo.email,
          subject: `[Thông báo] Đơn nghỉ phép mới từ ${workInfo.employee?.name}`,
          employeeName: workInfo.employee?.name,
          employeeCode: workInfo.employee?.employeeCode,
          department: workInfo.department?.name || "",
          position: workInfo.position?.name || "",
          leaveType,
          startDate: dayjs(start)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm"),
          endDate: dayjs(end).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm"),
          totalHours: Number(totalHours || 0),
          reason: reason || "",
          action: "new",
          detailUrl: (process.env.detailUrlRequest || "") + "/allRequests",
        });
      }
    }

    return NextResponse.json({
      message: "Tạo đơn nghỉ phép thành công",
      leaveRequest,
      approvalSteps: createdSteps,
      handoverFileId,
    });
  } catch (error: any) {
    console.error("Create leave request error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
