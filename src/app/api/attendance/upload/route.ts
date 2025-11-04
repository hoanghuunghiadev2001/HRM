/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function cellToHHmm(val: any): string | null {
  if (val === undefined || val === null || String(val).trim() === "")
    return null;
  if (val instanceof Date && !isNaN(val.getTime()))
    return dayjs(val).format("HH:mm");

  const s = String(val).trim();
  const m = s.match(/(\d{1,2}):(\d{1,2})(?::\d{1,2})?/);
  if (m) {
    const hh = String(Number(m[1])).padStart(2, "0");
    const mm = String(Number(m[2])).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  const num = Number(s);
  if (!isNaN(num)) {
    if (num >= 0 && num < 1) {
      const totalMinutes = Math.round(num * 24 * 60);
      const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
      const mm = String(totalMinutes % 60).padStart(2, "0");
      return `${hh}:${mm}`;
    }
    try {
      const epoch = new Date(Date.UTC(1899, 11, 30));
      const ms = Math.round(num * 24 * 60 * 60 * 1000);
      const d = new Date(epoch.getTime() + ms);
      if (!isNaN(d.getTime())) return dayjs(d).format("HH:mm");
    } catch {}
  }
  return null;
}

function parseTimeToUTC(workDate: Date, hhmm: string | null): Date | null {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const [hh, mm] = hhmm.split(":").map(Number);

  // Tạo dayjs ở VN
  const dt = dayjs(workDate)
    .tz("Asia/Ho_Chi_Minh")
    .hour(hh)
    .minute(mm)
    .second(0)
    .millisecond(0);

  // Lấy UTC Date
  return dt.utc().toDate();
}

function calcHours(
  checkInHHmm: string | null,
  checkOutHHmm: string | null
): number {
  if (!checkInHHmm || !checkOutHHmm) return 0;
  const [h1, m1] = checkInHHmm.split(":").map(Number);
  const [h2, m2] = checkOutHHmm.split(":").map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const importedById = formData.get("importedById") as string | null; // id nhân viên gửi file

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheetName = "ThongKe";
    const sheet = workbook.Sheets[sheetName];
    if (!sheet)
      return NextResponse.json(
        { error: `Sheet '${sheetName}' not found` },
        { status: 400 }
      );

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: true,
    });

    const dateRow = rows[3]?.[0] || "";
    const match = String(dateRow).match(/(\d{2}\/\d{2}\/\d{4})/);
    if (!match)
      return NextResponse.json(
        { error: "Không đọc được ngày từ file Excel" },
        { status: 400 }
      );

    const [dd, mm, yyyy] = match[1].split("/");
    const workDate = dayjs(`${yyyy}-${mm}-${dd}`).startOf("day").toDate();
    workDate.setUTCHours(0, 0, 0, 0);

    let startIndex = rows.findIndex(
      (r) => r && (r[0] === 1 || r[0] === "1" || r[0] === "STT")
    );
    if (startIndex === -1) {
      startIndex = rows.findIndex(
        (r) => r && r[1] && String(r[1]).trim() && String(r[2] ?? "").trim()
      );
      if (startIndex === -1)
        return NextResponse.json(
          { error: "Không tìm thấy dữ liệu nhân viên trong file" },
          { status: 400 }
        );
    }

    // Tạo log import
    const importLog = await prisma.attendanceImportLog.create({
      data: {
        filename: file.name || "upload.xlsx",
        importedById: Number(importedById) ?? null,
        importedAt: dayjs().tz("Asia/Ho_Chi_Minh").toDate(), // giờ Việt Nam
      },
    });

    let imported = 0;
    let skipped = 0;

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i] || [];
      const employeeCode = row[1] ? String(row[1]).trim() : null;
      if (!employeeCode) continue;

      const checkInHHmm = cellToHHmm(row[4]);

      let checkOutHHmm: string | null = null;
      let consumedIndex = i;
      for (let j = i + 1; j <= Math.min(i + 3, rows.length - 1); j++) {
        const rnext = rows[j] || [];
        const colD = rnext[3] ? String(rnext[3]).trim().toLowerCase() : "";
        const colBnext = rnext[1] ? String(rnext[1]).trim() : "";
        if (colBnext) break;
        if (colD && colD.startsWith("ra")) {
          checkOutHHmm = cellToHHmm(rnext[4]);
          consumedIndex = j;
          break;
        }
        const maybeTime = cellToHHmm(rnext[4]);
        if (maybeTime && (!rnext[1] || String(rnext[1]).trim() === "")) {
          checkOutHHmm = maybeTime;
          consumedIndex = j;
          break;
        }
      }

      if (!checkInHHmm && !checkOutHHmm) {
        skipped++;
        i = Math.max(i, consumedIndex);
        continue;
      }

      const employee = await prisma.employee.findUnique({
        where: { employeeCode },
        include: { otherInfo: true },
      });
      if (!employee) {
        skipped++;
        i = Math.max(i, consumedIndex);
        continue;
      }

      if (employee.otherInfo?.workStatus === "RESIGNED") {
        skipped++;
        i = Math.max(i, consumedIndex);
        continue;
      }

      const checkInDateUTC = parseTimeToUTC(workDate, checkInHHmm);
      const checkOutDateUTC = parseTimeToUTC(workDate, checkOutHHmm);

      const existing = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          date: {
            gte: dayjs(workDate).startOf("day").toDate(),
            lte: dayjs(workDate).endOf("day").toDate(),
          },
        },
      });

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            checkInTime: checkInDateUTC,
            checkOutTime: checkOutDateUTC,
            workingHours: calcHours(checkInHHmm, checkOutHHmm),
            importId: importLog.id,
          },
        });
      } else {
        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date: workDate,
            checkInTime: checkInDateUTC,
            checkOutTime: checkOutDateUTC,
            workingHours: calcHours(checkInHHmm, checkOutHHmm),
            importId: importLog.id,
          },
        });
      }

      imported++;
      i = Math.max(i, consumedIndex);
    }

    return NextResponse.json({
      message: "Import attendance success",
      imported,
      skipped,
      date: workDate,
      importId: importLog.id,
    });
  } catch (err) {
    console.error("❌ Import failed:", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
