import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface AuthUser {
  id: number;
  employeeCode: string;
  role: "USER" | "MANAGER" | "ADMIN";
  departmentId: number | null;
  isActive: boolean;
  brand: "TBD" | "TMP" | null;
  global: boolean;
}

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Xác thực và giải mã JWT từ token
 * @param token - token JWT từ cookie
 */
export function verifyToken(
  token: string,
): {
  id: number;
  role: string;
  brand: "TBD" | "TMP" | null;
  global: boolean;
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
      brand: "TBD" | "TMP" | null;
      global: boolean;
    };
    return decoded;
  } catch (error) {
    console.error("Token không hợp lệ:", error);
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("token-hrm")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    if (!decoded?.id) {
      return null;
    }

    // ⭐ Không chỉ tin JWT.
    // Lấy lại DB để quyền thay đổi có hiệu lực ngay.
    const employee = await prisma.employee.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        employeeCode: true,
        role: true,
        isActive: true,
        brand: true,
        global: true,

        workInfo: {
          select: {
            departmentId: true,
          },
        },
      },
    });

    if (!employee || !employee.isActive) {
      return null;
    }

    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      role: employee.role,
      isActive: employee.isActive,
      brand: employee.brand,
      global: employee.global,
      departmentId: employee.workInfo?.departmentId ?? null,
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);

    return null;
  }
}

export async function getBranchFilter() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      allowed: false,
      brand: null,
    };
  }

  // Không phải ADMIN
  if (user.role !== "ADMIN") {
    return {
      user,
      allowed: true,
      brand: null,
    };
  }

  // ADMIN GLOBAL
  if (user.global === true) {
    return {
      user,
      allowed: true,
      brand: null,
    };
  }

  // ADMIN thường bắt buộc phải có branch
  if (!user.brand) {
    return {
      user,
      allowed: false,
      brand: null,
    };
  }

  // ADMIN theo chi nhánh
  return {
    user,
    allowed: true,
    brand: user.brand,
  };
}
