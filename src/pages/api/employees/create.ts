import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Cho phép file lớn hơn mặc định
    },
  },
};

// Hàm parse ngày bắt buộc, throw lỗi nếu thiếu hoặc sai định dạng
function parseDateRequired(dateStr: any, fieldName: string): Date {
  if (!dateStr) {
    throw new Error(`Missing required date field: ${fieldName}`);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date format for field: ${fieldName}`);
  }
  return d;
}

// Hàm parse ngày nullable (có thể null)
function parseDateNullable(dateStr: any): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
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
    } = req.body;

    // Validate các trường bắt buộc
    if (
      !employeeCode ||
      !name ||
      !gender ||
      !birthDate ||
      !password ||
      typeof password !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid required fields" });
    }

    // Check trùng mã nhân viên
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeCode },
    });
    if (existingEmployee) {
      return res.status(409).json({ message: "EmployeeCode already exists" });
    }

    // Mã hoá password
    const hashedPassword = await bcrypt.hash(password, 10);

    let avatarPath: string | undefined = undefined;

    // Xử lý ảnh base64 nếu có
    if (avatarBase64) {
      const matches = avatarBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) {
        return res
          .status(400)
          .json({ message: "Invalid base64 format for image" });
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
          contractDate: parseDateRequired(
            workInfo.contractDate,
            "contractDate"
          ),
          contractType: workInfo.contractType,
          contractEndDate: parseDateRequired(
            workInfo.contractEndDate,
            "contractEndDate"
          ),
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
          documentsChecked: otherInfo.documentsChecked ?? false,
          updatedAt: parseDateNullable(otherInfo.updatedAt),
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

    res.status(201).json(newEmployee);
  } catch (error: any) {
    console.error("❌ Internal Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create employee" });
  }
}
