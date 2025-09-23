// /app/api/leave/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/** Tạo email khi bị từ chối */
function generateRejectionEmail(
  employeeName: string,
  approvers: { name: string; approvedAt: Date }[],
  leaveRequestId: number
) {
  const approvedListHtml = approvers.length
    ? `<ul style="padding-left: 20px; color: #444;">
        ${approvers
          .map(
            (a) =>
              `<li><strong>${a.name}</strong> – ${dayjs(a.approvedAt)
                .tz("Asia/Ho_Chi_Minh")
                .format("DD/MM/YYYY HH:mm")}</li>`
          )
          .join("")}
       </ul>`
    : `<p style="font-style: italic; color: #888;">Không có người nào duyệt trước đó</p>`;

  return `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; padding: 24px; background-color: #fffbe6; border: 1px solid #f0c14b; border-radius: 8px; max-width: 600px; margin: auto; color: #333;">
      <h2 style="color: #d32f2f; margin-bottom: 8px;">❌ Đơn nghỉ phép bị từ chối</h2>
      <p style="font-size: 16px;">Xin chào <strong>${employeeName}</strong>,</p>
      <p style="font-size: 15px;">Đơn nghỉ phép <strong>#${leaveRequestId}</strong> của bạn đã bị <span style="color: #d32f2f;"><strong>từ chối</strong></span>.</p>
      
      <div style="margin-top: 20px;">
        <h3 style="color: #555; margin-bottom: 6px;">🔍 Người đã duyệt trước:</h3>
        ${approvedListHtml}
      </div>

      <p style="margin-top: 24px; font-size: 15px;">Vui lòng liên hệ quản lý để biết thêm chi tiết.</p>

      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #999;">📧 Email được gửi tự động từ hệ thống quản lý đơn nghỉ.</p>
    </div>
  `;
}

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

    const body = await req.json();
    const {
      leaveRequestId,
      status,
      approvedByName,
      notifyAllCompany,
      notifyDepartmentId,
    } = body;

    if (
      typeof leaveRequestId !== "number" ||
      !["approved", "rejected"].includes(status)
    ) {
      return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
    }

    const approverId = decoded.id;
    const approve = status === "approved";

    // Tìm stepApprover đang chờ của người này
    const stepApprover = await prisma.leaveApprovalStepApprover.findFirst({
      where: {
        approverId,
        status: "pending",
        leaveApprovalStep: { leaveRequestId },
      },
      include: { leaveApprovalStep: true },
    });

    if (!stepApprover) {
      return NextResponse.json(
        { message: "Không tìm thấy bước duyệt đang chờ cho người duyệt này" },
        { status: 404 }
      );
    }

    // Nếu từ chối
    if (!approve) {
      await prisma.$transaction(async (tx) => {
        await tx.leaveApprovalStepApprover.update({
          where: { id: stepApprover.id },
          data: { status: "rejected", approvedAt: new Date() },
        });

        await tx.leaveRequest.update({
          where: { id: leaveRequestId },
          data: {
            status: "rejected",
            approvedBy: approvedByName,
            approvedAt: new Date(),
          },
        });
      });

      // Lấy thông tin đơn để gửi email
      const leaveRequest = await prisma.leaveRequest.findUnique({
        where: { id: leaveRequestId },
        include: { employee: { include: { contactInfo: true } } },
      });

      if (!leaveRequest) return NextResponse.json({ message: "Không tìm thấy đơn nghỉ" }, { status: 404 });

      // Ai đã duyệt trước đó
      const approvedApprovers = await prisma.leaveApprovalStepApprover.findMany({
        where: {
          leaveApprovalStep: { leaveRequestId },
          status: "approved",
        },
        include: { approver: true },
      });

      const approversList = approvedApprovers.map((a) => ({
        name: a.approver.name,
        approvedAt: a.approvedAt!,
      }));

      if (leaveRequest.employee.contactInfo?.email) {
        await sendEmail({
          to: [leaveRequest.employee.contactInfo.email],
          subject: `Đơn nghỉ phép #${leaveRequestId} bị từ chối`,
          html: generateRejectionEmail(
            leaveRequest.employee.name,
            approversList,
            leaveRequestId
          ),
        });
      }

      return NextResponse.json({ message: "Đơn đã bị từ chối" });
    }

    // Nếu duyệt
    const currentStep = await prisma.$transaction(async (tx) => {
      await tx.leaveApprovalStepApprover.update({
        where: { id: stepApprover.id },
        data: { status: "approved", approvedAt: new Date() },
      });

      return tx.leaveApprovalStep.update({
        where: { id: stepApprover.leaveApprovalStepId },
        data: { status: "approved", approvedAt: new Date() },
      });
    });

    // Kiểm tra step tiếp theo
    const nextStep = await prisma.leaveApprovalStep.findFirst({
      where: {
        leaveRequestId,
        status: "pending",
        level: { gt: currentStep.level },
      },
      orderBy: { level: "asc" },
      include: {
        approvers: {
          include: {
            approver: {
              include: {
                contactInfo: true,
                workInfo: { include: { department: true } },
              },
            },
          },
        },
      },
    });

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        employee: {
          include: {
            contactInfo: true,
            workInfo: { include: { position: true, department: true } },
          },
        },
      },
    });

    if (!leaveRequest) return NextResponse.json({ message: "Không tìm thấy đơn nghỉ" }, { status: 404 });

    if (nextStep) {
      // Có step tiếp theo → gửi mail cho approver tiếp theo
      const requesterDeptId = leaveRequest.employee.workInfo?.departmentId;
      const filteredApprovers = nextStep.approvers.filter((a) => {
        if ([2, 3, 4].includes(nextStep.level)) {
          return a.approver.workInfo?.departmentId === requesterDeptId;
        }
        return true;
      });

      for (const approverRel of filteredApprovers) {
        const email = approverRel.approver.contactInfo?.email;
        if (!email) continue;

        const startVN = dayjs(leaveRequest.startDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");
        const endVN = dayjs(leaveRequest.endDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");

        await sendEmail({
          to: [email],
          subject: `Bạn có đơn nghỉ phép cần duyệt #${leaveRequestId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
              <p>Xin chào <strong>${approverRel.approver.name}</strong>,</p>
              <p>Bạn có một đơn nghỉ phép mới cần phê duyệt:</p>
              <ul>
                <li><b>Nhân viên:</b> ${leaveRequest.employee.name}</li>
                <li><b>Thời gian:</b> ${startVN} đến ${endVN}</li>
                <li><b>Lý do:</b> ${leaveRequest.reason}</li>
              </ul>
            </div>
          `,
        });
      }
    } else {
      // Không còn step nào → duyệt hoàn toàn
      await prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: { status: "approved", approvedBy: approvedByName, approvedAt: new Date() },
      });

      const startVN = dayjs(leaveRequest.startDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");
      const endVN = dayjs(leaveRequest.endDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");

      if (leaveRequest.employee.contactInfo?.email) {
        await sendEmail({
          to: [leaveRequest.employee.contactInfo.email],
          subject: `✅ Đơn nghỉ phép #${leaveRequestId} đã được duyệt`,
          html: `<p>Xin chào ${leaveRequest.employee.name}, đơn nghỉ phép #${leaveRequestId} đã được duyệt thành công (${startVN} - ${endVN}).</p>`,
        });
      }

      // Nếu có thông báo toàn công ty hoặc phòng ban
      if (notifyAllCompany) {
        const allEmployees = await prisma.employee.findMany({ include: { contactInfo: true } });
        const emails = allEmployees.map((e) => e.contactInfo?.email).filter(Boolean) as string[];
        if (emails.length) {
          await sendEmail({
            to: emails,
            subject: `📢 Thông báo nghỉ phép: ${leaveRequest.employee.workInfo?.position?.name} - ${leaveRequest.employee.name}`,
            html: `<p>Nhân viên ${leaveRequest.employee.name} đã được duyệt nghỉ (${startVN} - ${endVN}).</p>`,
          });
        }
      }

      if (notifyDepartmentId) {
        const deptEmployees = await prisma.employee.findMany({
          where: { workInfo: { departmentId: notifyDepartmentId } },
          include: { contactInfo: true },
        });
        const emails = deptEmployees.map((e) => e.contactInfo?.email).filter(Boolean) as string[];
        if (emails.length) {
          await sendEmail({
            to: emails,
            subject: `📢 Thông báo nghỉ phép: ${leaveRequest.employee.workInfo?.position?.name} - ${leaveRequest.employee.name}`,
            html: `<p>Nhân viên ${leaveRequest.employee.name} đã được duyệt nghỉ (${startVN} - ${endVN}).</p>`,
          });
        }
      }
    }

    return NextResponse.json({ message: "Duyệt đơn thành công" });
  } catch (error) {
    console.error("Lỗi duyệt đơn nghỉ phép:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
