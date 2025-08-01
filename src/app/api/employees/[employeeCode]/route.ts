/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function getEmployeeCodeFromUrl(urlString: string) {
  const url = new URL(urlString);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function GET(req: NextRequest) {
  const employeeCode = getEmployeeCodeFromUrl(req.url);
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ message: "Token không hợp lệ" }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
      include: {
        workInfo: { include: { department: true, position: true } },
        personalInfo: true,
        contactInfo: true,
        otherInfo: true,
        LeaveRequest: true,
      },
    });

    if (!employee) return NextResponse.json({ message: "Không tìm thấy nhân viên" }, { status: 404 });

    const formattedEmployee = {
      ...employee,
      birthDate: formatDate(employee.birthDate),
      workInfo: employee.workInfo ? {
        ...employee.workInfo,
        joinedTBD: formatDate(employee.workInfo.joinedTBD),
        joinedTeSCC: formatDate(employee.workInfo.joinedTeSCC),
        seniorityStart: formatDate(employee.workInfo.seniorityStart),
        contractDate: formatDate(employee.workInfo.contractDate),
        contractEndDate: formatDate(employee.workInfo.contractEndDate),
      } : null,
      personalInfo: employee.personalInfo ? {
        ...employee.personalInfo,
        issueDate: formatDate(employee.personalInfo.issueDate),
      } : null,
      contactInfo: employee.contactInfo ?? null,
      otherInfo: employee.otherInfo ? {
        ...employee.otherInfo,
        resignedDate: formatDate(employee.otherInfo.resignedDate),
        updatedAt: formatDate(employee.otherInfo.updatedAt),
      } : null,
      LeaveRequest: employee.LeaveRequest?.map((leave: any) => ({
        ...leave,
        startDate: formatDate(leave.startDate),
        endDate: formatDate(leave.endDate),
        approvedAt: formatDate(leave.approvedAt),
        createdAt: formatDate(leave.createdAt),
      })),
    };

    return NextResponse.json(formattedEmployee);
  } catch (error) {
    console.error("Lỗi máy chủ:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}

function isBase64Image(str: string): boolean {
  return /^data:image\/\w+;base64,/.test(str);
}

export async function PATCH(req: NextRequest) {
  const employeeCode = getEmployeeCodeFromUrl(req.url);
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  const user = verifyToken(token);
  if (!user) return NextResponse.json({ message: "Token không hợp lệ" }, { status: 401 });

  try {
    const employee = await prisma.employee.findUnique({ where: { employeeCode } });
    if (!employee) return NextResponse.json({ message: "Không tìm thấy nhân viên" }, { status: 404 });
    if (user.role !== "ADMIN" && employee.id !== user.id) {
      return NextResponse.json({ message: "Không có quyền sửa nhân viên này" }, { status: 403 });
    }

    const body = await req.json();
    let avatar = body.avatar;
    if (typeof avatar === "string" && isBase64Image(avatar)) {
      const res = await cloudinary.uploader.upload(avatar, {
        folder: "employee_avatars",
        public_id: `employee-${employee.id}-${Date.now()}`,
      });
      avatar = res.secure_url;
    } else if (typeof avatar !== "string" || (!avatar.startsWith("http") && avatar !== null)) {
      avatar = undefined;
    }

    if (body.workInfo?.position) {
      const position = await prisma.position.findUnique({ where: { id: body.workInfo.position } });
      if (position?.name) {
        let newLevel = 1;
        const name = position.name.toLowerCase();
        if (name.includes("tổ trưởng")) newLevel = 2;
        else if (name.includes("trưởng phòng")) newLevel = 3;
        else if (name.includes("phó tổng giám đốc") || name.includes("tổng giám đốc")) newLevel = 5;
        else if (name.includes("giám đốc")) newLevel = 4;
        if (newLevel !== position.level) {
          await prisma.position.update({ where: { id: body.workInfo.position }, data: { level: newLevel } });
        }
      }
    }

    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        avatar,
        name: body.name,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        role: body.role,
        gender: body.gender,
        employeeCode: body.employeeCode,
      },
    });

    const upsert = async (model: any, data: any) => {
      const exists = await model.findUnique({ where: { employeeId: employee.id } });
      if (exists) {
        return model.update({ where: { employeeId: employee.id }, data });
      } else {
        return model.create({ data: { employeeId: employee.id, ...data } });
      }
    };

    if (body.workInfo) {
      await upsert(prisma.workInfo, {
        departmentId: body.workInfo.department,
        positionId: body.workInfo.position,
        specialization: body.workInfo.specialization,
        joinedTBD: body.workInfo.joinedTBD ? new Date(body.workInfo.joinedTBD) : undefined,
        joinedTeSCC: body.workInfo.joinedTeSCC ? new Date(body.workInfo.joinedTeSCC) : undefined,
        seniorityStart: body.workInfo.seniorityStart ? new Date(body.workInfo.seniorityStart) : undefined,
        seniority: body.workInfo.seniority,
        contractNumber: body.workInfo.contractNumber,
        contractDate: body.workInfo.contractDate ? new Date(body.workInfo.contractDate) : undefined,
        contractType: body.workInfo.contractType,
        contractEndDate: body.workInfo.contractEndDate ? new Date(body.workInfo.contractEndDate) : undefined,
      });
    }

    if (body.personalInfo) {
      await upsert(prisma.personalInfo, {
        identityNumber: body.personalInfo.identityNumber,
        issueDate: body.personalInfo.issueDate ? new Date(body.personalInfo.issueDate) : undefined,
        issuePlace: body.personalInfo.issuePlace,
        hometown: body.personalInfo.hometown,
        idAddress: body.personalInfo.idAddress,
        education: body.personalInfo.education,
        drivingLicense: body.personalInfo.drivingLicense,
        toyotaCertificate: body.personalInfo.toyotaCertificate,
        taxCode: body.personalInfo.taxCode,
        insuranceNumber: body.personalInfo.insuranceNumber,
        insuranceSalary: body.personalInfo.insuranceSalary,
      });
    }

    if (body.contactInfo) {
      await upsert(prisma.contactInfo, {
        phoneNumber: body.contactInfo.phoneNumber,
        relativePhone: body.contactInfo.relativePhone,
        companyPhone: body.contactInfo.companyPhone,
        email: body.contactInfo.email,
      });
    }

    if (body.otherInfo) {
      await upsert(prisma.otherInfo, {
        workStatus: body.otherInfo.workStatus,
        resignedDate: body.otherInfo.resignedDate ? new Date(body.otherInfo.resignedDate) : undefined,
        documentsChecked: body.otherInfo.documentsChecked,
        updatedAt: new Date(),
        VCB: body.otherInfo.VCB,
        MTCV: body.otherInfo.MTCV,
        PNJ: body.otherInfo.PNJ,
      });
    }

    return NextResponse.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật nhân viên:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
