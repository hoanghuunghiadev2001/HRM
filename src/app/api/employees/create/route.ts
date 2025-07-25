import "server-only";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

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
    // Đọc JSON từ request
    const body = await req.json();

    const {
      employeeCode,
      name,
      gender,
      birthDate,
      password,
      role,
      avatar,

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

    // Xử lý avatar upload lên Cloudinary (nếu có)
    let avatarPath: string | undefined = undefined;
    if (avatar) {
      const matches = avatar.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { message: "Invalid base64 format for image" },
          { status: 400 }
        );
      }
      try {
        const res = await cloudinary.uploader.upload(avatar, {
          folder: "employee_avatars",
          public_id: `employee-${employeeCode}-${Date.now()}`,
        });
        avatarPath = res.secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
      }
    }

    // Nếu có workInfo.positionId thì lấy Position, tính level và cập nhật level nếu cần
    if (workInfo?.positionId) {
      const position = await prisma.position.findUnique({
        where: { id: workInfo.positionId },
      });

      if (position?.name) {
        let newLevel = 1;
        const posName = position.name.toLowerCase();

        if (posName.includes("tổ trưởng")) {
          newLevel = 2;
        } else if (posName.includes("trưởng phòng")) {
          newLevel = 3;
        } else if (
          posName.includes("tổng giám đốc") ||
          posName.includes("phó tổng giám đốc")
        ) {
          newLevel = 5;
        } else if (posName.includes("giám đốc")) {
          newLevel = 4;
        }

        if (newLevel !== position.level) {
          await prisma.position.update({
            where: { id: workInfo.positionId },
            data: { level: newLevel },
          });
        }
      }
    }

    // Xử lý workInfo (không có level nữa)
    const workInfoData = workInfo
      ? {
          departmentId: workInfo.departmentId,
          positionId: workInfo.positionId,
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
        isActive: false,
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
