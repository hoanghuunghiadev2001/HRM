// app/api/employees/[employeeCode]/changePassword/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user || user.role === "USER") {
    return NextResponse.json({ message: "Không có quyền" }, { status: 403 });
  }

  const url = new URL(request.url);
  const employeeCode = url.pathname.split("/").at(-2); // hoặc dùng regex nếu cần chắc chắn hơn

  try {
    // Lấy id nhân viên tương ứng với mã
    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Không tìm thấy nhân viên" },
        { status: 404 }
      );
    }

    const employeeId = employee.id;

    // Xoá dữ liệu liên quan trước

    // 1. Xoá các approver trước
    await prisma.leaveApprovalStepApprover.deleteMany({
      where: {
        leaveApprovalStep: {
          leaveRequest: {
            employeeId,
          },
        },
      },
    });

    // 2. Xoá các approval step
    await prisma.leaveApprovalStep.deleteMany({
      where: {
        leaveRequest: {
          employeeId,
        },
      },
    });

    // 3. Xoá các đơn xin nghỉ
    await prisma.leaveRequest.deleteMany({ where: { employeeId } });

    // Xoá dữ liệu liên quan trước
    await prisma.leaveApprovalStepApprover.deleteMany({
      where: { approverId: employeeId },
    }); // <- thêm dòng này
    await prisma.leaveRequest.deleteMany({ where: { employeeId } });
    await prisma.attendance.deleteMany({ where: { employeeId } });
    await prisma.workInfo.deleteMany({ where: { employeeId } });
    await prisma.contactInfo.deleteMany({ where: { employeeId } });
    await prisma.personalInfo.deleteMany({ where: { employeeId } });
    await prisma.otherInfo.deleteMany({ where: { employeeId } });

    // Xoá chính employee
    await prisma.employee.delete({
      where: { id: employeeId },
    });

    return NextResponse.json({ message: "Xoá nhân viên thành công" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Xoá nhân viên thất bại" },
      { status: 500 }
    );
  }
}
