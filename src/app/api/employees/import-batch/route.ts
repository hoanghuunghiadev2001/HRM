/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Kích hoạt plugin
dayjs.extend(utc);
dayjs.extend(timezone);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const batchJson = formData.get("batch") as string;
    const headerRowIndex = Number.parseInt(
      formData.get("headerRowIndex") as string,
      10
    );

    if (!batchJson) {
      return NextResponse.json(
        { error: "No batch data provided" },
        { status: 400 }
      );
    }

    const batch = JSON.parse(batchJson);

    const result = {
      success: 0,
      updated: 0,
      created: 0,
      errors: [] as Array<{ row: number; message: string }>,
      total: batch.length,
    };

    logger.info(`Processing batch of ${batch.length} employees`);

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const rowIndex = row._rowIndex || headerRowIndex + 3 + i;
      let employeeCode: string | null = null; // Declare employeeCode here

      try {
        // Skip empty rows
        if (Object.keys(row).length <= 1) {
          // Only has _rowIndex
          continue;
        }

        // Process employee data
        employeeCode = row["Mã NV "]?.toString() || null;
        const employeeName = row["Tên"]?.toString() || null;
        const departmentValue = row["Bộ phận"]?.toString() || null;
        const position = row["Chức vụ"]?.toString() || null;

        // Validate required fields
        if (!employeeCode) {
          throw new Error("Mã NV là bắt buộc");
        }

        if (!employeeName) {
          throw new Error("Tên nhân viên là bắt buộc");
        }

        // Parse department and role based on - separator and -QL suffix
        let department = departmentValue || "";
        let role: "USER" | "MANAGER" | "ADMIN" = "USER";

        if (department) {
          // Check if department contains a dash
          if (department.includes("-")) {
            // Check if it ends with -QL (indicating manager role)
            if (department.endsWith("-QL")) {
              role = "MANAGER";
            }
            // Always take the part before the first dash as the department
            department = department.split("-")[0];
          }
          // If no dash, use the entire value as department (role remains USER)
        }

        // Check if employee already exists
        const existingEmployee = await prisma.employee.findUnique({
          where: { employeeCode },
          include: {
            workInfo: true,
            personalInfo: true,
            contactInfo: true,
            otherInfo: true,
          },
        });

        // Parse dates and other fields
        const birthDate = parseExcelDate(row["Ngày sinh"]);
        const joinedTBD = dayjs
          .utc(parseExcelDate(row["Ngày vào\n Tbd"] || row["Ngày vào Tbd"]))
          .tz("Asia/Ho_Chi_Minh")
          .toDate();
        const joinedTeSCC = dayjs
          .utc(parseExcelDate(row["Ngày vào\n TeSCC"] || row["Ngày vào TeSCC"]))
          .tz("Asia/Ho_Chi_Minh")
          .toDate();
        const seniorityStart = dayjs
          .utc(parseExcelDate(row["Ngày bắt đâu tính thâm niên"]))
          .tz("Asia/Ho_Chi_Minh")
          .toDate();
        const contractDate = dayjs
          .utc(parseExcelDate(row["Ngày kí HĐ"]))
          .tz("Asia/Ho_Chi_Minh")
          .toDate();
        const contractEndDate = dayjs
          .utc(parseExcelDate(row["Ngày hết hạn"]))
          .tz("Asia/Ho_Chi_Minh")
          .toDate();
        const issueDate = dayjs
          .utc(parseExcelDate(row["Ngày cấp"]))
          .tz("Asia/Ho_Chi_Minh")
          .toDate();
        const resignedDate = dayjs
          .utc(parseExcelDate(row["Ngày nghỉ"]))
          .tz("Asia/Ho_Chi_Minh")
          .toDate();
        const updatedAt = dayjs
          .utc(parseExcelDate(row["Thời gian update"]))
          .tz("Asia/Ho_Chi_Minh")
          .toDate();

        // Parse seniority
        const seniorityMonths = parseSeniority(row["Thâm niên"]);

        // Parse salary
        const insuranceSalary = parseSalary(
          row[" Lương \nđóng BH "] || row["Lương đóng BH"]
        );

        // Map gender
        const gender = mapGender(row["Giới tính"]);

        // Map work status
        const workStatus = mapWorkStatus(row["Chính thức"], row["Nghỉ việc"]);

        // Prepare data objects
        const employeeData = {
          employeeCode,
          name: employeeName,
          gender,
          birthDate,
          role,
        };

        const workInfoData = {
          department,
          position: position || "",
          specialization: row["Ngành"]?.toString(),
          joinedTBD,
          joinedTeSCC,
          seniorityStart,
          seniority: seniorityMonths,
          contractNumber: row["Số HĐ"]?.toString(),
          contractDate,
          contractType: row["Loại HĐ"]?.toString(),
          contractEndDate,
        };

        const personalInfoData = {
          identityNumber: row["Số CMND/CCCD"]?.toString(),
          issueDate,
          issuePlace: row["Nơi Cấp"]?.toString(),
          hometown: row["Nguyên quán"]?.toString(),
          idAddress: row["Địa chỉ theo chứng minh thư"]?.toString(),
          education: row["Trình độ"]?.toString(),
          drivingLicense: (
            row["Giấy phép\nlái xe"] || row["Giấy phép lái xe"]
          )?.toString(),
          toyotaCertificate: row["Chứng chỉ toyota"]?.toString(),
          taxCode: row["MST"]?.toString(),
          insuranceNumber: row["Số sổ Bảo hiểm"]?.toString(),
          insuranceSalary,
        };

        const contactInfoData = {
          phoneNumber: row["Điện thoại cá nhân"]?.toString(),
          relativePhone: row["Số ĐT người thân"]?.toString(),
          companyPhone: (
            row["Điện thoại \ncông ty cấp"] || row["Điện thoại công ty cấp"]
          )?.toString(),
          email: row["Mail"]?.toString(),
        };

        const otherInfoData = {
          workStatus,
          resignedDate,
          documentsChecked: row["Check hồ sơ"]?.toString(),
          updatedAt,
          VCB: row["VCB"]?.toString(),
          MTCV: row["Bảng MTCV"]?.toString(),
          PNJ: row["PNJ"]?.toString(),
        };

        logger.debug(`Processing employee: ${employeeCode}`, {
          name: employeeName,
          department,
          position,
        });

        if (existingEmployee) {
          // Update existing employee
          await prisma.employee.update({
            where: { id: existingEmployee.id },
            data: {
              ...employeeData,
              // Don't update password for existing employees
              password: existingEmployee.password,
            },
          });

          // Update or create WorkInfo
          await prisma.workInfo.upsert({
            where: { employeeId: existingEmployee.id },
            update: workInfoData,
            create: {
              ...workInfoData,
              employeeId: existingEmployee.id,
            },
          });

          // Update or create PersonalInfo
          await prisma.personalInfo.upsert({
            where: { employeeId: existingEmployee.id },
            update: personalInfoData,
            create: {
              ...personalInfoData,
              employeeId: existingEmployee.id,
            },
          });

          // Update or create ContactInfo
          await prisma.contactInfo.upsert({
            where: { employeeId: existingEmployee.id },
            update: contactInfoData,
            create: {
              ...contactInfoData,
              employeeId: existingEmployee.id,
            },
          });

          // Update or create OtherInfo
          await prisma.otherInfo.upsert({
            where: { employeeId: existingEmployee.id },
            update: otherInfoData,
            create: {
              ...otherInfoData,
              employeeId: existingEmployee.id,
            },
          });

          result.updated++;
        } else {
          // Create new employee with related information
          await prisma.employee.create({
            data: {
              ...employeeData,
              password: await hashPassword("TBD" + employeeData.employeeCode),
              workInfo: {
                create: workInfoData,
              },
              personalInfo: {
                create: personalInfoData,
              },
              contactInfo: {
                create: contactInfoData,
              },
              otherInfo: {
                create: otherInfoData,
              },
            },
          });

          result.created++;
        }

        result.success++;
      } catch (error) {
        logger.error(`Error processing employee ${employeeCode}`, {
          error: error instanceof Error ? error.message : "Unknown error",
          row: rowIndex,
        });
        console.error(`Error processing row ${rowIndex}:`, error);
        result.errors.push({
          row: rowIndex,
          message:
            error instanceof Error ? error.message : "Lỗi không xác định",
        });
      }
    }

    revalidatePath("/");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Batch import error:", error);
    return NextResponse.json(
      {
        error: "Failed to import employees batch",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions
function parseExcelDate(value: any): Date | null {
  if (!value) return null;

  // Nếu đã là Date
  if (value instanceof Date) return value;

  // Nếu là số serial Excel
  if (typeof value === "number") {
    // Excel tính từ 1900-01-01 nhưng sai vì tính cả ngày 29/02/1900 (không tồn tại)
    // Do đó cần trừ đi 1 ngày
    const excelEpoch = new Date(1899, 11, 30); // 1899-12-30
    const date = new Date(excelEpoch.getTime() + (value - 1) * 86400000); // 86400000 = 1 ngày
    return date;
  }

  // Nếu là chuỗi
  if (typeof value === "string") {
    // Thử định dạng ISO hoặc các định dạng phổ biến
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) return isoDate;

    // Thử định dạng DD/MM/YYYY hoặc DD-MM-YYYY
    const parts = value.split(/[/\-.]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
  }

  return null;
}

function mapGender(value: any): "MALE" | "FEMALE" {
  if (!value) return "MALE";

  const normalizedValue = value.toString().toLowerCase().trim();

  if (
    normalizedValue === "nam" ||
    normalizedValue === "male" ||
    normalizedValue === "m"
  ) {
    return "MALE";
  } else if (
    normalizedValue === "nữ" ||
    normalizedValue === "nu" ||
    normalizedValue === "female" ||
    normalizedValue === "f"
  ) {
    return "FEMALE";
  }

  return "MALE"; // Default
}

function mapWorkStatus(
  officialValue: any,
  resignedValue: any
): "OFFICIAL" | "PROBATION" | "RESIGNED" {
  if (
    resignedValue &&
    (resignedValue === "x" ||
      resignedValue === "X" ||
      resignedValue === true ||
      resignedValue === 1)
  ) {
    return "RESIGNED";
  }

  if (
    officialValue &&
    (officialValue === "x" ||
      officialValue === "X" ||
      officialValue === true ||
      officialValue === 1)
  ) {
    return "OFFICIAL";
  }

  return "PROBATION";
}

function parseSeniority(value: any): number | null {
  if (!value) return null;

  const str = value.toString().toLowerCase();

  // Parse "X năm Y tháng" format
  const yearMatch = str.match(/(\d+)\s*năm/);
  const monthMatch = str.match(/(\d+)\s*tháng/);

  let totalMonths = 0;

  if (yearMatch) {
    totalMonths += Number.parseInt(yearMatch[1]) * 12;
  }

  if (monthMatch) {
    totalMonths += Number.parseInt(monthMatch[1]);
  }

  return totalMonths > 0 ? totalMonths : null;
}

function parseSalary(value: any): number | null {
  if (!value) return null;

  // Remove spaces, dots, and commas, then parse as integer
  const cleanValue = value.toString().replace(/[\s.,]/g, "");
  const parsed = Number.parseInt(cleanValue, 10);

  return isNaN(parsed) ? null : parsed;
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
