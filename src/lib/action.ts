/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import { WorkStatus } from "../../generated/prisma";

type ExcelRow = {
  [key: string]: any;
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

    return employees.map((employee: any) => ({
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
    }));
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

    // Use the identified row as headers
    const headers = rawData[headerRowIndex];

    // Skip the header row and the next row (column numbers), start from the data rows
    const dataRows = rawData
      .slice(headerRowIndex + 2)
      .filter((row) => row && row.length > 0 && row.some((cell) => cell));

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
          continue;
        }

        // Map Excel columns to Prisma model fields with flexible column name matching
        // Specifically look for "Mã NV" column for employee code
        const employeeCode = getColumnValue(
          row,
          "Mã",
          "nv",
          "Mã nv",
          "Mã NV "
        )?.toString();

        // Log available columns and the found employee code

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

        // Parse seniority from "X năm Y tháng" format
        const seniorityMonths = parseSeniority(row["Thâm niên"]);

        // Prepare related data
        const workInfoData = {
          department: department,
          position: position || "",
          specialization: row["Ngành"]?.toString(),
          joinedTBD: parseExcelDate(
            row["Ngày vào\n Tbd"] ||
              row["Ngày vào\n Tbd "] ||
              row["Ngày vào  Tbd"]
          ),
          joinedTeSCC: parseExcelDate(
            row["Ngày vào\n TeSCC"] ||
              row["Ngày vào  TeSCC"] ||
              row["Ngày vào\n TeSCC "]
          ),
          seniorityStart: parseExcelDate(row["Ngày bắt đâu tính thâm niên"]),
          seniority: seniorityMonths,
          contractNumber: row["Số HĐ"]?.toString(),
          contractDate: parseExcelDate(row["Ngày kí HĐ"]),
          contractType: row["Loại HĐ"]?.toString(),
          contractEndDate: parseExcelDate(row["Ngày hết hạn"]),
        };

        console.log("11111111" + workInfoData.joinedTBD);
        console.log("2222222" + workInfoData.joinedTeSCC);
        console.log("333333" + row["Ngày vào\n Tbd"] || row["Ngày vào Tbd"]);
        console.log(
          "4444444" + row["Ngày vào\n TeSCC"] || row["Ngày vào TeSCC"]
        );

        // Then update the employeeData to use the determined role:
        const employeeData = {
          employeeCode: employeeCode, // Generate code if missing
          name: employeeName,
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
          updatedAt: parseExcelDate(row["Thời gian update"]),
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
