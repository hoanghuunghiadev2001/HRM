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

async function approveStep(stepApproverId: number) {
  return await prisma.$transaction(async (tx) => {
    const stepApprover = await tx.leaveApprovalStepApprover.findUnique({
      where: { id: stepApproverId },
      include: { leaveApprovalStep: { include: { approvers: true } } },
    });

    if (!stepApprover) throw new Error("Step Approver not found");

    const someoneApproved = stepApprover.leaveApprovalStep.approvers.some(
      (a) => a.status === "approved"
    );

    if (someoneApproved) {
      throw new Error("Bước duyệt này đã có người duyệt rồi");
    }

    if (stepApprover.status !== "pending") {
      throw new Error("Bạn đã duyệt bước này rồi");
    }

    const updated = await tx.leaveApprovalStepApprover.update({
      where: { id: stepApproverId },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    });

    return updated;
  });
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
    const { leaveRequestId, status, approvedByName, notifyAllCompany, notifyDepartmentId } = body;

    if (
      typeof leaveRequestId !== "number" ||
      !["approved", "rejected"].includes(status)
    ) {
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    const approverId = decoded.id;
    const approve = status === "approved";

    const stepApprover = await prisma.leaveApprovalStepApprover.findFirst({
      where: {
        approverId,
        status: "pending",
        leaveApprovalStep: {
          leaveRequestId,
        },
      },
      include: {
        leaveApprovalStep: true,
      },
    });

    if (!stepApprover) {
      return NextResponse.json(
        { message: "Không tìm thấy bước duyệt đang chờ cho người duyệt này" },
        { status: 404 }
      );
    }

    try {
      await approveStep(stepApprover.id);
    } catch (error) {
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        employee: {
          include: {
            contactInfo: true,
            workInfo: {
              include: {
                position: true, // thêm dòng này để lấy position
                department: true // nếu muốn luôn department
              },
            },
          },
        },
      },
    })

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ" },
        { status: 404 }
      );
    }

    if (!approve) {
      await prisma.leaveApprovalStepApprover.update({
        where: { id: stepApprover.id },
        data: {
          status: "rejected",
          approvedAt: new Date(),
        },
      });

      await prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: "rejected",
          approvedBy: approvedByName,
          approvedAt: new Date(),
        },
      });

      const approvedApprovers = await prisma.leaveApprovalStepApprover.findMany(
        {
          where: {
            leaveApprovalStep: {
              leaveRequestId,
            },
            status: "approved",
          },
          include: {
            approver: true,
          },
        }
      );

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

    await prisma.leaveApprovalStepApprover.update({
      where: { id: stepApprover.id },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    });

    const currentStep = await prisma.leaveApprovalStep.update({
      where: { id: stepApprover.leaveApprovalStepId },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    });

    const nextStep = await prisma.leaveApprovalStep.findFirst({
      where: {
        leaveRequestId,
        status: "pending",
        level: {
          gt: currentStep.level,
        },
      },
      orderBy: {
        level: "asc",
      },
      include: {
        approvers: {
          include: {
            approver: {
              include: {
                contactInfo: true,
                workInfo: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (nextStep) {
      const requesterDepartmentId =
        leaveRequest.employee.workInfo?.departmentId;

      const filteredApprovers = nextStep.approvers.filter((approverRel) => {
        const approver = approverRel.approver;

        if ([2, 3, 4].includes(nextStep.level)) {
          return approver.workInfo?.departmentId === requesterDepartmentId;
        }

        return true;
      });

      for (const approverRel of filteredApprovers) {
        const approver = approverRel.approver;
        const email = approver.contactInfo?.email;

        if (email) {
          const startVN = dayjs(leaveRequest.startDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm");
          const endVN = dayjs(leaveRequest.endDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm");

          await sendEmail({
            to: [email],
            subject: `Bạn có đơn nghỉ phép cần duyệt #${leaveRequestId}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
              <p style="font-size: 16px; color: #333;">Xin chào <strong style="color: #2a7ae2;">${approver.name}</strong>,</p>
              <p style="font-size: 14px; color: #555;">Bạn có một đơn nghỉ phép mới cần phê duyệt với thông tin:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tbody>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; background-color: #fff; font-weight: 600; width: 120px;">Nhân viên</td>
                    <td style="padding: 8px; border: 1px solid #ddd; background-color: #fff;">${leaveRequest.employee.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; background-color: #fff; font-weight: 600;">Thời gian</td>
                    <td style="padding: 8px; border: 1px solid #ddd; background-color: #fff;">${startVN} đến ${endVN}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; background-color: #fff; font-weight: 600;">Lý do</td>
                    <td style="padding: 8px; border: 1px solid #ddd; background-color: #fff;">${leaveRequest.reason}</td>
                  </tr>
                </tbody>
              </table>
              <p style="font-size: 14px; color: #555;">Vui lòng đăng nhập hệ thống để duyệt đơn.</p>
              <p style="font-size: 12px; color: #888;">Email được gửi tự động từ hệ thống quản lý đơn nghỉ.</p>
            </div>`,
          });
        }
      }
    } else {
      await prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: "approved",
          approvedBy: approvedByName,
          approvedAt: new Date(),
        },
      });
      if (leaveRequest.employee.contactInfo?.email) {
        const startVN = dayjs(leaveRequest.startDate)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm");
        const endVN = dayjs(leaveRequest.endDate)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm");

        await sendEmail({
          to: [leaveRequest.employee.contactInfo.email],
          subject: `✅ Đơn nghỉ phép #${leaveRequestId} đã được duyệt`,
          html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #c8e6c9; border-radius: 8px; background-color: #e8f5e9;">
        <h2 style="color: #388e3c;">✅ Đơn nghỉ phép đã được duyệt</h2>
        <p>Xin chào <strong>${leaveRequest.employee.name}</strong>,</p>
        <p>Đơn nghỉ phép <strong>#${leaveRequestId}</strong> của bạn đã được duyệt thành công.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #fff; font-weight: 600; width: 120px;">Thời gian</td>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #fff;">${startVN} đến ${endVN}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #fff; font-weight: 600;">Lý do</td>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #fff;">${leaveRequest.reason}</td>
          </tr>
        </table>
        <p style="margin-top: 16px;">Chúc bạn kỳ nghỉ vui vẻ!</p>
        <p style="font-size: 12px; color: #888;">Email được gửi tự động từ hệ thống quản lý đơn nghỉ.</p>
      </div>
    `,
        });
      }
      const startVN = dayjs(leaveRequest.startDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm");
      const endVN = dayjs(leaveRequest.endDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm");

      // 📢 Gửi mail toàn công ty hoặc bộ phận nếu được yêu cầu
      if (notifyAllCompany) {
        const allEmployees = await prisma.employee.findMany({
          include: { contactInfo: true },
        });

        const emails = allEmployees
          .map((e) => e.contactInfo?.email)
          .filter((email): email is string => !!email);

        if (emails.length > 0) {
          await sendEmail({
            to: emails,
            subject: `📢 Thông báo: Đơn về việc nghỉ phép của ${leaveRequest.employee.workInfo?.position?.name + ':' + leaveRequest.employee.name}`,
            html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background-color: #f5f5f5; border: 1px solid #ddd;">
      <h2 style="color: #2e7d32; margin-bottom: 16px;">📢 Thông báo đơn nghỉ phép</h2>
      <p>Xin chào,</p>
      <p>Nhân viên <strong>${leaveRequest.employee.name}</strong> đã được duyệt đơn nghỉ phép với thông tin:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc; background-color: #fff; font-weight: 600; width: 150px;">Mã nhân viên</td>
            <td style="padding: 8px; border: 1px solid #ccc; background-color: #fff;">${leaveRequest.employee.employeeCode}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc; background-color: #fff; font-weight: 600;">Thời gian nghỉ</td>
            <td style="padding: 8px; border: 1px solid #ccc; background-color: #fff;">${startVN} đến ${endVN}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 16px;">Vui lòng cập nhật thông tin công việc hoặc phối hợp với nhân viên khi cần.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888;">📧 Email được gửi tự động từ hệ thống quản lý nghỉ phép. Vui lòng không trả lời trực tiếp email này.</p>
    </div>
    `,
          });
        }
      }


      if (notifyDepartmentId) {
        const deptEmployees = await prisma.employee.findMany({
          where: {
            workInfo: { departmentId: notifyDepartmentId },
          },
          include: { contactInfo: true },
        });

        const emails = deptEmployees
          .map((e) => e.contactInfo?.email)
          .filter((email): email is string => !!email);

        if (emails.length > 0) {
          await sendEmail({
            to: emails,
            subject: `📢 Thông báo: Đơn về việc nghỉ phép của ${leaveRequest.employee.workInfo?.position?.name + ':' + leaveRequest.employee.name}`,
            html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background-color: #f5f5f5; border: 1px solid #ddd;">
      <h2 style="color: #2e7d32; margin-bottom: 16px;">📢 Thông báo đơn nghỉ phép</h2>
      <p>Xin chào,</p>
      <p>Nhân viên <strong>${leaveRequest.employee.name}</strong> đã được duyệt đơn nghỉ phép với thông tin:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc; background-color: #fff; font-weight: 600; width: 150px;">Mã nhân viên</td>
            <td style="padding: 8px; border: 1px solid #ccc; background-color: #fff;">${leaveRequest.employee.employeeCode}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc; background-color: #fff; font-weight: 600;">Thời gian nghỉ</td>
            <td style="padding: 8px; border: 1px solid #ccc; background-color: #fff;">${startVN} đến ${endVN}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 16px;">Vui lòng cập nhật thông tin công việc hoặc phối hợp với nhân viên khi cần.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888;">📧 Email được gửi tự động từ hệ thống quản lý nghỉ phép. Vui lòng không trả lời trực tiếp email này.</p>
    </div>
    `,
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
