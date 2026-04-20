/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * GET /api/salary/manager/assign
 * Lấy danh sách tất cả managers và nhân viên dưới quyền (cho trang quản lý)
 * Chỉ ADMIN được dùng
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token-hrm")?.value;
    if (!token)
      return NextResponse.json({ message: "Chưa xác thực" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Chỉ Admin mới được truy cập" },
        { status: 403 },
      );
    }

    // Lấy tất cả nhân viên kèm thông tin
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        role: true,
        managerId: true,
        workInfo: {
          select: {
            department: { select: { name: true, abbreviation: true } },
            position: { select: { name: true } },
          },
        },
      },
      orderBy: { employeeCode: "asc" },
    });

    // Tách managers và users
    const managers = employees.filter(
      (e) => e.role === "MANAGER" || e.role === "ADMIN",
    );

    const result = managers.map((mgr) => ({
      manager: {
        id: mgr.id,
        employeeCode: mgr.employeeCode,
        name: mgr.name,
        role: mgr.role,
        department: mgr.workInfo?.department?.name || null,
        position: mgr.workInfo?.position?.name || null,
      },
      subordinates: employees
        .filter((e) => e.managerId === mgr.id)
        .map((sub) => ({
          id: sub.id,
          employeeCode: sub.employeeCode,
          name: sub.name,
          role: sub.role,
          department: sub.workInfo?.department?.name || null,
          position: sub.workInfo?.position?.name || null,
        })),
    }));

    // Nhân viên chưa có manager
    const unassigned = employees.filter(
      (e) => !e.managerId && e.role === "USER",
    );

    return NextResponse.json({
      managers: result,
      unassigned: unassigned.map((e) => ({
        id: e.id,
        employeeCode: e.employeeCode,
        name: e.name,
        department: e.workInfo?.department?.name || null,
        position: e.workInfo?.position?.name || null,
      })),
      allEmployees: employees.map((e) => ({
        id: e.id,
        employeeCode: e.employeeCode,
        name: e.name,
        role: e.role,
        managerId: e.managerId,
        department: e.workInfo?.department?.name || null,
        position: e.workInfo?.position?.name || null,
      })),
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách manager:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}

/**
 * POST /api/salary/manager/assign
 * Body: { managerId: number, employeeIds: number[] }
 * Gán nhân viên cho manager (set managerId)
 * Chỉ ADMIN
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token-hrm")?.value;
    if (!token)
      return NextResponse.json({ message: "Chưa xác thực" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Chỉ Admin mới được truy cập" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { managerId, employeeIds } = body as {
      managerId: number;
      employeeIds: number[];
    };

    if (!managerId || !Array.isArray(employeeIds)) {
      return NextResponse.json(
        { message: "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }

    // Kiểm tra manager tồn tại và có role MANAGER/ADMIN
    const manager = await prisma.employee.findUnique({
      where: { id: managerId },
      select: { id: true, role: true, name: true },
    });

    if (!manager) {
      return NextResponse.json(
        { message: "Không tìm thấy manager" },
        { status: 404 },
      );
    }

    if (manager.role === "USER") {
      // Nâng cấp lên MANAGER nếu đang là USER
      await prisma.employee.update({
        where: { id: managerId },
        data: { role: "MANAGER" },
      });
    }

    // Gán nhân viên cho manager (chỉ update những người trong employeeIds)
    await prisma.employee.updateMany({
      where: { id: { in: employeeIds } },
      data: { managerId },
    });

    return NextResponse.json({
      message: `Đã gán ${employeeIds.length} nhân viên cho ${manager.name}`,
      managerId,
      assignedCount: employeeIds.length,
    });
  } catch (error) {
    console.error("Lỗi gán manager:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}

/**
 * PATCH /api/salary/manager/assign
 * Body: { employeeId: number, managerId: number | null }
 * Thay đổi manager cho 1 nhân viên, hoặc gỡ khỏi manager (null)
 */
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token-hrm")?.value;
    if (!token)
      return NextResponse.json({ message: "Chưa xác thực" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Chỉ Admin mới được truy cập" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { employeeId, managerId, setAsManager } = body as {
      employeeId: number;
      managerId: number | null;
      setAsManager?: boolean; // true = nâng lên MANAGER, false = hạ xuống USER
    };

    if (!employeeId) {
      return NextResponse.json(
        { message: "Thiếu employeeId" },
        { status: 400 },
      );
    }

    const updateData: any = {};

    if (managerId !== undefined) updateData.managerId = managerId;
    if (setAsManager === true) updateData.role = "MANAGER";
    if (setAsManager === false) updateData.role = "USER";

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: updateData,
      select: { id: true, name: true, role: true, managerId: true },
    });

    return NextResponse.json({
      message: "Cập nhật thành công",
      employee: updated,
    });
  } catch (error) {
    console.error("Lỗi cập nhật manager:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}

/**
 * DELETE /api/salary/manager/assign
 * Body: { employeeIds: number[] }
 * Gỡ manager khỏi danh sách nhân viên (set managerId = null)
 */
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token-hrm")?.value;
    if (!token)
      return NextResponse.json({ message: "Chưa xác thực" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Chỉ Admin mới được truy cập" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { employeeIds } = body as { employeeIds: number[] };

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { message: "Danh sách nhân viên không hợp lệ" },
        { status: 400 },
      );
    }

    await prisma.employee.updateMany({
      where: { id: { in: employeeIds } },
      data: { managerId: null },
    });

    return NextResponse.json({
      message: `Đã gỡ ${employeeIds.length} nhân viên khỏi quản lý`,
    });
  } catch (error) {
    console.error("Lỗi gỡ manager:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
