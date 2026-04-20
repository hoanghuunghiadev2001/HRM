/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function adminOnly(role: string) {
  return role === "ADMIN";
}

/** Lấy decoded token, trả về null nếu lỗi */
function getDecoded(req: NextRequest) {
  try {
    const token = req.cookies.get("token-hrm")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as { id: number; role: string };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// GET /api/salary/permissions
// Admin: toàn bộ permissions
// User thường: chỉ trả về danh sách targetId mà mình được phép xem
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const decoded = getDecoded(req);
  if (!decoded)
    return NextResponse.json({ message: "Chưa xác thực" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const viewerId = searchParams.get("viewerId")
    ? Number(searchParams.get("viewerId"))
    : undefined;

  // Người dùng thường chỉ có thể xem permissions của chính mình
  if (!adminOnly(decoded.role)) {
    const perms = await prisma.salaryViewPermission.findMany({
      where: { viewerId: decoded.id, isActive: true },
      select: {
        id: true,
        targetId: true,
        target: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
            workInfo: {
              select: {
                department: { select: { name: true, abbreviation: true } },
                position: { select: { name: true } },
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ permissions: perms });
  }

  // Admin: lấy toàn bộ, có thể filter theo viewerId
  const where: any = {};
  if (viewerId) where.viewerId = viewerId;

  const permissions = await prisma.salaryViewPermission.findMany({
    where,
    include: {
      viewer: {
        select: {
          id: true,
          employeeCode: true,
          name: true,
          role: true,
          workInfo: {
            select: {
              department: { select: { name: true } },
              position: { select: { name: true } },
            },
          },
        },
      },
      target: {
        select: {
          id: true,
          employeeCode: true,
          name: true,
          role: true,
          workInfo: {
            select: {
              department: { select: { name: true } },
              position: { select: { name: true } },
            },
          },
        },
      },
      grantedBy: { select: { id: true, name: true, employeeCode: true } },
    },
    orderBy: [{ viewerId: "asc" }, { createdAt: "desc" }],
  });

  // Nhóm theo viewer
  const grouped: Record<number, any> = {};
  for (const p of permissions) {
    const vid = p.viewerId;
    if (!grouped[vid]) {
      grouped[vid] = {
        viewer: p.viewer,
        targets: [],
        activeCount: 0,
      };
    }
    grouped[vid].targets.push({
      permissionId: p.id,
      isActive: p.isActive,
      note: p.note,
      createdAt: p.createdAt,
      grantedBy: p.grantedBy,
      target: p.target,
    });
    if (p.isActive) grouped[vid].activeCount++;
  }

  return NextResponse.json({
    total: permissions.length,
    viewers: Object.values(grouped),
    // Danh sách nhân viên chưa có ai xem (để gợi ý)
  });
}

// ---------------------------------------------------------------------------
// POST /api/salary/permissions
// Body: { viewerId, targetIds: number[], note? }
// Cấp quyền xem lương cho viewer đối với nhiều target cùng lúc
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const decoded = getDecoded(req);
  if (!decoded)
    return NextResponse.json({ message: "Chưa xác thực" }, { status: 401 });
  if (!adminOnly(decoded.role))
    return NextResponse.json(
      { message: "Chỉ Admin mới được cấp quyền" },
      { status: 403 },
    );

  const body = await req.json();
  const { viewerId, targetIds, note } = body as {
    viewerId: number;
    targetIds: number[];
    note?: string;
  };

  if (!viewerId || !Array.isArray(targetIds) || targetIds.length === 0)
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ" },
      { status: 400 },
    );

  // Kiểm tra viewer tồn tại
  const viewer = await prisma.employee.findUnique({
    where: { id: viewerId },
    select: { id: true, name: true },
  });
  if (!viewer)
    return NextResponse.json(
      { message: "Không tìm thấy nhân viên" },
      { status: 404 },
    );

  // Upsert từng permission (tránh duplicate, re-activate nếu đã bị tắt)
  const results = await Promise.allSettled(
    targetIds.map((targetId) =>
      prisma.salaryViewPermission.upsert({
        where: { viewerId_targetId: { viewerId, targetId } },
        create: {
          viewerId,
          targetId,
          grantedById: decoded.id,
          note,
          isActive: true,
        },
        update: { isActive: true, grantedById: decoded.id, note },
      }),
    ),
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - succeeded;

  return NextResponse.json({
    message: `Đã cấp ${succeeded} quyền cho ${viewer.name}${failed > 0 ? `, ${failed} thất bại` : ""}`,
    succeeded,
    failed,
  });
}

// ---------------------------------------------------------------------------
// PATCH /api/salary/permissions
// Body: { permissionId, isActive } HOẶC { viewerId, targetIds, isActive }
// Toggle kích hoạt / vô hiệu hóa (không xóa record để giữ audit trail)
// ---------------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  const decoded = getDecoded(req);
  if (!decoded)
    return NextResponse.json({ message: "Chưa xác thực" }, { status: 401 });
  if (!adminOnly(decoded.role))
    return NextResponse.json(
      { message: "Chỉ Admin mới được sửa quyền" },
      { status: 403 },
    );

  const body = await req.json();

  // Cập nhật 1 permission theo id
  if (body.permissionId !== undefined) {
    const updated = await prisma.salaryViewPermission.update({
      where: { id: body.permissionId },
      data: { isActive: body.isActive },
    });
    return NextResponse.json({
      message: "Cập nhật thành công",
      permission: updated,
    });
  }

  // Cập nhật nhiều permissions theo viewerId + targetIds
  if (body.viewerId && Array.isArray(body.targetIds)) {
    await prisma.salaryViewPermission.updateMany({
      where: {
        viewerId: body.viewerId,
        targetId: { in: body.targetIds },
      },
      data: { isActive: body.isActive },
    });
    return NextResponse.json({
      message: `Đã cập nhật ${body.targetIds.length} quyền`,
    });
  }

  return NextResponse.json(
    { message: "Dữ liệu không hợp lệ" },
    { status: 400 },
  );
}

// ---------------------------------------------------------------------------
// DELETE /api/salary/permissions
// Body: { permissionIds: number[] } — xóa hẳn record
// Hoặc { viewerId, targetIds } — xóa theo cặp
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  const decoded = getDecoded(req);
  if (!decoded)
    return NextResponse.json({ message: "Chưa xác thực" }, { status: 401 });
  if (!adminOnly(decoded.role))
    return NextResponse.json(
      { message: "Chỉ Admin mới được xóa quyền" },
      { status: 403 },
    );

  const body = await req.json();

  if (Array.isArray(body.permissionIds)) {
    await prisma.salaryViewPermission.deleteMany({
      where: { id: { in: body.permissionIds } },
    });
    return NextResponse.json({
      message: `Đã xóa ${body.permissionIds.length} quyền`,
    });
  }

  if (body.viewerId && Array.isArray(body.targetIds)) {
    await prisma.salaryViewPermission.deleteMany({
      where: {
        viewerId: body.viewerId,
        targetId: { in: body.targetIds },
      },
    });
    return NextResponse.json({
      message: `Đã xóa ${body.targetIds.length} quyền`,
    });
  }

  return NextResponse.json(
    { message: "Dữ liệu không hợp lệ" },
    { status: 400 },
  );
}
