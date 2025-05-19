import { NextApiRequest, NextApiResponse } from "next";
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
      role = "MANAGER",
      department = "",
      name = "",
      employeeCode = "",
      page = "1",
      pageSize = "10",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const sizeNum = parseInt(pageSize as string, 10);

    // Bộ lọc chung
    const whereFilter: any = {
      AND: [
        name
          ? {
              name: {
                contains: name as string,
              },
            }
          : {},
        employeeCode
          ? {
              employeeCode: {
                contains: employeeCode as string,
              },
            }
          : {},
      ],
    };

    // Nếu là manager thì giới hạn phòng ban
    if (role === "MANAGER" && department) {
      whereFilter.workInfo = {
        department: department as string,
      };
    } else if (department) {
      // Nếu là admin mà có chọn bộ phận lọc
      whereFilter.workInfo = {
        department: department as string,
      };
    }

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where: whereFilter,
        skip: (pageNum - 1) * sizeNum,
        take: sizeNum,
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          employeeCode: true,
          name: true,
          gender: true,
          avatar: true,
          workInfo: {
            select: {
              department: true,
              position: true,
            },
          },
        },
      }),
      prisma.employee.count({ where: whereFilter }),
    ]);

    return res.status(200).json({
      data,
      total,
      page: pageNum,
      pageSize: sizeNum,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách nhân viên rút gọn:", error);
    return res
      .status(500)
      .json({ message: "Không lấy được danh sách nhân viên" });
  }
}
