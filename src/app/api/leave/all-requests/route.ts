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
    // Lấy token từ cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Chặn USER
    if (!decoded.role || decoded.role === "USER") {
      return NextResponse.json(
        { message: "Không có quyền xem danh sách" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const name = url.searchParams.get("name");
    const employeeCode = url.searchParams.get("employeeCode");
    const departmentIdParam = url.searchParams.get("department");

    const status = url.searchParams.get("status") as LeaveStatus | undefined;
    const startDate = url.searchParams.get("startDate");

    // Build filter nhân viên
    const employeeFilter: Prisma.EmployeeWhereInput = {};

    if (decoded.role === "ADMIN") {
      if (name) employeeFilter.name = { contains: name };
      if (employeeCode) employeeFilter.employeeCode = { contains: employeeCode };

      if (departmentIdParam) {
        const departmentIdNum = parseInt(departmentIdParam, 10);
        if (!isNaN(departmentIdNum)) {
          employeeFilter.workInfo = {
            is: { departmentId: departmentIdNum },
          };
        }
      }
    } else if (decoded.role === "MANAGER") {
      employeeFilter.workInfo = {
        is: { departmentId: decoded.departmentId }, // cái này đã là number
      };
      if (name) employeeFilter.name = { contains: name };
      if (employeeCode) employeeFilter.employeeCode = { contains: employeeCode };
    }

    // Build filter leave request
    const filterDate = startDate ? new Date(startDate) : undefined;
    const leaveFilter: Prisma.LeaveRequestWhereInput = {
      employee: employeeFilter,
      status: status ? status : undefined,
      ...(filterDate
        ? {
          AND: [
            { startDate: { lte: endOfDay(filterDate) } }, // nhỏ hơn hoặc bằng cuối ngày
            { endDate: { gte: startOfDay(filterDate) } }, // lớn hơn hoặc bằng đầu ngày
          ],
        }
        : {}),
    };

    // Lấy dữ liệu đầy đủ
    const [data, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: leaveFilter,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          employee: {
            include: {
              workInfo: { include: { department: true, position: true } },
            },
          },
          approvalSteps: {
            include: {
              approvers: {
                include: {
                  approver: {
                    select: { id: true, name: true, employeeCode: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.leaveRequest.count({ where: leaveFilter }),
    ]);

    // Map người phê duyệt thành string
    const processedData = data.map((req) => ({
      ...req,
      approvers: req.approvalSteps
        .flatMap((step) =>
          step.approvers.map(
            (a) => `${a.approver?.name || ""} (${a.approver?.employeeCode || ""})`
          )
        )
        .filter(Boolean)
        .join("; "),
    }));

    return NextResponse.json({ data: processedData, total, page, pageSize });
  } catch (err) {
    console.error("❌ Lỗi API leave:", err);
    return NextResponse.json(
      { message: "Lấy danh sách thất bại" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Bạn không có quyền" }, { status: 403 });
    }

    const body = await req.json();
    const { id, leaveType, startDate, endDate } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Thiếu ID đơn nghỉ phép" },
        { status: 400 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ phép" },
        { status: 404 }
      );
    }

    // Chuẩn bị dữ liệu update
    const dataToUpdate: Prisma.LeaveRequestUpdateInput = {};
    if (leaveType) dataToUpdate.leaveType = leaveType;
    if (startDate) dataToUpdate.startDate = new Date(startDate);
    if (endDate) dataToUpdate.endDate = new Date(endDate);

    if (dataToUpdate.startDate && dataToUpdate.endDate) {
      if (dataToUpdate.startDate > dataToUpdate.endDate) {
        return NextResponse.json(
          { message: "Ngày bắt đầu không được lớn hơn ngày kết thúc" },
          { status: 400 }
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
    return NextResponse.json(
      { message: "Cập nhật thất bại" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Thiếu ID đơn nghỉ phép" },
        { status: 400 }
      );
    }

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Thiếu token" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Bạn không có quyền" }, { status: 403 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: Number(id) },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "Không tìm thấy đơn nghỉ phép" },
        { status: 404 }
      );
    }

    await prisma.leaveRequest.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Xóa đơn nghỉ thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa đơn nghỉ:", error);
    return NextResponse.json(
      { message: "Xóa đơn thất bại" },
      { status: 500 }
    );
  }
}
