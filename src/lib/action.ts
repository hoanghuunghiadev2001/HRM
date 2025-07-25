/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import {
  ContactInfo,
  Employee,
  OtherInfo,
  WorkInfo,
  WorkStatus,
} from "../../generated/prisma";
import { prisma } from "@/lib/prisma";

type ExcelRow = {
  [key: string]: any;
};

// import { Employee, WorkInfo, ContactInfo, OtherInfo } from "@prisma/client";

export type EmployeeWithRelations = Employee & {
  workInfo: WorkInfo | null;
  contactInfo: ContactInfo | null;
  otherInfo: OtherInfo | null;
};

export async function getEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeCode: true,
        name: true,
        workInfo: {
          select: {
            department: true,
            position: true,
            joinedTBD: true,
          },
        },
        contactInfo: {
          select: {
            phoneNumber: true,
            email: true,
          },
        },
        otherInfo: {
          select: {
            workStatus: true,
          },
        },
      },
      orderBy: {
        employeeCode: "asc",
      },
    });
    employees.map((employee: any) => {
      return {
        id: employee.id,
        employeeCode: employee.employeeCode,
        name: employee.name,
        department: employee.workInfo?.department || null,
        position: employee.workInfo?.position || null,
        joinedTBD: employee.workInfo?.joinedTBD
          ? employee.workInfo.joinedTBD.toISOString()
          : null,
        phoneNumber: employee.contactInfo?.phoneNumber || null,
        email: employee.contactInfo?.email || null,
        workStatus: employee.otherInfo?.workStatus || "PROBATION",
      };
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error("Failed to fetch employees");
  }
}

export async function importEmployees(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file provided");
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Get all data as an array of arrays
    const rawData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      defval: null,
      raw: false,
    });

    // Log the first few rows to understand the structure
    console.log("First 10 rows of Excel data:");
    rawData.slice(0, 10).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });

    // Find the row with headers - look for key identifiable columns
    let headerRowIndex = -1;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && row.length > 0) {
        // Convert row to string and check for key headers
        const rowString = row.join("|").toLowerCase();

        // Look for multiple possible header indicators
        const hasPositionHeader =
          rowString.includes("chức vụ") || rowString.includes("position");
        const hasDateHeader =
          rowString.includes("ngày vào") || rowString.includes("joined");
        const hasNameHeader =
          rowString.includes("tên") ||
          rowString.includes("name") ||
          rowString.includes("họ tên");
        const hasCodeHeader =
          rowString.includes("mã nv") ||
          rowString.includes("employee") ||
          rowString.includes("code");

        // If we find at least 2 key headers, this is likely the header row
        const headerCount = [
          hasPositionHeader,
          hasDateHeader,
          hasNameHeader,
          hasCodeHeader,
        ].filter(Boolean).length;

        if (headerCount >= 2) {
          headerRowIndex = i;
          console.log(
            `Found header row at index ${headerRowIndex} with headers:`,
            row
          );
          break;
        }
      }
    }

    if (headerRowIndex === -1) {
      // If we can't find headers automatically, let's try a different approach
      // Look for the first row that has substantial content and isn't just numbers
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i];
        if (row && row.length > 5) {
          const hasText = row.some(
            (cell) =>
              cell &&
              typeof cell === "string" &&
              cell.length > 2 &&
              isNaN(Number(cell))
          );

          if (hasText && !row.every((cell) => !isNaN(Number(cell)))) {
            headerRowIndex = i;
            console.log(
              `Using row ${headerRowIndex} as header row (fallback):`,
              row
            );
            break;
          }
        }
      }
    }

    if (headerRowIndex === -1) {
      throw new Error(
        "Could not identify header row in Excel file. Please ensure your file has proper column headers."
      );
    }

    console.log(`Found header row at index ${headerRowIndex}`);

    // Use the identified row as headers
    const headers = rawData[headerRowIndex];

    // Skip the header row and the next row (column numbers), start from the data rows
    const dataRows = rawData
      .slice(headerRowIndex + 2)
      .filter((row) => row && row.length > 0 && row.some((cell) => cell));

    console.log(`Found ${dataRows.length} data rows`);
    console.log("First data row:", dataRows[0]);

    // Convert to objects using the headers
    const jsonData: ExcelRow[] = dataRows.map((row, index) => {
      const obj: ExcelRow = {};
      headers.forEach((header, headerIndex) => {
        if (header && headerIndex < row.length) {
          obj[header.toString()] = row[headerIndex];
        }
      });

      // Add row index for debugging
      obj["_rowIndex"] = headerRowIndex + 3 + index;

      return obj;
    });

    console.log("Sample processed data:");
    console.log("Headers:", headers);
    console.log("First data object:", jsonData[0]);
    console.log("Available keys:", Object.keys(jsonData[0] || {}));

    const result = {
      success: 0,
      updated: 0,
      created: 0,
      errors: [] as Array<{ row: number; message: string }>,
      total: jsonData.length,
    };

    // Helper function to find column value by multiple possible names
    const getColumnValue = (row: ExcelRow, ...possibleNames: string[]) => {
      for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null) {
          return row[name];
        }
      }
      return null;
    };

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowIndex = headerRowIndex + 3 + i; // Excel rows start at 1, header + 2 + data index

      try {
        // Skip empty rows or rows without employee code
        if (Object.keys(row).length === 0) {
          console.log(`Skipping row ${rowIndex} - no employee code`);
          continue;
        }

        // Map Excel columns to Prisma model fields with flexible column name matching
        // Specifically look for "Mã NV" column for employee code
        const employeeCode =
          row["Mã NV"]?.toString() ||
          getColumnValue(row, "Employee Code", "Code", "STT")?.toString();

        // Log available columns and the found employee code
        console.log("Available columns:", Object.keys(row));
        console.log(
          "Found employee code:",
          employeeCode,
          "from column Mã NV:",
          row["Mã NV "]
        );
        const employeeName = getColumnValue(
          row,
          "Tên",
          "Họ tên",
          "Name",
          "Full Name"
        )?.toString();
        const departmentValue = getColumnValue(
          row,
          "Bộ phận",
          "Department",
          "Phòng ban"
        )?.toString();
        const position = getColumnValue(
          row,
          "Chức vụ",
          "Position",
          "Vị trí"
        )?.toString();

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

        console.log(
          `Department mapping: "${departmentValue}" -> Department: "${department}", Role: "${role}"`
        );

        // Parse seniority from "X năm Y tháng" format
        const seniorityMonths = row["Thâm niên"];

        // Prepare related data
        const workInfoData = {
          department: department,
          position: position || "",
          specialization: row["Ngành"]?.toString(),
          joinedTBD: parseExcelDate(
            row["Ngày vào\n Tbd"] || row["Ngày vào Tbd"]
          ),
          joinedTeSCC: parseExcelDate(
            row["Ngày vào\n TeSCC"] || row["Ngày vào TeSCC"]
          ),
          seniorityStart: parseExcelDate(row["Ngày bắt đâu tính thâm niên"]),
          seniority: seniorityMonths,
          contractNumber: row["Số HĐ"]?.toString(),
          contractDate: parseExcelDate(row["Ngày kí HĐ"]),
          contractType: row["Loại HĐ"]?.toString(),
          contractEndDate: parseExcelDate(row["Ngày hết hạn"]),
        };

        // Then update the employeeData to use the determined role:
        const employeeData = {
          employeeCode: employeeCode || `EMP_${Date.now()}_${i}`, // Generate code if missing
          name: employeeName || "Unknown",
          gender: mapGender(getColumnValue(row, "Giới tính", "Gender", "Sex")),
          birthDate: parseExcelDate(
            getColumnValue(row, "Ngày sinh", "Birth Date", "DOB")
          ),
          role: role,
        };

        // Validate required fields
        if (!employeeData.name || employeeData.name === "Unknown") {
          throw new Error("Tên nhân viên là bắt buộc");
        }

        console.log(
          `Processing employee: ${employeeData.employeeCode} - ${employeeData.name}`
        );

        // Check if employee already exists
        const existingEmployee = await prisma.employee.findUnique({
          where: { employeeCode: employeeData.employeeCode },
          include: {
            workInfo: true,
            personalInfo: true,
            contactInfo: true,
            otherInfo: true,
          },
        });

        const personalInfoData = {
          identityNumber: row["Số CMND/CCCD"]?.toString(),
          issueDate: parseExcelDate(row["Ngày cấp"]),
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
          insuranceSalary: parseSalary(
            row[" Lương \nđóng BH "] || row["Lương đóng BH"]
          ),
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
          workStatus:
            row["Chính thức"] === "Chính thức"
              ? WorkStatus.OFFICIAL
              : row["chính thức"] === "học việc"
              ? WorkStatus.PROBATION
              : WorkStatus.RESIGNED,
          resignedDate: parseExcelDate(row["Ngày nghỉ"]),
          documentsChecked: row["Check hồ sơ"]?.toString(),
          VCB: row["VCB"]?.toString(),
          MTCV: row["Bảng MTCV"]?.toString(),
          PNJ: row["PNJ"]?.toString(),
        };

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
          console.log(`Updated employee: ${employeeData.employeeCode}`);
        } else {
          // Create new employee with related information
          await prisma.employee.create({
            data: {
              ...employeeData,
              password: await bcrypt.hash("123456", 10),
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
          console.log(`Created employee: ${employeeData.employeeCode}`);
        }

        result.success++;
      } catch (error) {
        console.error(`Error processing row ${rowIndex}:`, error);
        result.errors.push({
          row: rowIndex,
          message:
            error instanceof Error ? error.message : "Lỗi không xác định",
        });
      }
    }

    revalidatePath("/");
    return result;
  } catch (error) {
    console.error("Import error:", error);
    throw error;
  }
}

// Helper functions
function parseExcelDate(value: any): Date | null {
  if (!value) return null;

  // If it's already a Date object
  if (value instanceof Date) return value;

  // If it's an Excel serial date number
  if (typeof value === "number") {
    // Excel dates are number of days since 1900-01-01
    // JavaScript dates are milliseconds since 1970-01-01
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    return date;
  }

  // If it's a string, try to parse it
  if (typeof value === "string") {
    // Try to parse various date formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;

    // Try DD/MM/YYYY format
    const parts = value.split(/[/\-.]/);
    if (parts.length === 3) {
      // Assuming DD/MM/YYYY format
      const day = Number.parseInt(parts[0], 10);
      const month = Number.parseInt(parts[1], 10) - 1; // JS months are 0-based
      const year = Number.parseInt(parts[2], 10);

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

function parseSalary(value: any): number | null {
  if (!value) return null;

  // Remove spaces, dots, and commas, then parse as integer
  const cleanValue = value.toString().replace(/[\s.,]/g, "");
  const parsed = Number.parseInt(cleanValue, 10);

  return isNaN(parsed) ? null : parsed;
}
