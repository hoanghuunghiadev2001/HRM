import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Xác thực và giải mã JWT từ token
 * @param token - token JWT từ cookie
 */
export function verifyToken(
  token: string
): { id: number; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };
    return decoded;
  } catch (error) {
    console.error("Token không hợp lệ:", error);
    return null;
  }
}
