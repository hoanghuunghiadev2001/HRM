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

    if (!week) {
      return NextResponse.json(
        { error: "Thiếu ngày bắt đầu tuần" },
        { status: 400 }
      );
    }

    const startDate = new Date(week);
    const monday = startOfWeek(startDate, { weekStartsOn: 1 });
    const saturday = addDays(monday, 5);

    // Lấy danh sách nhân viên
    const employees = await prisma.employee.findMany({
      where: {
        otherInfo: { workStatus: { not: "RESIGNED" } },
        ...(department
          ? {
              workInfo: { departmentId: Number(department) },
            }
          : {}),
      },
      include: {
        workInfo: { include: { department: true, position: true } },
        LeaveRequest: {
          where: {
            status: "approved",
            OR: [{ startDate: { lte: saturday }, endDate: { gte: monday } }],
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

    // Lấy tất cả attendance của các nhân viên trong tuần
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: { in: employees.map(e => e.id) },
        date: { gte: monday, lte: saturday },
      },
    });

    // Gom nhóm nhân viên theo bộ phận
    const grouped: Record<string, typeof employees> = {};
    for (const emp of employees) {
      const depName = emp.workInfo?.department?.name || "Không xác định";
      if (!grouped[depName]) grouped[depName] = [];
      grouped[depName].push(emp);
    }

    const workbook = new ExcelJS.Workbook();

    for (const [depName, empList] of Object.entries(grouped)) {
      const ws = workbook.addWorksheet(depName);

      // Tiêu đề cột
      ws.addRow([
        "Mã NV",
        "Tên NV",
        "Bộ phận",
        ...Array.from({ length: 6 }, (_, i) => {
          const d = addDays(monday, i);
          return `${format(d, "dd/MM")} (${["T2", "T3", "T4", "T5", "T6", "T7"][i]})`;
        }),
        "Số ngày đi làm",
        "Số ngày nghỉ có phép",
        "Số ngày nghỉ không phép",
      ]).font = { bold: true };

      for (const emp of empList) {
        const row: (string | null)[] = [emp.employeeCode, emp.name, depName];
        const cellStyles: { style?: Partial<ExcelJS.Style> }[] = [{}, {}, {}];

        let countPresent = 0;
        let countLeave = 0;
        let countAbsent = 0;

        for (let i = 0; i < 6; i++) {
          const date = addDays(monday, i);

          // Attendance của nhân viên ngày đó
          const att = attendances.find(
            a => a.employeeId === emp.id && a.date.toDateString() === date.toDateString()
          );

          // Đơn nghỉ ngày đó
          const leave = emp.LeaveRequest.find(lr =>
            isWithinInterval(date, { start: lr.startDate, end: lr.endDate })
          );

          const inTime = att?.checkInTime ? format(att.checkInTime, "HH:mm") : null;
          const outTime = att?.checkOutTime ? format(att.checkOutTime, "HH:mm") : null;

          if (inTime && outTime) {
            row.push(`${inTime} → ${outTime}`);
            cellStyles.push({});
            countPresent++;
          } else if (leave) {
            row.push(leave.leaveType);
            cellStyles.push({ style: { font: { color: { argb: "FFFF9900" } } } });
            countLeave++;
          } else {
            row.push("Nghỉ không phép");
            cellStyles.push({ style: { font: { color: { argb: "FFFF0000" } } } });
            countAbsent++;
          }
        }

        row.push(countPresent.toString(), countLeave.toString(), countAbsent.toString());
        const newRow = ws.addRow(row);

        cellStyles.forEach((s, idx) => {
          if (s.style) newRow.getCell(idx + 1).style = s.style;
        });
      }

      ws.columns.forEach(col => { col.width = 18; });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=attendance_report_${format(monday, "yyyyMMdd")}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Lỗi xuất báo cáo chấm công:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
