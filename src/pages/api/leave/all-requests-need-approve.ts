import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không được hỗ trợ" });
  }

  try {
    // Không cần lọc employeeId khác user nếu cho phép duyệt chính mình
    const pendingRequests = await prisma.leaveRequest.findMany({
      where: {
        status: "pending",
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
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

    return res.json(pendingRequests);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn nghỉ đã xử lý:", error);
    return res.status(500).json({ message: "Lấy danh sách thất bại" });
  }
}
