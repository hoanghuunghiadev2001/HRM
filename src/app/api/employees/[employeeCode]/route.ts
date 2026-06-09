/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Ho_Chi_Minh";

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

// Trả về string DD/MM/YYYY theo timezone
function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return dayjs(date).tz(TZ).format("DD/MM/YYYY");
}

// Chuyển string DD/MM/YYYY sang Date để lưu DB

function parseDateToDB(date: string | null | undefined): Date | null {
  if (!date) return null;
  const parsed = dayjs(date, "DD/MM/YYYY", true); // strict parse
  return parsed.isValid() ? parsed.tz(TZ).toDate() : null;
}

// Kiểm tra avatar base64
function isBase64Image(str: string): boolean {
  return /^data:image\/\w+;base64,/.test(str);
}

export async function GET(req: NextRequest) {
  const employeeCode = getEmployeeCodeFromUrl(req.url);
  const token = req.cookies.get("token-hrm")?.value;
  if (!token)
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });

  const user = verifyToken(token);
  if (!user)
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 },
    );
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return NextResponse.json(
      { message: "Không có quyền truy cập" },
      { status: 403 },
    );
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
      include: {
        workInfo: { include: { department: true, position: true } },
        contactInfo: true,
        LeaveRequest: true,
      },
    });

    if (!employee)
      return NextResponse.json(
        { message: "Không tìm thấy nhân viên" },
        { status: 404 },
      );

    const formattedEmployee = {
      ...employee,
      birthDate: formatDate(employee.birthDate),

      contactInfo: employee.contactInfo ?? null,

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

export async function PATCH(req: NextRequest) {
  const employeeCode = getEmployeeCodeFromUrl(req.url);
  const token = req.cookies.get("token-hrm")?.value;
  if (!token)
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });

  const user = verifyToken(token);
  if (!user)
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 },
    );

  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
    });
    if (!employee)
      return NextResponse.json(
        { message: "Không tìm thấy nhân viên" },
        { status: 404 },
      );
    if (user.role !== "ADMIN" && employee.id !== user.id) {
      return NextResponse.json(
        { message: "Không có quyền sửa nhân viên này" },
        { status: 403 },
      );
    }

    const body = await req.json();
    let avatar = body.avatar;

    if (typeof avatar === "string" && isBase64Image(avatar)) {
      const res = await cloudinary.uploader.upload(avatar, {
        folder: "employee_avatars",
        public_id: `employee-${employee.id}-${Date.now()}`,
      });
      avatar = res.secure_url;
    } else if (
      typeof avatar !== "string" ||
      (!avatar.startsWith("http") && avatar !== null)
    ) {
      avatar = undefined;
    }

    // Cập nhật Employee chính
    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        avatar,
        name: body.name,
        birthDate: parseDateToDB(body.birthDate),
        role: body.role,
        gender: body.gender,
        employeeCode: body.employeeCode,
        brand: body.brand,
      },
    });

    // Hàm upsert cho các bảng liên quan
    const upsert = async (model: any, data: any) => {
      const exists = await model.findUnique({
        where: { employeeId: employee.id },
      });
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
        joinedTBD: parseDateToDB(body.workInfo.joinedTBD),
        joinedTeSCC: parseDateToDB(body.workInfo.joinedTeSCC),
        seniorityStart: parseDateToDB(body.workInfo.seniorityStart),
        seniority: body.workInfo.seniority,
        contractNumber: body.workInfo.contractNumber,
        contractDate: parseDateToDB(body.workInfo.contractDate),
        contractType: body.workInfo.contractType,
        contractEndDate: parseDateToDB(body.workInfo.contractEndDate),
      });
    }

    if (body.contactInfo) {
      await upsert(prisma.contactInfo, {
        phoneNumber:
          body.contactInfo.phoneNumber || body.contactInfo.phoneNumber != ""
            ? body.contactInfo.phoneNumber
            : null,
        relativePhone:
          body.contactInfo.relativePhone || body.contactInfo.relativePhone != ""
            ? body.contactInfo.relativePhone
            : null,
        companyPhone:
          body.contactInfo.companyPhone || body.contactInfo.companyPhone != ""
            ? body.contactInfo.companyPhone
            : null,
        email: body.contactInfo.email,
      });
    }

    return NextResponse.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật nhân viên:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
