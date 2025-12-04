/* eslint-disable @typescript-eslint/no-explicit-any */

import "server-only";

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import { prisma } from "@/lib/prisma";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const TIME_ZONE = "Asia/Ho_Chi_Minh";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { week, department } = body;

    if (!week)
      return NextResponse.json(
        { error: "Thiếu ngày bắt đầu tuần" },
        { status: 400 }
      );

    const monday = dayjs(week).tz(TIME_ZONE).startOf("week").add(1, "day");
    const saturday = monday.add(5, "day");

    const employees = await prisma.employee.findMany({
      where: {
        ...(department
          ? { workInfo: { departmentId: Number(department) } }
          : {}),
      },
      include: {
        workInfo: { include: { department: true, position: true } },
        LeaveRequest: {
          where: {
            status: "approved",
            OR: [
              {
                startDate: { lte: saturday.toDate() },
                endDate: { gte: monday.toDate() },
              },
            ],
          },
        },
      },
    });

    if (!employees.length)
      return NextResponse.json(
        { error: "Không có nhân viên nào trong phòng ban" },
        { status: 404 }
      );

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: { in: employees.map((e) => e.id) },
        date: { gte: monday.toDate(), lte: saturday.toDate() },
      },
    });

    // Map lookup nhanh
    const attendanceMap: Record<string, any> = {};
    attendances.forEach((att) => {
      const key = `${att.employeeId}-${dayjs(att.date)
        .tz(TIME_ZONE)
        .format("YYYY-MM-DD")}`;
      attendanceMap[key] = att;
    });

    const grouped: Record<string, typeof employees> = {};
    for (const emp of employees) {
      const depName = emp.workInfo?.department?.name || "Không xác định";
      if (!grouped[depName]) grouped[depName] = [];
      grouped[depName].push(emp);
    }

    const workbook = new ExcelJS.Workbook();

    for (const [depName, empList] of Object.entries(grouped)) {
      const ws = workbook.addWorksheet(depName);

      const header = [
        "Mã NV",
        "Tên NV",
        "Bộ phận",
        ...Array.from({ length: 6 }, (_, i) => {
          const d = monday.add(i, "day");
          return `${d.format("DD/MM")} (${
            ["T2", "T3", "T4", "T5", "T6", "T7"][i]
          })`;
        }),
        "Số ngày đi làm",
        "Số ngày nghỉ có phép",
        "Số ngày nghỉ không phép",
      ];
      ws.addRow(header).font = { bold: true };
      ws.columns.forEach((col) => (col.width = 18));

      for (const emp of empList) {
        const row: (string | null)[] = [emp.employeeCode, emp.name, depName];
        let countPresent = 0;
        let countLeave = 0;
        let countAbsent = 0;

        for (let i = 0; i < 6; i++) {
          const date = monday.add(i, "day");
          const dateStr = date.format("YYYY-MM-DD");

          const att = attendanceMap[`${emp.id}-${dateStr}`];

          const leave = emp.LeaveRequest.find((lr) =>
            date.isBetween(
              dayjs(lr.startDate).tz(TIME_ZONE, true),
              dayjs(lr.endDate).tz(TIME_ZONE, true),
              "day",
              "[]"
            )
          );

          if (att?.checkInTime || att?.checkOutTime) {
            // có ít nhất giờ vào hoặc giờ ra
            const inTime = att.checkInTime
              ? dayjs(att.checkInTime).tz(TIME_ZONE).format("HH:mm")
              : "--:--";
            const outTime = att.checkOutTime
              ? dayjs(att.checkOutTime).tz(TIME_ZONE).format("HH:mm")
              : "--:--";
            row.push(`${inTime} → ${outTime}`);
            countPresent++;
          } else if (leave) {
            row.push(leave.leaveType);
            countLeave++;
          } else {
            row.push("Nghỉ không phép");
            countAbsent++;
          }
        }

        row.push(
          countPresent.toString(),
          countLeave.toString(),
          countAbsent.toString()
        );
        const newRow = ws.addRow(row);

        for (let i = 3; i < 9; i++) {
          const cell = newRow.getCell(i + 1);
          if (cell.value === "Nghỉ không phép") {
            cell.font = { color: { argb: "FFFF0000" } }; // đỏ
          } else if (
            emp.LeaveRequest.some((lr) => cell.value === lr.leaveType)
          ) {
            cell.font = { color: { argb: "FFFF9900" } }; // cam
          }
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=attendance_report_${monday.format(
          "YYYYMMDD"
        )}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Lỗi xuất báo cáo chấm công:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
