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
    ? `<ul>${approvers
        .map(
          (a) =>
            `<li><strong>${a.name}</strong> – ${dayjs(a.approvedAt)
              .tz("Asia/Ho_Chi_Minh")
              .format("DD/MM/YYYY HH:mm")}</li>`
        )
        .join("")}</ul>`
    : "<p><em>Không có người nào duyệt trước đó</em></p>";

  return `
    <div style="font-family: Arial, sans-serif; padding: 16px; color: #333;">
      <h2 style="color: #d32f2f;">❌ Đơn nghỉ phép bị từ chối</h2>
      <p>Xin chào <strong>${employeeName}</strong>,</p>
      <p>Đơn nghỉ phép <strong>#${leaveRequestId}</strong> của bạn đã bị <strong>từ chối</strong>.</p>
      <h3>🔍 Người đã duyệt trước:</h3>
      ${approvedListHtml}
      <p style="margin-top: 16px;">Vui lòng liên hệ quản lý để biết thêm chi tiết.</p>
      <p style="color: #888; font-size: 12px;">Email được gửi tự động từ hệ thống quản lý đơn nghỉ.</p>
    </div>
  `;
}

async function approveStep(stepApproverId: number) {
  return await prisma.$transaction(async (tx) => {
    // Lấy thông tin stepApprover và step liên quan
    const stepApprover = await tx.leaveApprovalStepApprover.findUnique({
      where: { id: stepApproverId },
      include: { leaveApprovalStep: { include: { approvers: true } } },
    });

    if (!stepApprover) throw new Error("Step Approver not found");

    // Kiểm tra xem có ai trong cùng bước đã duyệt chưa
    const someoneApproved = stepApprover.leaveApprovalStep.approvers.some(
      (a) => a.status === "approved"
    );

    if (someoneApproved) {
      // Đã có người duyệt rồi, không cho duyệt nữa
      throw new Error("Bước duyệt này đã có người duyệt rồi");
    }

    // Nếu chưa ai duyệt, cho phép cập nhật trạng thái người duyệt hiện tại
    const updated = await tx.leaveApprovalStepApprover.update({
      where: { id: stepApproverId, status: "pending" },
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
    const { leaveRequestId, status } = body;

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
          include: { contactInfo: true, workInfo: true },
        },
      },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ" },
        { status: 404 }
      );
    }

    // ✅ Nếu từ chối
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
          approvedBy: decoded.name,
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

    // ✅ Cập nhật người duyệt thành approved
    await prisma.leaveApprovalStepApprover.update({
      where: { id: stepApprover.id },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    });

    // ✅ Nếu là người duyệt cuối trong bước → duyệt luôn bước đó
    const currentStep = await prisma.leaveApprovalStep.update({
      where: { id: stepApprover.leaveApprovalStepId },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    });

    // ✅ Tìm bước tiếp theo
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

    // ✅ Nếu có bước tiếp theo → gửi mail người duyệt
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
      // ✅ Không còn bước tiếp theo → duyệt đơn luôn
      await prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: "approved",
          approvedBy: decoded.name,
          approvedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ message: "Duyệt đơn thành công" });
  } catch (error) {
    console.error("Lỗi duyệt đơn nghỉ phép:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
