/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token-hrm")?.value;

    if (!token) return null;

    // Giải mã token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Trả về payload (chứa id, role, employeeCode...)
    return {
      id: decoded.id,
      employeeCode: decoded.employeeCode,
      role: decoded.role,
      departmentId: decoded.departmentId,
    };
  } catch (error) {
    console.error("Auth helper error:", error);
    return null;
  }
}
