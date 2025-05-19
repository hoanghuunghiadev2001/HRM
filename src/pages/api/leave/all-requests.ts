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
    const {
      page = "1",
      pageSize = "10",
      role,
      department,
      employeeCode,
      name,
      status,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const sizeNum = parseInt(pageSize as string, 10);

    // Điều kiện lọc cơ bản
    const baseWhere: any = {
      status: {
        in: ["approved", "rejected"],
      },
      employee: {
        workInfo: {},
      },
    };

    // Lọc theo trạng thái (nếu có)
    if (status) {
      baseWhere.status = status;
    }

    // Lọc theo mã số nhân viên
    // Lọc theo mã số nhân viên
    if (employeeCode) {
      baseWhere.employee.employeeCode = {
        contains: employeeCode as string,
        // mode: "insensitive",  không dùng ở nested relation
      };
    }

    // Lọc theo tên nhân viên
    if (name) {
      baseWhere.employee.name = {
        contains: name as string,
        // mode: "insensitive",  không dùng ở nested relation
      };
    }

    // Lọc theo phòng ban
    if (role === "MANAGER" && department) {
      console.log("1:" + role);

      console.log("2:" + department);
      // Nếu là manager, chỉ được xem phòng ban của mình
      baseWhere.employee.workInfo.department = department;
    } else if (role === "ADMIN" && department) {
      // Nếu là admin và truyền department, lọc theo đó
      baseWhere.employee.workInfo.department = department;
    }

    const processedRequests = await prisma.leaveRequest.findMany({
      where: baseWhere,
      orderBy: {
        approvedAt: "desc", // Sắp xếp theo thời điểm duyệt gần nhất
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
      where: baseWhere,
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
