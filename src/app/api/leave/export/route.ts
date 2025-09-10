// app/api/leaveRequests/export/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import dayjs from "dayjs";
import { LeaveStatus } from "../../../../../generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // format: YYYY-MM
    if (!month) {
      return NextResponse.json(
        { message: "Thiếu tham số month (YYYY-MM)" },
        { status: 400 }
      );
    }

    const startDate = dayjs(month + "-01").startOf("month").toDate();

    // Lấy tất cả đơn đã duyệt trong tháng
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        status: LeaveStatus.approved,
        startDate: { gte: startDate },
      },
      include: {
        employee: {
          select: {
            name: true,
            employeeCode: true,
            workInfo: {
              select: {
                department: { select: { name: true } },
                position: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Nhóm theo tên phòng ban
    const grouped = leaveRequests.reduce((acc, req) => {
      const deptName = req.employee.workInfo?.department?.name || "Khác";
      if (!acc[deptName]) acc[deptName] = [];
      acc[deptName].push(req);
      return acc;
    }, {} as Record<string, typeof leaveRequests>);

    // Tạo workbook Excel
    const workbook = new ExcelJS.Workbook();

    for (const [deptName, requests] of Object.entries(grouped)) {
      const sheet = workbook.addWorksheet(deptName); // mỗi phòng ban = 1 sheet

      sheet.columns = [
        { header: "STT", key: "stt", width: 6 },
        { header: "Mã NV", key: "employeeCode", width: 15 },
        { header: "Tên nhân viên", key: "name", width: 25 },
        { header: "Chức vụ", key: "position", width: 20 },
        { header: "Loại phép", key: "leaveType", width: 15 },
        { header: "Từ ngày", key: "startDate", width: 15 },
        { header: "Đến ngày", key: "endDate", width: 15 },
        { header: "Số giờ", key: "totalHours", width: 10 },
        { header: "Lý do", key: "reason", width: 30 },
      ];

      requests.forEach((req, index) => {
        sheet.addRow({
          stt: index + 1,
          employeeCode: req.employee.employeeCode,
          name: req.employee.name,
          position: req.employee.workInfo?.position?.name || "",
          leaveType: req.leaveType,
          startDate: dayjs(req.startDate).format("DD/MM/YYYY"),
          endDate: dayjs(req.endDate).format("DD/MM/YYYY"),
          totalHours: req.totalHours ?? "",
          reason: req.reason ?? "",
        });
      });

      // Format header
      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="DonNghi_${month}.xlsx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Lỗi xuất file Excel:", error);
    return NextResponse.json(
      { message: "Xuất file thất bại" },
      { status: 500 }
    );
  }
}
