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
    const { page = "1", pageSize = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const sizeNum = parseInt(pageSize as string, 10);

    const processedRequests = await prisma.leaveRequest.findMany({
      where: {
        OR: [{ status: "approved" }, { status: "rejected" }],
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (pageNum - 1) * sizeNum,
      take: sizeNum,
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
    });

    const total = await prisma.leaveRequest.count({
      where: {
        OR: [{ status: "approved" }, { status: "rejected" }],
      },
    });

    return res.status(200).json({
      data: processedRequests,
      total,
      page: pageNum,
      pageSize: sizeNum,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn nghỉ đã xử lý:", error);
    return res.status(500).json({ message: "Lấy danh sách thất bại" });
  }
}
