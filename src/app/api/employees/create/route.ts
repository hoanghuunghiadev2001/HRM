// /app/api/employee/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // App Router không dùng bodyParser của Next.js
  },
};

// Hàm parse ngày bắt buộc, throw lỗi nếu thiếu hoặc sai định dạng
function parseDateRequired(dateStr: unknown, fieldName: string): Date {
  if (dateStr === null || dateStr === undefined) {
    throw new Error(`Missing required date field: ${fieldName}`);
  }
  if (
    typeof dateStr !== "string" &&
    typeof dateStr !== "number" &&
    !(dateStr instanceof Date)
  ) {
    throw new Error(`Invalid type for date field: ${fieldName}`);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date format for field: ${fieldName}`);
  }
  return d;
}

// Hàm parse ngày nullable (có thể null)
function parseDateNullable(dateStr: unknown): Date | null {
  if (dateStr === null || dateStr === undefined) return null;
  if (
    typeof dateStr !== "string" &&
    typeof dateStr !== "number" &&
    !(dateStr instanceof Date)
  ) {
    return null;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export async function POST(req: NextRequest) {
  try {
    // Phải đọc JSON thủ công từ request.body()
    const body = await req.json();

    const {
      employeeCode,
      name,
      gender,
      birthDate,
      password,
      role,
      avatarBase64,

      workInfo,
      personalInfo,
      contactInfo,
      otherInfo,
    } = body;

    // Validate các trường bắt buộc
    if (
      !employeeCode ||
      !name ||
      !gender ||
      !birthDate ||
      !password ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { message: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Check trùng mã nhân viên
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeCode },
    });
    if (existingEmployee) {
      return NextResponse.json(
        { message: "EmployeeCode already exists" },
        { status: 409 }
      );
    }

    // Mã hoá password
    const hashedPassword = await bcrypt.hash(password, 10);

    let avatarPath: string | undefined = undefined;

    // Xử lý ảnh base64 nếu có
    if (avatarBase64) {
      const matches = avatarBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { message: "Invalid base64 format for image" },
          { status: 400 }
        );
      }

      const ext = matches[1].split("/")[1]; // ví dụ: png, jpg
      const base64Data = matches[2];
      const fileName = `employee-${employeeCode}-${Date.now()}.${ext}`;
      const filePath = path.join(process.cwd(), "public/uploads", fileName);

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

      avatarPath = `/uploads/${fileName}`;
    }

    // Xử lý workInfo
    const workInfoData = workInfo
      ? {
          department: workInfo.department,
          position: workInfo.position,
          specialization: workInfo.specialization,
          joinedTBD: parseDateNullable(workInfo.joinedTBD),
          joinedTeSCC: parseDateNullable(workInfo.joinedTeSCC),
          seniorityStart: parseDateNullable(workInfo.seniorityStart),
          seniority: workInfo.seniority ?? null,
          contractNumber: workInfo.contractNumber,
          contractDate: parseDateNullable(workInfo.contractDate),
          contractType: workInfo.contractType,
          contractEndDate: parseDateNullable(workInfo.contractEndDate),
        }
      : undefined;

    // Xử lý personalInfo
    const personalInfoData = personalInfo
      ? {
          identityNumber: personalInfo.identityNumber,
          issueDate: parseDateRequired(personalInfo.issueDate, "issueDate"),
          issuePlace: personalInfo.issuePlace,
          hometown: personalInfo.hometown,
          idAddress: personalInfo.idAddress,
          education: personalInfo.education ?? null,
          drivingLicense: personalInfo.drivingLicense ?? null,
          toyotaCertificate: personalInfo.toyotaCertificate ?? null,
          taxCode: personalInfo.taxCode,
          insuranceNumber: personalInfo.insuranceNumber,
          insuranceSalary: personalInfo.insuranceSalary,
        }
      : undefined;

    // Xử lý contactInfo
    const contactInfoData = contactInfo
      ? {
          phoneNumber: contactInfo.phoneNumber,
          relativePhone: contactInfo.relativePhone,
          companyPhone: contactInfo.companyPhone ?? null,
          email: contactInfo.email ?? null,
        }
      : undefined;

    // Xử lý otherInfo
    const otherInfoData = otherInfo
      ? {
          workStatus: otherInfo.workStatus,
          resignedDate: parseDateNullable(otherInfo.resignedDate),
          documentsChecked: otherInfo.documentsChecked ?? "",
          updatedAt: new Date(),
          VCB: otherInfo.VCB ?? null,
          MTCV: otherInfo.MTCV ?? null,
          PNJ: otherInfo.PNJ ?? null,
        }
      : undefined;

    // Tạo nhân viên mới
    const newEmployee = await prisma.employee.create({
      data: {
        employeeCode,
        name,
        gender,
        birthDate: parseDateRequired(birthDate, "birthDate"),
        password: hashedPassword,
        role,
        avatar: avatarPath,

        workInfo: workInfoData ? { create: workInfoData } : undefined,
        personalInfo: personalInfoData
          ? { create: personalInfoData }
          : undefined,
        contactInfo: contactInfoData ? { create: contactInfoData } : undefined,
        otherInfo: otherInfoData ? { create: otherInfoData } : undefined,
      },
      include: {
        workInfo: true,
        personalInfo: true,
        contactInfo: true,
        otherInfo: true,
      },
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error("❌ Internal Error:", error);
    return NextResponse.json(
      { message: "Failed to create employee" },
      { status: 500 }
    );
  }
}
