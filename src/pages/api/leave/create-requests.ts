import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

/**
 * API tạo đơn xin nghỉ phép
 * - Nhận dữ liệu POST
 * - Định dạng thời gian: DD/MM/YYYY HH:mm:ss
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Phương thức không được hỗ trợ" });
  }

  try {
    const {
      employeeId, // Mã nhân viên
      leaveType, // Loại nghỉ
      startDateTime, // "DD/MM/YYYY HH:mm:ss"
      endDateTime, // "DD/MM/YYYY HH:mm:ss"
      reason, // Lý do
      totalHours, // Tổng số giờ nghỉ
    } = req.body;

    // Kiểm tra trường bắt buộc
    if (
      !employeeId?.toString().trim() ||
      !leaveType?.toString().trim() ||
      !startDateTime?.toString().trim() ||
      !endDateTime?.toString().trim() ||
      totalHours === undefined
    ) {
      return res.status(400).json({ message: "Thiếu trường dữ liệu bắt buộc" });
    }

    // Parse thời gian theo định dạng DD/MM/YYYY HH:mm:ss
    const start = dayjs(startDateTime, "DD/MM/YYYY HH:mm:ss", true).toDate();
    const end = dayjs(endDateTime, "DD/MM/YYYY HH:mm:ss", true).toDate();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Định dạng ngày giờ không hợp lệ" });
    }

    if (start >= end) {
      return res
        .status(400)
        .json({ message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc" });
    }

    // Tạo đơn nghỉ phép
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate: start,
        endDate: end,
        totalHours: Number(totalHours),
        reason: reason?.toString() || "",
        // status mặc định là "pending"
      },
    });

    return res.status(201).json(leaveRequest);
  } catch (error) {
    console.error("Lỗi khi tạo đơn nghỉ:", error);
    return res.status(500).json({ message: "Tạo đơn nghỉ thất bại" });
  }
}
