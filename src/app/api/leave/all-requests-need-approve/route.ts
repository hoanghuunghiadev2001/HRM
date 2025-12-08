// app/api/leaveRequests/pending/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaveStatus } from "../../../../../generated/prisma";
import jwt from "jsonwebtoken";

interface JWTPayload {
  id: number;
  role: string;
  employeeCode: string;
  departmentId?: number;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const userId = decoded.id;

    if (!decoded.role || decoded.role === "USER") {
      return NextResponse.json(
        { message: "Không có quyền xem" },
        { status: 403 }
      );
    }

    // 🔹 Lấy tất cả đơn nghỉ mà user là approver đang pending
    const pendingSteps = await prisma.leaveApprovalStep.findMany({
      where: {
        status: LeaveStatus.pending,
        approvers: {
          some: {
            approverId: userId,
            status: LeaveStatus.pending, // user chưa xử lý
          },
        },
        leaveRequest: {
          status: LeaveStatus.pending, // chỉ lấy đơn đang chờ duyệt
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

    // 🔹 Giữ lại step active (level thấp nhất còn pending)
    const formatted = pendingSteps
      .filter((step) => {
        const leaveReq = step.leaveRequest;
        const activeStep = leaveReq.approvalSteps.find(
          (s) => s.status === LeaveStatus.pending
        );
        return activeStep?.id === step.id;
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
          handoverFileId: leaveReq.handoverFileId,
          approversWhoApproved,
        };
      });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn cần duyệt:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
