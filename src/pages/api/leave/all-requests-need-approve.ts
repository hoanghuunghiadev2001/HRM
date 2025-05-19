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
    const { role, department } = req.query;

    const whereClause: any = {
      status: "pending",
      employee: {
        workInfo: {},
      },
    };

    // Lọc theo phòng ban
    if (role === "MANAGER" && department) {
      whereClause.employee.workInfo.department = department;
    } else if (role === "ADMIN" && department) {
      whereClause.employee.workInfo.department = department;
    }

    // Lọc theo tên nhân viên

    const pendingRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
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
    console.error("Lỗi khi lấy danh sách đơn nghỉ đang chờ duyệt:", error);
    return res.status(500).json({ message: "Lấy danh sách thất bại" });
  }
}
