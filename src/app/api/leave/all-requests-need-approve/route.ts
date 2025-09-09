// app/api/leaveRequests/pending/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaveStatus } from "../../../../../generated/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userIdStr = url.searchParams.get("userId");
    if (!userIdStr) {
      return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
    }
    const userId = Number(userIdStr);

    // Lấy tất cả step pending mà user này là approver
    const steps = await prisma.leaveApprovalStep.findMany({
      where: {
        status: LeaveStatus.pending,
        approvers: {
          some: {
            approverId: userId,
            status: LeaveStatus.pending, // chỉ lấy approver chưa xử lý
          },
        },
      },
      include: {
        leaveRequest: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                employeeCode: true,
                workInfo: {
                  select: {
                    department: { select: { name: true } },
                    position: { select: { name: true } },
                  },
                },
              },
            },
            approvalSteps: {
              include: {
                approvers: {
                  include: {
                    approver: {
                      select: {
                        name: true,
                        employeeCode: true,
                        workInfo: {
                          select: {
                            department: { select: { name: true } },
                            position: { select: { name: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
              orderBy: { level: "asc" },
            },
          },
        },
      },
    });

    // Chỉ giữ lại step active (step pending có level nhỏ nhất)
    const formatted = steps
      .filter((step) => {
        const leaveReq = step.leaveRequest;
        const activeStep = leaveReq.approvalSteps.find(
          (s) => s.status === LeaveStatus.pending
        );
        return activeStep?.id === step.id; // chỉ step active mới được trả
      })
      .map((step) => {
        const leaveReq = step.leaveRequest;

        const approversWhoApproved = leaveReq.approvalSteps
          .filter((s) => s.status === LeaveStatus.approved)
          .flatMap((s) =>
            s.approvers.map((a) => ({
              name: a.approver?.name,
              employeeCode: a.approver?.employeeCode,
              stepLevel: s.level,
              approvedAt: a.approvedAt,
              departmentName: a.approver?.workInfo?.department?.name,
              positionName: a.approver?.workInfo?.position?.name,
            }))
          );

        return {
          stepId: step.id,
          leaveRequestId: leaveReq.id,
          employeeId: leaveReq.employeeId,
          employeeName: leaveReq.employee?.name,
          employeeCode: leaveReq.employee?.employeeCode,
          department: leaveReq.employee?.workInfo?.department?.name,
          position: leaveReq.employee?.workInfo?.position?.name,
          leaveType: leaveReq.leaveType,
          startDate: leaveReq.startDate,
          endDate: leaveReq.endDate,
          totalHours: leaveReq.totalHours,
          reason: leaveReq.reason,
          currentStepLevel: step.level,
          status: leaveReq.status,
          approversWhoApproved,
        };
      });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn cần duyệt:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
