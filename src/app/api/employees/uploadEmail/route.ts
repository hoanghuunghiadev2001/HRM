/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Lấy ArrayBuffer trực tiếp
    const arrayBuffer = await file.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer); // ✅ load trực tiếp, không cần Buffer

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json(
        { error: "Không tìm thấy sheet trong file Excel" },
        { status: 400 }
      );
    }

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values as string[];

    const codeIndex = headers.findIndex((h) =>
      h?.toString().toLowerCase().includes("mã nv")
    );
    const emailIndex = headers.findIndex((h) =>
      h?.toString().toLowerCase().includes("email")
    );

    if (codeIndex === -1 || emailIndex === -1) {
      return NextResponse.json(
        { error: "Không tìm thấy cột Mã NV hoặc Email" },
        { status: 400 }
      );
    }

    const results: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const employeeCode = row.getCell(codeIndex).text?.trim();
      const email = row.getCell(emailIndex).text?.trim();
      if (!employeeCode || !email) return;
      results.push({ employeeCode, email, rowNumber });
    });

    const importResults: any[] = [];

    for (const item of results) {
      const { employeeCode, email, rowNumber } = item;

      const employee = await prisma.employee.findUnique({
        where: { employeeCode },
      });

      if (!employee) {
        importResults.push({
          row: rowNumber,
          employeeCode,
          email,
          status: "Employee not found",
        });
        continue;
      }

      await prisma.contactInfo.upsert({
        where: { employeeId: employee.id },
        update: { email },
        create: { email, employeeId: employee.id },
      });

      importResults.push({
        row: rowNumber,
        employeeCode,
        email,
        status: "Inserted/Updated",
      });
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      results: importResults,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
