// /app/api/leave-request/route.ts
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
    } = body;

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const totalDays = differenceInCalendarDays(end, start) + 1;
    console.log(totalDays);

    if (totalDays <= 0) {
      return NextResponse.json(
        { error: "Thời gian nghỉ không hợp lệ." },
        { status: 400 }
      );
    }

    // 1. Tạo LeaveRequest
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

    // 2. Lấy thông tin nhân viên (để biết department)
    const workInfo = await prisma.workInfo.findUnique({
      where: { employeeId },
      include: {
        department: true,
        position: true,
        employee: true,
      },
    });

    if (!workInfo?.departmentId) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ phận nhân viên." },
        { status: 404 }
      );
    }

    const departmentId = workInfo.departmentId;

    // 3. Xác định các cấp cần duyệt ban đầu (ví dụ)
    let levelsToApprove: number[] = [];
    if (totalDays < 1) {
      levelsToApprove = [2]; // tổ trưởng
    } else if (totalDays < 7) {
      levelsToApprove = [2, 3, 4]; // tổ trưởng + trưởng phòng + cấp khác
    } else {
      levelsToApprove = [2, 3, 4, 5]; // + giám đốc (cấp 5)
    }

    // 4. Phân nhóm cấp duyệt:
    const levelsWithDept = [2, 3, 4];
    const levelsWithoutDept = [5];

    // Lấy người duyệt cùng phòng ban (cấp 2,3,4)
    const approversInDept = await prisma.workInfo.findMany({
      where: {
        departmentId,
        position: {
          level: {
            in: levelsWithDept.filter((l) => levelsToApprove.includes(l)),
          },
        },
      },
      include: {
        position: true,
        employee: {
          include: { contactInfo: true },
        },
      },
      orderBy: {
        position: { level: "asc" },
      },
    });

    // Lấy người duyệt không cần cùng phòng ban (cấp 5)
    const approversOutDept = await prisma.workInfo.findMany({
      where: {
        position: {
          level: {
            in: levelsWithoutDept.filter((l) => levelsToApprove.includes(l)),
          },
        },
      },
      include: {
        position: true,
        employee: {
          include: { contactInfo: true },
        },
      },
      orderBy: {
        position: { level: "asc" },
      },
    });

    // Ghép 2 danh sách lại
    const approvers = [...approversInDept, ...approversOutDept];

    if (approvers.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy người duyệt phù hợp." },
        { status: 404 }
      );
    }

    // Sắp xếp lại theo level (tăng dần)
    approvers.sort(
      (a, b) => (a.position?.level ?? 0) - (b.position?.level ?? 0)
    );

    // 5. Nhóm approvers theo cấp độ (level)
    const approversByLevel = approvers.reduce((acc, approver) => {
      const level = approver.position?.level ?? 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(approver);
      return acc;
    }, {} as Record<number, typeof approvers>);

    // 6. Tạo từng bước duyệt (LeaveApprovalStep) và approvers trong bước đó
    const createdSteps = [];

    for (const levelStr of Object.keys(approversByLevel).sort(
      (a, b) => Number(a) - Number(b)
    )) {
      const level = Number(levelStr);
      const approversAtLevel = approversByLevel[level];

      const step = await prisma.leaveApprovalStep.create({
        data: {
          leaveRequestId: leaveRequest.id,
          level,
          status: LeaveStatus.pending,
          approvers: {
            create: approversAtLevel.map((approver) => ({
              approverId: approver.employeeId,
              status: LeaveStatus.pending,
            })),
          },
        },
        include: {
          approvers: true,
        },
      });

      createdSteps.push(step);
    }

    // 7. Gửi mail cho người duyệt đầu tiên của bước đầu tiên (cấp thấp nhất)
    const firstStep = createdSteps[0];
    const firstApproverId = firstStep.approvers[0]?.approverId;
    const firstApprover = approvers.find(
      (a) => a.employeeId === firstApproverId
    );
    const approverEmail = firstApprover?.employee.contactInfo?.email;

    const startVN = dayjs(start)
      .tz("Asia/Ho_Chi_Minh")
      .format("DD/MM/YYYY HH:mm");
    const endVN = dayjs(end).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");

    if (!approverEmail) {
      console.warn("Không tìm thấy email người duyệt đầu tiên");
    } else {
      const employeeName = workInfo.employee?.name || "Nhân viên";
      const subject = `[Thông báo] Đơn nghỉ phép mới từ ${employeeName}`;
      const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #4a4a6a; margin-bottom: 8px;">TOYOTA BÌNH DƯƠNG</h2>
        </div>

        <h2 style="color: #2a8af6; margin-bottom: 8px;">📌 Đơn xin nghỉ mới</h2>
        <p>Xin chào,</p>
        <p>Hệ thống HRM vừa ghi nhận một đơn xin nghỉ mới với thông tin như sau:</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 120px;">👤 Nhân viên:</td>
            <td style="padding: 8px;">${workInfo.employee?.name} (${
        workInfo.employee?.employeeCode
      })</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">💼 Chức vụ:</td>
            <td style="padding: 8px;">${workInfo.position?.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">🏢 Bộ phận:</td>
            <td style="padding: 8px;">${workInfo.department?.name}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">📝 Loại phép:</td>
            <td style="padding: 8px;">${leaveType}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">🕒 Thời gian:</td>
            <td style="padding: 8px;">${startVN} - ${endVN}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">⏳ Tổng giờ:</td>
            <td style="padding: 8px;">${totalHours} tiếng</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">📄 Lý do:</td>
            <td style="padding: 8px;">${reason || "Không có"}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 32px;">
          <a href="${process.env.detailUrlRequest}" target="_blank" style="
              display: inline-block;
              padding: 12px 24px;
              font-weight: bold;
              color: white;
              background-color: #2a8af6;
              border-radius: 6px;
              text-decoration: none;
              box-shadow: 0 3px 6px rgba(42, 138, 246, 0.4);
              transition: background-color 0.3s ease;
            "
            onmouseover="this.style.backgroundColor='#1a5edb'"
            onmouseout="this.style.backgroundColor='#2a8af6'"
          >
            🔍 Xem chi tiết
          </a>
        </div>

        <p style="color: #888; font-size: 12px; margin-top: 40px; text-align: center; font-style: italic">
          Email được gửi tự động từ hệ thống HRM. Vui lòng không trả lời email này.
        </p>
      </div>
      `;

      try {
        await sendEmail({
          to: [approverEmail],
          subject,
          html,
        });
      } catch (emailError) {
        console.error("Lỗi gửi mail:", emailError);
      }
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
