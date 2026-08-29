/* eslint-disable @typescript-eslint/no-unused-vars */

// app/api/leaveRequests/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaveStatus, Prisma } from "../../../../../generated/prisma";
import jwt from "jsonwebtoken";
import { startOfDay, endOfDay } from "date-fns";

interface JWTPayload {
  id: number;
  role: string;
  employeeCode: string;
  departmentId?: number;
}

export async function GET(req: NextRequest) {
  try {
    // ============================================================
    // 1. CHECK TOKEN
    // ============================================================
    const token = req.cookies.get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (!decoded.role) {
      return NextResponse.json(
        { message: "Không có quyền xem danh sách" },
        { status: 403 },
      );
    }

    // ============================================================
    // 2. GET QUERY PARAMS
    // ============================================================
    const url = new URL(req.url);

    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);

    const pageSize = Math.min(
      Math.max(parseInt(url.searchParams.get("pageSize") || "10", 10), 1),
      100,
    );

    const name = url.searchParams.get("name")?.trim() || "";
    const employeeCode = url.searchParams.get("employeeCode")?.trim() || "";

    const departmentIdParam = url.searchParams.get("department")?.trim() || "";

    const statusParam = url.searchParams.get("status")?.trim() || "";

    const startDate = url.searchParams.get("startDate")?.trim() || "";

    const brandParam = url.searchParams.get("brand")?.trim() || "";

    // ============================================================
    // 3. GET CURRENT USER
    // ============================================================
    const currentUser = await prisma.employee.findUnique({
      where: {
        id: decoded.id,
      },
      include: {
        workInfo: {
          include: {
            position: true,
          },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "Không tìm thấy nhân viên" });
    }

    const userLevel = currentUser.workInfo?.position?.level || 0;

    // ============================================================
    // 4. FILTER EMPLOYEE
    // ============================================================
    const employeeFilter: Prisma.EmployeeWhereInput = {};

    // ------------------------------------------------------------
    // ADMIN
    // ------------------------------------------------------------
    if (decoded.role === "ADMIN") {
      if (name) {
        employeeFilter.name = {
          contains: name,
        };
      }

      if (employeeCode) {
        employeeFilter.employeeCode = {
          contains: employeeCode,
        };
      }

      // Lọc phòng ban nếu ADMIN chọn
      if (departmentIdParam) {
        const departmentIdNum = Number(departmentIdParam);

        if (!Number.isNaN(departmentIdNum)) {
          employeeFilter.workInfo = {
            is: {
              departmentId: departmentIdNum,
            },
          };
        }
      }

      // ==========================================================
      // ⭐ LỌC CHI NHÁNH CHO ADMIN
      // ==========================================================
      //
      // Không chọn:
      // brand = ""
      // => ADMIN xem tất cả chi nhánh
      //
      // Chọn TBD:
      // brand = "TBD"
      // => chỉ lấy nhân viên TBD
      //
      // Chọn TMP:
      // brand = "TMP"
      // => chỉ lấy nhân viên TMP
      //
      if (brandParam === "TBD" || brandParam === "TMP") {
        employeeFilter.brand = brandParam;
      }
    }

    // ------------------------------------------------------------
    // MANAGER
    // ------------------------------------------------------------
    else if (decoded.role === "MANAGER") {
      if (userLevel === 8) {
        employeeFilter.workInfo = {
          is: {
            departmentId: {
              in: [2, 10, 11, 14, 13, 15],
            },
          },
        };
      } else {
        employeeFilter.workInfo = {
          is: {
            departmentId: decoded.departmentId,
          },
        };
      }

      if (name) {
        employeeFilter.name = {
          contains: name,
        };
      }

      if (employeeCode) {
        employeeFilter.employeeCode = {
          contains: employeeCode,
        };
      }

      // Manager cũng có thể lọc chi nhánh
      if (brandParam === "TBD" || brandParam === "TMP") {
        employeeFilter.brand = brandParam;
      }
    }

    // ------------------------------------------------------------
    // USER
    // ------------------------------------------------------------
    else if (decoded.role === "USER") {
      // USER chỉ được xem đơn của chính mình
      employeeFilter.id = decoded.id;
    }

    // ============================================================
    // 5. FILTER LEAVE REQUEST
    // ============================================================
    const leaveFilter: Prisma.LeaveRequestWhereInput = {};

    // ------------------------------------------------------------
    // STATUS
    // ------------------------------------------------------------
    if (statusParam) {
      leaveFilter.status = statusParam as LeaveStatus;
    }

    // ------------------------------------------------------------
    // NGÀY NGHỈ
    // ------------------------------------------------------------
    if (startDate) {
      const filterDate = new Date(startDate);

      if (!Number.isNaN(filterDate.getTime())) {
        leaveFilter.AND = [
          {
            startDate: {
              lte: endOfDay(filterDate),
            },
          },
          {
            endDate: {
              gte: startOfDay(filterDate),
            },
          },
        ];
      }
    }

    // ============================================================
    // 6. PHÂN QUYỀN XEM DỮ LIỆU
    // ============================================================

    // ------------------------------------------------------------
    // ADMIN + MANAGER
    // ------------------------------------------------------------
    if (decoded.role === "ADMIN" || decoded.role === "MANAGER") {
      leaveFilter.employee = employeeFilter;
    }

    // ------------------------------------------------------------
    // USER
    // ------------------------------------------------------------
    else if (decoded.role === "USER") {
      leaveFilter.OR = [
        // Đơn của chính mình
        {
          employeeId: decoded.id,
        },

        // Hoặc mình là người phê duyệt
        {
          approvalSteps: {
            some: {
              approvers: {
                some: {
                  approverId: decoded.id,
                },
              },
            },
          },
        },
      ];
    }

    // ============================================================
    // 7. QUERY DATABASE
    // ============================================================
    const [data, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: leaveFilter,

        skip: (page - 1) * pageSize,
        take: pageSize,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          employee: {
            include: {
              workInfo: {
                include: {
                  department: true,
                  position: true,
                },
              },
            },
          },

          approvalSteps: {
            include: {
              approvers: {
                select: {
                  id: true,
                  status: true,
                  approvedAt: true,

                  approver: {
                    select: {
                      id: true,
                      name: true,
                      employeeCode: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.leaveRequest.count({
        where: leaveFilter,
      }),
    ]);

    // ============================================================
    // 8. STATUS MAP
    // ============================================================
    const statusMap: Record<string, string> = {
      approved: "Đã duyệt",
      rejected: "Từ chối",
      pending: "Đang chờ",
      revoked: "Đã thu hồi",
    };

    // ============================================================
    // 9. MAP RESULT
    // ============================================================
    const processedData = data.map((request) => {
      const approvalHistory = request.approvalSteps.flatMap((step) =>
        step.approvers.map((approver) => ({
          approverId: approver.approver?.id ?? null,
          name: approver.approver?.name ?? null,
          employeeCode: approver.approver?.employeeCode ?? null,

          level: step.level,

          status: approver.status,

          approvedAt: approver.approvedAt,
        })),
      );

      return {
        ...request,

        approvalHistory,

        approversSummary: approvalHistory
          .map(
            (approver) =>
              `${approver.name || ""} (${approver.employeeCode || ""}) - ${
                statusMap[approver.status] || approver.status
              }`,
          )
          .join("; "),
      };
    });

    // ============================================================
    // 10. RESPONSE
    // ============================================================
    return NextResponse.json({
      data: processedData,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("❌ Lỗi API danh sách yêu cầu nghỉ phép:", error);

    return NextResponse.json(
      {
        message: "Lấy danh sách thất bại",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token-hrm")?.value;
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Bạn không có quyền" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { id, leaveType, startDate, endDate, totalHours } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Thiếu ID đơn nghỉ phép" },
        { status: 400 },
      );
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ phép" },
        { status: 404 },
      );
    }

    const dataToUpdate: Prisma.LeaveRequestUpdateInput = {};
    if (leaveType) dataToUpdate.leaveType = leaveType;
    if (startDate) dataToUpdate.startDate = new Date(startDate);
    if (endDate) dataToUpdate.endDate = new Date(endDate);
    if (typeof totalHours === "number") dataToUpdate.totalHours = totalHours;

    if (dataToUpdate.startDate && dataToUpdate.endDate) {
      if (dataToUpdate.startDate > dataToUpdate.endDate) {
        return NextResponse.json(
          { message: "Ngày bắt đầu không được lớn hơn ngày kết thúc" },
          { status: 400 },
        );
      }
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      message: "Cập nhật đơn nghỉ thành công",
      data: updatedLeave,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật đơn nghỉ:", error);
    return NextResponse.json({ message: "Cập nhật thất bại" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Thiếu ID đơn nghỉ phép" },
        { status: 400 },
      );
    }

    const token = req.cookies.get("token-hrm")?.value;
    if (!token)
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Bạn không có quyền" },
        { status: 403 },
      );
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: Number(id) },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ phép" },
        { status: 404 },
      );
    }

    await prisma.leaveRequest.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Xóa đơn nghỉ thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa đơn nghỉ:", error);
    return NextResponse.json({ message: "Xóa đơn thất bại" }, { status: 500 });
  }
}
