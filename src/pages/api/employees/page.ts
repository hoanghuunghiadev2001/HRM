import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function calculateSeniorityDetail(
  startDate: Date | null | undefined
): string | null {
  if (!startDate) return null;

  const today = new Date();
  const start = new Date(startDate);

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();

  // Nếu tháng hiện tại nhỏ hơn tháng bắt đầu => trừ 1 năm và cộng thêm 12 tháng
  if (months < 0) {
    years--;
    months += 12;
  }

  // Trả về chuỗi "X năm Y tháng"
  return `${years} năm ${months} tháng`;
}

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
        issueDate: formatDate(employee.personalInfo?.issueDate),
        // thêm định dạng ngày trong personalInfo nếu có
      },
      workInfo: employee.workInfo
        ? {
            ...employee.workInfo,
            joinedTBD: formatDate(employee.workInfo.joinedTBD),
            joinedTeSCC: formatDate(employee.workInfo.joinedTeSCC),
            seniority: calculateSeniorityDetail(
              employee.workInfo?.seniorityStart
            ),
            seniorityStart: formatDate(employee.workInfo.seniorityStart),
            contractDate: formatDate(employee.workInfo.contractDate),
            contractEndDate: formatDate(employee.workInfo.contractEndDate),
          }
        : null,
      otherInfo: employee.otherInfo
        ? {
            ...employee.otherInfo,
            updatedAt: formatDate(employee.otherInfo?.updatedAt), // ✅ format updatedAt
          }
        : null,
    };

    // Trả về dữ liệu nhân viên đã định dạng
    res.status(200).json(formattedEmployee);
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
}
