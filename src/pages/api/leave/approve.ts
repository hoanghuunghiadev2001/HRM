// pages/api/leave/approve.ts (hoặc app/api/leave/approve/route.ts trong app router)
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Phương thức không được phép" });
  }

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    // Giải mã token để lấy user hiện tại (người phê duyệt)
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      name: string;
      role: string;
    };

    // Kiểm tra quyền, ví dụ chỉ Admin hoặc Manager được phê duyệt
    if (!["ADMIN", "MANAGER"].includes(decoded.role)) {
      return res.status(403).json({ message: "Không có quyền phê duyệt" });
    }

    // Lấy id đơn nghỉ và trạng thái mới từ body
    const { leaveRequestId, status, approvedBy } = req.body;

    if (!leaveRequestId || !status || !approvedBy) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    // Cập nhật đơn nghỉ trong DB
    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status,
        approvedBy,
        approvedAt: new Date(), // Cập nhật thời điểm duyệt
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Approve leave request error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
}
