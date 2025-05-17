import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Hàm định dạng ngày từ Date sang chuỗi dd/mm/yyyy
function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không được phép" });
  }

  // Lấy token từ cookie
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Không có token" });

  try {
    // Giải mã token và lấy thông tin user
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Tìm nhân viên theo ID và lấy các thông tin liên quan
    const employee = await prisma.employee.findUnique({
      where: { id: decoded.id },
      include: {
        personalInfo: true, // Thông tin cá nhân
        contactInfo: true, // Thông tin liên hệ
        workInfo: true, // Thông tin công việc
        otherInfo: true, // Thông tin khác
      },
    });

    if (!employee) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    // Format các trường ngày trước khi trả về
    const formattedEmployee = {
      ...employee,
      birthDate: formatDate(employee.birthDate),
      personalInfo: {
        ...employee.personalInfo,
        // thêm định dạng ngày trong personalInfo nếu có
        issueDate: formatDate(employee.personalInfo?.issueDate),
      },
      workInfo: employee.workInfo
        ? {
            ...employee.workInfo,
            joinedTBD: formatDate(employee.workInfo.joinedTBD),
            joinedTeSCC: formatDate(employee.workInfo.joinedTeSCC),
            seniorityStart: formatDate(employee.workInfo.seniorityStart),
            contractDate: formatDate(employee.workInfo.contractDate),
            contractEndDate: formatDate(employee.workInfo.contractEndDate),
          }
        : null,
    };

    // Trả về dữ liệu nhân viên đã định dạng
    res.status(200).json(formattedEmployee);
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
}
