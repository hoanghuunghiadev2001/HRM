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

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        employee: {
          include: { contactInfo: true, workInfo: true }, // thêm workInfo
        },
      },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ" },
        { status: 404 }
      );
    }

    // Cập nhật trạng thái duyệt
    await prisma.leaveApprovalStepApprover.update({
      where: { id: stepApprover.id },
      data: {
        status: approve ? "approved" : "rejected",
        approvedAt: new Date(),
      },
    });

    if (!approve) {
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

    // Lấy level của bước duyệt hiện tại
    const currentStep = await prisma.leaveApprovalStep.findUnique({
      where: { id: stepApprover.leaveApprovalStepId },
    });

    let stepFullyApproved = false;

    if (currentStep?.level === 5) {
      // Nếu là level 5 → duyệt luôn bước
      await prisma.leaveApprovalStep.update({
        where: { id: currentStep.id },
        data: {
          status: "approved",
          approvedAt: new Date(),
        },
      });
      stepFullyApproved = true;
    } else {
      // Các level khác → kiểm tra tất cả approvers đã duyệt chưa
      const pendingApprovers = await prisma.leaveApprovalStepApprover.count({
        where: {
          leaveApprovalStepId: stepApprover.leaveApprovalStepId,
          status: "pending",
        },
      });

      if (pendingApprovers === 0) {
        await prisma.leaveApprovalStep.update({
          where: { id: currentStep?.id },
          data: {
            status: "approved",
            approvedAt: new Date(),
          },
        });
        stepFullyApproved = true;
      }
    }

    if (!stepFullyApproved) {
      return NextResponse.json({
        message: "Đã duyệt bước này, chờ các approver khác duyệt",
      });
    }

    // Tìm bước tiếp theo
    const nextStep = await prisma.leaveApprovalStep.findFirst({
      where: {
        leaveRequestId,
        status: "pending",
        level: {
          gt: currentStep?.level,
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

        // Nếu level là 2-3-4 → chỉ cho phép cùng phòng ban
        if ([2, 3, 4].includes(nextStep.level)) {
          return approver.workInfo?.departmentId === requesterDepartmentId;
        }

        // Các level khác (ví dụ 1 hoặc 5) thì không cần kiểm tra
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
          <p>Xin chào <strong>${approver.name}</strong>,</p>
          <p>Bạn có một đơn nghỉ phép mới cần phê duyệt với thông tin:</p>
          <ul>
            <li>Nhân viên: ${leaveRequest.employee.name}</li>
            <li>Thời gian: ${startVN} - ${endVN}</li>
            <li>Lý do: ${leaveRequest.reason}</li>
          </ul>
          <p>Vui lòng đăng nhập hệ thống để xử lý.</p>
        `,
          });
        }
      }

      return NextResponse.json({
        message: "Đã duyệt bước này, chờ bước tiếp theo duyệt",
      });
    } else {
      // Không còn bước nào → duyệt hoàn toàn
      await prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: "approved",
          approvedBy: decoded.name,
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
          subject: `Đơn nghỉ phép #${leaveRequestId} đã được phê duyệt`,
          html: `
            <p>Xin chào <strong>${leaveRequest.employee.name}</strong>,</p>
            <p>Đơn nghỉ phép của bạn đã được <strong>phê duyệt</strong>.</p>
            <p>Thông tin nghỉ phép:</p>
            <ul>
              <li>Thời gian: ${startVN} - ${endVN}</li>
              <li>Lý do: ${leaveRequest.reason}</li>
            </ul>
            <p>Cảm ơn bạn đã sử dụng hệ thống.</p>
          `,
        });
      }

      return NextResponse.json({ message: "Đơn đã được duyệt hoàn toàn" });
    }
  } catch (error) {
    console.error("Approve leave request error:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
