/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { format, startOfWeek, addDays, isWithinInterval } from "date-fns";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { week, department } = body;

    // Kiểm tra tham số ngày bắt đầu tuần (ví dụ "2023-05-01")
    if (!week) {
      return NextResponse.json(
        { error: "Thiếu ngày bắt đầu tuần" },
        { status: 400 }
      );
    }

    // Xác định ngày thứ 2 (đầu tuần) và thứ 7 (cuối tuần)
    const startDate = new Date(week);
    const monday = startOfWeek(startDate, { weekStartsOn: 1 }); // Thứ 2 là ngày bắt đầu tuần
    const saturday = addDays(monday, 5); // Thứ 7 cách thứ 2 5 ngày

    // Lấy danh sách nhân viên, lọc theo bộ phận nếu có
    const employees = await prisma.employee.findMany({
      where: {
        otherInfo: { workStatus: { not: "RESIGNED" } }, // Không lấy nhân viên đã nghỉ việc
        ...(department
          ? {
              workInfo: {
                departmentId: Number(department), // Lọc theo departmentId (nên gửi id bộ phận)
              },
            }
          : {}),
      },
      include: {
        workInfo: {
          include: {
            department: true,
            position: true,
          },
        },
        Attendance: {
          where: {
            date: { gte: monday, lte: saturday }, // Chấm công trong tuần
          },
        },
        LeaveRequest: {
          where: {
            status: "approved", // Chỉ lấy đơn nghỉ đã duyệt
            OR: [
              {
                startDate: { lte: saturday },
                endDate: { gte: monday },
              }, // Đơn nghỉ trùng tuần
            ],
          },
        },
      },
    });

    if (employees.length === 0) {
      return NextResponse.json(
        { error: "Không có nhân viên nào trong phòng ban" },
        { status: 404 }
      );
    }

    // Gom nhóm nhân viên theo bộ phận (tên bộ phận)
    const grouped: Record<string, typeof employees> = {};
    for (const emp of employees) {
      const depName = emp.workInfo?.department?.name || "Không xác định";
      if (!grouped[depName]) grouped[depName] = [];
      grouped[depName].push(emp);
    }

    // Tạo file Excel mới
    const workbook = new ExcelJS.Workbook();

    // Duyệt từng nhóm bộ phận, tạo sheet tương ứng
    for (const [depName, empList] of Object.entries(grouped)) {
      const ws = workbook.addWorksheet(depName);

      // Tiêu đề cột
      ws.addRow([
        "Mã NV",
        "Tên NV",
        "Bộ phận",
        ...Array.from({ length: 6 }, (_, i) => {
          const d = addDays(monday, i);
          return `${format(d, "dd/MM")} (${
            ["T2", "T3", "T4", "T5", "T6", "T7"][i]
          })`;
        }),
        "Số ngày đi làm",
        "Số ngày nghỉ có phép",
        "Số ngày nghỉ không phép",
      ]).font = { bold: true };

      // Dữ liệu từng nhân viên
      for (const emp of empList) {
        const row: (string | null)[] = [emp.employeeCode, emp.name, depName];

        let countPresent = 0; // Số ngày đi làm
        let countLeave = 0; // Số ngày nghỉ có phép
        let countAbsent = 0; // Số ngày nghỉ không phép

        const cellStyles: { style?: Partial<ExcelJS.Style> }[] = [{}, {}, {}]; // 3 cột đầu không tô màu

        for (let i = 0; i < 6; i++) {
          const date = addDays(monday, i);

          // Tìm bản ghi chấm công ngày đó
          const att = emp.Attendance.find(
            (a: any) => a.date.toDateString() === date.toDateString()
          );
          // Tìm đơn nghỉ phù hợp ngày đó
          const leave = emp.LeaveRequest.find((lr: any) =>
            isWithinInterval(date, { start: lr.startDate, end: lr.endDate })
          );

          // Định dạng giờ check-in/out
          const inTime = att?.checkInTime
            ? format(new Date(att.checkInTime), "HH:mm")
            : null;
          const outTime = att?.checkOutTime
            ? format(new Date(att.checkOutTime), "HH:mm")
            : null;

          if (inTime && outTime) {
            // Có chấm công (đi làm)
            row.push(`${inTime} → ${outTime}`);
            cellStyles.push({});
            countPresent++;
          } else if (leave) {
            // Có đơn nghỉ phép hợp lệ
            row.push(leave.leaveType);
            cellStyles.push({
              style: { font: { color: { argb: "FFFF9900" } } }, // Màu cam
            });
            countLeave++;
          } else {
            // Không chấm công, không đơn nghỉ (vắng không phép)
            row.push("Nghỉ không phép");
            cellStyles.push({
              style: { font: { color: { argb: "FFFF0000" } } }, // Màu đỏ
            });
            countAbsent++;
          }
        }

        row.push(countPresent.toString());
        row.push(countLeave.toString());
        row.push(countAbsent.toString());

        const newRow = ws.addRow(row);

        // Áp dụng style tô màu cho các ô tương ứng
        cellStyles.forEach((s, idx) => {
          if (s.style) {
            newRow.getCell(idx + 1).style = s.style;
          }
        });
      }

      // Tự động giãn cột cho đẹp
      ws.columns.forEach((col) => {
        col.width = 18;
      });
    }

    // Xuất file Excel ra buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Trả về file Excel download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=attendance_report_${format(
          monday,
          "yyyyMMdd"
        )}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Lỗi xuất báo cáo chấm công:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
