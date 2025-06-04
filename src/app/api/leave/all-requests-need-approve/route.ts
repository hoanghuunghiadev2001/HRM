import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const department = url.searchParams.get("department");
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    // Tạo filter cho employee nếu là MANAGER hoặc ADMIN
    const employeeFilter: Prisma.EmployeeWhereInput = {};
    if ((role === "MANAGER" || role === "ADMIN") && department) {
      const [departmentIdStr, positionIdStr] = department.split("-");
      const departmentId = parseInt(departmentIdStr, 10);
      const positionId = parseInt(positionIdStr, 10);
      employeeFilter.workInfo = {
        ...(departmentId && { departmentId }),
        ...(positionId && { positionId }),
      };
    }

    // Lấy danh sách các bước duyệt pending của người này, kèm theo các bước duyệt của đơn, và approvers của từng bước
    const pendingApprovals = await prisma.leaveApprovalStepApprover.findMany({
      where: {
        approverId: parseInt(userId, 10),
        approvedAt: null,
        status: "pending",
        leaveApprovalStep: {
          leaveRequest: {
            employee: employeeFilter,
          },
          // Thêm điều kiện: trong bước này chưa có approver nào được duyệt
          approvers: {
            none: {
              status: "approved",
            },
          },
        },
      },
      // phần include giữ nguyên
      include: {
        leaveApprovalStep: {
          include: {
            leaveRequest: {
              include: {
                approvalSteps: {
                  include: {
                    approvers: {
                      where: { status: "approved" },
                      include: {
                        approver: {
                          include: {
                            workInfo: {
                              include: {
                                department: true,
                                position: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                employee: {
                  select: {
                    id: true,
                    name: true,
                    employeeCode: true,
                    workInfo: {
                      select: {
                        department: true,
                        position: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        leaveApprovalStep: {
          leaveRequest: {
            createdAt: "desc",
          },
        },
      },
    });

    // Lọc các bước duyệt mà các bước thấp hơn đã được duyệt hết
    const filteredApprovals = pendingApprovals.filter((stepApprover) => {
      const currentLevel = stepApprover.leaveApprovalStep.level;
      const allLowerStepsApproved =
        stepApprover.leaveApprovalStep.leaveRequest.approvalSteps
          .filter((s) => s.level < currentLevel)
          .every((s) => s.status === "approved");
      return allLowerStepsApproved;
    });

    // Chuẩn bị dữ liệu trả về kèm danh sách người đã duyệt các bước thấp hơn
    const results = filteredApprovals.map((stepApprover) => {
      const leaveRequest = stepApprover.leaveApprovalStep.leaveRequest;

      // Lấy các bước thấp hơn đã được duyệt
      const approvedLowerSteps = leaveRequest.approvalSteps.filter(
        (s) =>
          s.level < stepApprover.leaveApprovalStep.level &&
          s.status === "approved"
      );

      // Lấy danh sách người đã duyệt ở các bước thấp hơn
      const approversWhoApproved = approvedLowerSteps.flatMap((step) =>
        step.approvers.map((a) => ({
          name: a.approver.name,
          employeeCode: a.approver.employeeCode, // sửa key 'postion' thành 'employeeCode' nếu muốn mã nhân viên
          approvedAt: a.approvedAt,
          stepLevel: step.level,
          departmentName: a.approver.workInfo?.department?.name || null,
          positionName: a.approver.workInfo?.position?.name || null,
        }))
      );

      return {
        leaveRequest,
        approversWhoApproved,
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn nghỉ đang chờ duyệt:", error);
    return NextResponse.json(
      { message: "Lấy danh sách thất bại" },
      { status: 500 }
    );
  }
}
