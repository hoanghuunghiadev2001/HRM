/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { v2 as cloudinary } from "cloudinary";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Ho_Chi_Minh";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * ==========================
 * HELPERS
 * ==========================
 */

function getEmployeeCodeFromUrl(urlString: string) {
  const url = new URL(urlString);

  const segments = url.pathname.split("/");

  return segments[segments.length - 1];
}

function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;

  return dayjs(date).tz(TZ).format("DD/MM/YYYY");
}

function parseDateToDB(value: unknown): Date | null {
  if (!value) return null;

  // Nếu đã là Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const valueTrimmed = value.trim();

  if (!valueTrimmed) return null;

  // ISO date
  if (valueTrimmed.includes("T")) {
    const date = new Date(valueTrimmed);

    return isNaN(date.getTime()) ? null : date;
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(valueTrimmed)) {
    const date = new Date(`${valueTrimmed}T00:00:00.000Z`);

    return isNaN(date.getTime()) ? null : date;
  }

  // DD/MM/YYYY
  const match = valueTrimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (match) {
    const [, day, month, year] = match;

    const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function isBase64Image(str: string): boolean {
  return /^data:image\/\w+;base64,/.test(str);
}

/**
 * ==========================
 * CHECK BRANCH PERMISSION
 * ==========================
 */
function canAccessEmployee(user: any, employee: any) {
  /**
   * Global được tất cả
   */
  if (user.global === true) {
    return true;
  }

  /**
   * Không có brand
   */
  if (!user.brand) {
    return false;
  }

  /**
   * Chỉ cùng chi nhánh
   */
  return employee.brand === user.brand;
}

/**
 * ==========================
 * GET
 * ==========================
 */
export async function GET(req: NextRequest) {
  try {
    const employeeCode = getEmployeeCodeFromUrl(req.url);

    const token = req.cookies.get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Thiếu token",
        },
        {
          status: 401,
        },
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        {
          message: "Token không hợp lệ",
        },
        {
          status: 401,
        },
      );
    }

    /**
     * ADMIN / MANAGER
     */
    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return NextResponse.json(
        {
          message: "Không có quyền truy cập",
        },
        {
          status: 403,
        },
      );
    }

    const employee = await prisma.employee.findUnique({
      where: {
        employeeCode,
      },

      include: {
        workInfo: {
          include: {
            department: true,
            position: true,
          },
        },

        contactInfo: true,

        LeaveRequest: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          message: "Không tìm thấy nhân viên",
        },
        {
          status: 404,
        },
      );
    }

    /**
     * ⭐ CHECK BRANCH
     */
    if (!canAccessEmployee(user, employee)) {
      return NextResponse.json(
        {
          message: "Bạn không có quyền xem nhân viên thuộc chi nhánh này",
        },
        {
          status: 403,
        },
      );
    }

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

    return NextResponse.json(
      {
        message: "Lỗi máy chủ",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * ==========================
 * PATCH
 * ==========================
 */
export async function PATCH(req: NextRequest) {
  try {
    const employeeCode = getEmployeeCodeFromUrl(req.url);

    const token = req.cookies.get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Thiếu token",
        },
        {
          status: 401,
        },
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        {
          message: "Token không hợp lệ",
        },
        {
          status: 401,
        },
      );
    }

    const employee = await prisma.employee.findUnique({
      where: {
        employeeCode,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          message: "Không tìm thấy nhân viên",
        },
        {
          status: 404,
        },
      );
    }

    /**
     * ==========================
     * QUYỀN SỬA
     * ==========================
     *
     * ADMIN global:
     *   sửa tất cả
     *
     * ADMIN thường:
     *   chỉ cùng brand
     *
     * MANAGER:
     *   chỉ tự sửa chính mình
     *   hoặc tùy nghiệp vụ hiện tại
     */
    if (user.role === "ADMIN") {
      if (!canAccessEmployee(user, employee)) {
        return NextResponse.json(
          {
            message: "Bạn không có quyền sửa nhân viên thuộc chi nhánh này",
          },
          {
            status: 403,
          },
        );
      }
    } else {
      /**
       * Giữ nguyên logic cũ:
       * Manager/User chỉ tự sửa mình
       */
      if (employee.id !== user.id) {
        return NextResponse.json(
          {
            message: "Không có quyền sửa nhân viên này",
          },
          {
            status: 403,
          },
        );
      }
    }

    const body = await req.json();

    /**
     * ==========================
     * ⭐ BRAND
     * ==========================
     */
    const newBrand = body.brand ?? employee.brand;

    /**
     * Admin thường không được
     * chuyển người sang chi nhánh khác
     */
    if (user.role === "ADMIN" && user.global !== true) {
      if (newBrand !== user.brand) {
        return NextResponse.json(
          {
            message:
              "Admin chi nhánh không được chuyển nhân viên sang chi nhánh khác",
          },
          {
            status: 403,
          },
        );
      }
    }

    /**
     * Manager không được đổi brand
     */
    if (user.role !== "ADMIN" && newBrand !== employee.brand) {
      return NextResponse.json(
        {
          message: "Bạn không có quyền thay đổi chi nhánh",
        },
        {
          status: 403,
        },
      );
    }

    /**
     * ==========================
     * ⭐ GLOBAL
     * ==========================
     */
    let newGlobal = employee.global;

    if (typeof body.global === "boolean") {
      /**
       * Chỉ Global Admin
       * mới được cấp / bỏ global
       */
      if (user.role !== "ADMIN" || user.global !== true) {
        return NextResponse.json(
          {
            message: "Chỉ Global Admin mới có quyền thay đổi quyền Global",
          },
          {
            status: 403,
          },
        );
      }

      newGlobal = body.global;
    }

    /**
     * ==========================
     * AVATAR
     * ==========================
     */
    let avatar = body.avatar;

    if (typeof avatar === "string" && isBase64Image(avatar)) {
      const uploadResult = await cloudinary.uploader.upload(avatar, {
        folder: "employee_avatars",

        public_id: `employee-${employee.id}-${Date.now()}`,
      });

      avatar = uploadResult.secure_url;
    } else if (typeof avatar !== "string" && avatar !== null) {
      avatar = undefined;
    } else if (typeof avatar === "string" && !avatar.startsWith("http")) {
      avatar = undefined;
    }
    console.log("=======================");
    console.log(body.birthDate);

    console.log(parseDateToDB(body.birthDate));

    /**
     * ==========================
     * UPDATE EMPLOYEE
     * ==========================
     */
    await prisma.employee.update({
      where: {
        id: employee.id,
      },

      data: {
        ...(avatar !== undefined && {
          avatar,
        }),

        name: body.name ?? employee.name,

        birthDate: parseDateToDB(body.birthDate),

        /**
         * Chỉ ADMIN được đổi role
         */
        ...(user.role === "ADMIN" &&
          canAccessEmployee(user, employee) && {
            role: body.role ?? employee.role,
          }),

        gender: body.gender ?? employee.gender,

        employeeCode: body.employeeCode ?? employee.employeeCode,

        brand: newBrand,

        global: newGlobal,
      },
    });

    /**
     * ==========================
     * UPSERT
     * ==========================
     */
    const upsert = async (model: any, data: any) => {
      const exists = await model.findUnique({
        where: {
          employeeId: employee.id,
        },
      });

      if (exists) {
        return model.update({
          where: {
            employeeId: employee.id,
          },
          data,
        });
      }

      return model.create({
        data: {
          employeeId: employee.id,
          ...data,
        },
      });
    };

    /**
     * ==========================
     * WORK INFO
     * ==========================
     */
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

    /**
     * ==========================
     * CONTACT INFO
     * ==========================
     */
    if (body.contactInfo) {
      await upsert(prisma.contactInfo, {
        phoneNumber: body.contactInfo.phoneNumber || null,

        relativePhone: body.contactInfo.relativePhone || null,

        companyPhone: body.contactInfo.companyPhone || null,

        email: body.contactInfo.email || null,
      });
    }

    return NextResponse.json({
      status: 1,

      message: "Cập nhật thành công",

      data: {
        id: employee.id,

        employeeCode: body.employeeCode ?? employee.employeeCode,

        brand: newBrand,

        global: newGlobal,
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật nhân viên:", error);

    return NextResponse.json(
      {
        status: 0,
        message: "Lỗi máy chủ",
      },
      {
        status: 500,
      },
    );
  }
}
