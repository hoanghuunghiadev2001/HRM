// /pages/api/leave/my-requests.ts

import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không được phép" });
  }

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Không có token" });
  }

  try {
    // Giải mã token để lấy ID người dùng
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId: decoded.id, // Chỉ lấy đơn của người này
      },
      include: {
        employee: {
          select: {
            name: true,
            employeeCode: true,
            avatar: true,
            workInfo: {
              select: {
                department: true,
                position: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(leaveRequests);
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
}
