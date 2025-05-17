import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface MyTokenPayload extends JwtPayload {
  id: number;
  role: string;
  // thêm các trường khác nếu có
}

export function verifyToken(token: string): MyTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // jwt.verify có thể trả về string (payload dạng chuỗi) hoặc object (payload kiểu JwtPayload)
    // Chúng ta chỉ chấp nhận trường hợp decoded là object
    if (typeof decoded === "string") {
      return null;
    }

    // Ép kiểu về MyTokenPayload để có id, role
    return decoded as MyTokenPayload;
  } catch (error) {
    // Nếu lỗi (token sai, hết hạn...), trả về null
    return null;
  }
}
