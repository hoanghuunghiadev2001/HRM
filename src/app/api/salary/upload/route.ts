/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const month = parseInt(formData.get("month") as string);
    const year = parseInt(formData.get("year") as string);

    if (!file || isNaN(month) || isNaN(year)) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    // Tạo Batch quản lý
    const batch = await prisma.salaryBatch.create({
      data: {
        filename: file.name,
        month,
        year,
        createdById: 1,
        status: "processing",
      },
    });

    let successCount = 0;

    // ==========================================
    // 1. XỬ LÝ SHEET QUẢN LÝ (QL)
    // ==========================================
    const wsQL = workbook.Sheets["QL"];
    if (wsQL) {
      const rows = XLSX.utils.sheet_to_json(wsQL, { header: 1 }) as any[][];
      for (const row of rows) {
        const empCode = String(row[1] || "").trim();
        if (!/^\d+$/.test(empCode)) continue; // Chỉ lấy dòng có mã nhân viên

        const employee = await prisma.employee.findUnique({
          where: { employeeCode: empCode },
        });
        if (!employee) continue;

        const dataQL: any = {
          batchId: batch.id,
          employeeId: employee.id,
          month,
          year,
          type: "MANAGER",
          employeeCode: empCode,
          fullName: employee.name,
          position: String(row[2] || ""),
          workingDays: Number(row[7]) || 0,
          notOfficial: Number(row[8]) || 0,
          // LƯƠNG CỐ ĐỊNH
          baseSalary: Number(row[9]) || 0,
          efficiencySalary: Number(row[10]) || 0,
          salary70: Number(row[11]) || 0,
          // PHỤ CẤP
          phoneAllowance: Number(row[12]) || 0,
          seniorityAllowance: Number(row[13]) || 0,
          mealAllowance: Number(row[14]) || 0,
          maternityAllowance: Number(row[15]) || 0,
          // NĂNG SUẤT
          productivitySalary: Number(row[16]) || 0,
          productivityOther: Number(row[17]) || 0, // Lương NS Cố vấn
          productivitySCC: Number(row[18]) || 0,
          productivityPaint: Number(row[19]) || 0,
          productivityAccessory: Number(row[20]) || 0,
          productivityParts: Number(row[21]) || 0,
          // THƯỞNG & CỘNG THÊM
          otherWork: Number(row[22]) || 0, // Kiêm nhiệm
          salaryAdjust: Number(row[23]) || 0, // Bù lương
          bonus: Number(row[24]) || 0,
          overtime:
            (Number(row[25]) || 0) +
            (Number(row[26]) || 0) +
            (Number(row[27]) || 0),
          // KHẤU TRỪ
          salaryDeduction: Number(row[29]) || 0,
          insuranceDeduction: Number(row[31]) || 0, // BHXH 9.5%
          unemploymentInsu: Number(row[32]) || 0, // BHTN 1%
          unionFee: Number(row[33]) || 0, // Công đoàn
          advancePayment: Number(row[34]) || 0,
          socialWorkDeduction: Number(row[35]) || 0,
          healthCardDeduction: Number(row[36]) || 0,
          insuranceArrears: Number(row[37]) || 0,
          taxCompensation: Number(row[38]) || 0,
          taxTNCN: Number(row[39]) || 0,
          salaryDeductionFinal: Number(row[40]) || 0,
          phoneDeduction: Number(row[41]) || 0,
          taxRefund: Number(row[42]) || 0,
          // TỔNG & THỰC NHẬN
          totalGross: Number(row[30]) || 0,
          totalNet: Number(row[43]) || 0,
          firstReceived: Number(row[44]) || 0,
          bonusReceived: Number(row[45]) || 0,
          actualReceived: Number(row[46]) || 0,
        };
        await upsertSalary(dataQL);
        successCount++;
      }
    }

    // ==========================================
    // 2. XỬ LÝ SHEET NHÂN VIÊN (NV)
    // ==========================================
    const wsNV = workbook.Sheets["NV"];
    if (wsNV) {
      const rows = XLSX.utils.sheet_to_json(wsNV, { header: 1 }) as any[][];
      for (const row of rows) {
        const empCode = String(row[1] || "").trim();
        if (!/^\d+$/.test(empCode)) continue;

        const employee = await prisma.employee.findUnique({
          where: { employeeCode: empCode },
        });
        if (!employee) continue;

        const dataNV: any = {
          batchId: batch.id,
          employeeId: employee.id,
          month,
          year,
          type: "STAFF",
          employeeCode: empCode,
          fullName: employee.name,
          position: String(row[3] || ""),
          grade: String(row[4] || ""),
          insuranceLevel: String(row[5] || ""),
          workingDays: Number(row[7]) || 0,
          notOfficial: Number(row[8]) || 0,
          // LƯƠNG CỐ ĐỊNH
          baseSalary: Number(row[9]) || 0,
          efficiencySalary: Number(row[10]) || 0,
          salary70: Number(row[11]) || 0,
          // PHỤ CẤP
          phoneAllowance: Number(row[12]) || 0,
          seniorityAllowance: Number(row[13]) || 0,
          mealAllowance: Number(row[14]) || 0,
          maternityAllowance: Number(row[15]) || 0,
          houseAllowance: Number(row[29]) || 0,
          // NĂNG SUẤT
          productivitySalary: Number(row[16]) || 0,
          productivityOther: Number(row[17]) || 0, // NS Khác
          productivitySCC: Number(row[18]) || 0,
          productivityPaint: Number(row[19]) || 0,
          productivityAccessory: Number(row[20]) || 0,
          productivityParts: Number(row[21]) || 0,
          // THƯỞNG
          bonusDay10: Number(row[22]) || 0,
          salaryAdjust: Number(row[23]) || 0,
          bonusDay25: Number(row[24]) || 0,
          // KHẤU TRỪ
          salaryDeduction: Number(row[30]) || 0,
          insuranceDeduction: Number(row[32]) || 0,
          unemploymentInsu: Number(row[33]) || 0,
          unionFee: Number(row[34]) || 0,
          advancePayment: Number(row[35]) || 0,
          socialWorkDeduction: Number(row[36]) || 0,
          healthCardDeduction: Number(row[37]) || 0,
          insuranceArrears: Number(row[38]) || 0,
          taxCompensation: Number(row[39]) || 0,
          taxTNCN: Number(row[40]) || 0,
          phoneDeduction: Number(row[41]) || 0,
          taxRefund: Number(row[42]) || 0,
          salaryDeductionFinal: Number(row[43]) || 0,
          // TỔNG & THỰC NHẬN
          totalGross: Number(row[31]) || 0,
          totalNet: Number(row[44]) || 0,
          firstReceived: Number(row[45]) || 0,
          bonusReceived: Number(row[46]) || 0,
          actualReceived: Number(row[47]) || 0,
        };
        await upsertSalary(dataNV);
        successCount++;
      }
    }

    await prisma.salaryBatch.update({
      where: { id: batch.id },
      data: { status: "success", totalRows: successCount },
    });

    return NextResponse.json({
      message: "Upload thành công",
      total: successCount,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function upsertSalary(data: any) {
  await prisma.salary.upsert({
    where: {
      employeeId_month_year_type: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
        type: data.type,
      },
    },
    update: data,
    create: data,
  });
}
