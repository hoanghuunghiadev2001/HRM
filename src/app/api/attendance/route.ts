/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../generated/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import jwt from "jsonwebtoken";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const TZ = "Asia/Ho_Chi_Minh";

// ======================================================
// DATE
// ======================================================

function getUtcRange(dateStr?: string, endOfDay = false): Date | undefined {
  if (!dateStr) return undefined;

  const d = dayjs.tz(`${dateStr} ${endOfDay ? "23:59:59" : "00:00:00"}`, TZ);

  return d.utc().toDate();
}

// ======================================================
// CALC HOURS
// ======================================================

function calcHours(checkIn: Date | null, checkOut: Date | null): number {
  if (!checkIn || !checkOut) return 0;

  return +((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(
    2,
  );
}

// ======================================================
// GET
// ======================================================

export async function GET(req: NextRequest) {
  try {
    // ==================================================
    // 1. CHECK TOKEN
    // ==================================================

    const token = req.cookies.get("token-hrm")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Không tìm thấy token",
        },
        { status: 401 },
      );
    }

    let decoded: {
      id: number;
      role: string;
    };

    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        role: string;
      };
    } catch (error) {
      return NextResponse.json(
        {
          message: "Token không hợp lệ",
        },
        { status: 401 },
      );
    }

    // ==================================================
    // 2. LẤY USER HIỆN TẠI TỪ DATABASE
    // ==================================================

    const currentUser = await prisma.employee.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        role: true,
        isActive: true,
        brand: true,
        global: true,

        workInfo: {
          select: {
            departmentId: true,

            position: {
              select: {
                level: true,
              },
            },
          },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Không tìm thấy tài khoản",
        },
        { status: 401 },
      );
    }

    if (!currentUser.isActive) {
      return NextResponse.json(
        {
          message: "Tài khoản đã bị vô hiệu hóa",
        },
        { status: 403 },
      );
    }

    // ==================================================
    // 3. PARAMS
    // ==================================================

    const { searchParams } = new URL(req.url);

    const msnv = searchParams.get("msnv") ?? undefined;

    const name = searchParams.get("name") ?? undefined;

    const department = searchParams.get("department") ?? undefined;

    let fromDate = searchParams.get("fromDate") ?? undefined;

    let toDate = searchParams.get("toDate") ?? undefined;

    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);

    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") ?? "20", 10), 1),
      200,
    );

    // ==================================================
    // 4. DEFAULT DATE = CURRENT MONTH
    // ==================================================

    if (!fromDate && !toDate) {
      const now = dayjs().tz(TZ);

      fromDate = now.startOf("month").format("YYYY-MM-DD");

      toDate = now.format("YYYY-MM-DD");
    }

    const fromUtc = fromDate ? getUtcRange(fromDate, false) : undefined;

    const toUtc = toDate ? getUtcRange(toDate, true) : undefined;

    // ==================================================
    // 5. EMPLOYEE WHERE
    // ==================================================

    const employeeWhere: Prisma.EmployeeWhereInput = {};

    // ==================================================
    // ADMIN
    // ==================================================

    if (currentUser.role === "ADMIN") {
      /**
       * ADMIN GLOBAL
       *
       * global = true
       * => Xem toàn bộ nhân sự
       */
      if (currentUser.global === true) {
        // Không giới hạn brand

        if (msnv) {
          employeeWhere.employeeCode = {
            contains: msnv,
          };
        }

        if (name) {
          employeeWhere.name = {
            contains: name,
          };
        }

        if (department) {
          const [deptId, posId] = department.split("-").map(Number);

          employeeWhere.workInfo = {
            ...(deptId
              ? {
                  departmentId: deptId,
                }
              : {}),

            ...(posId
              ? {
                  positionId: posId,
                }
              : {}),
          };
        }
      } else {
        /**
         * ADMIN KHÔNG GLOBAL
         *
         * => Chỉ xem nhân sự cùng brand
         */
        if (!currentUser.brand) {
          return NextResponse.json(
            {
              message: "Tài khoản ADMIN chưa được cấu hình chi nhánh",
            },
            { status: 403 },
          );
        }

        employeeWhere.brand = currentUser.brand;

        if (msnv) {
          employeeWhere.employeeCode = {
            contains: msnv,
          };
        }

        if (name) {
          employeeWhere.name = {
            contains: name,
          };
        }

        if (department) {
          const [deptId, posId] = department.split("-").map(Number);

          employeeWhere.workInfo = {
            ...(deptId
              ? {
                  departmentId: deptId,
                }
              : {}),

            ...(posId
              ? {
                  positionId: posId,
                }
              : {}),
          };
        }
      }
    }

    // ==================================================
    // MANAGER
    // ==================================================
    else if (currentUser.role === "MANAGER") {
      /**
       * Manager bắt buộc phải có brand
       */

      if (!currentUser.brand) {
        return NextResponse.json(
          {
            message: "Tài khoản MANAGER chưa được cấu hình chi nhánh",
          },
          { status: 403 },
        );
      }

      if (
        !currentUser.workInfo?.departmentId ||
        !currentUser.workInfo?.position?.level
      ) {
        return NextResponse.json({
          total: 0,
          page,
          pageSize,
          data: [],
        });
      }

      const managerDeptId = currentUser.workInfo.departmentId;

      const managerLevel = currentUser.workInfo.position.level;

      /**
       * QUAN TRỌNG:
       *
       * Manager chỉ được xem:
       * - chính mình
       * - nhân viên cùng phòng
       * - cấp dưới
       * - cùng brand
       */

      employeeWhere.brand = currentUser.brand;

      employeeWhere.OR = [
        {
          id: currentUser.id,
        },

        {
          workInfo: {
            departmentId: managerDeptId,

            position: {
              level: {
                lt: managerLevel,
              },
            },
          },
        },
      ];

      // Filter MSNV / tên
      const searchConditions: Prisma.EmployeeWhereInput[] = [];

      if (msnv) {
        searchConditions.push({
          employeeCode: {
            contains: msnv,
          },
        });
      }

      if (name) {
        searchConditions.push({
          name: {
            contains: name,
          },
        });
      }

      if (searchConditions.length > 0) {
        employeeWhere.AND = searchConditions;
      }
    }

    // ==================================================
    // USER
    // ==================================================
    else {
      /**
       * USER chỉ xem chính mình
       */

      employeeWhere.id = currentUser.id;
    }

    // ==================================================
    // 6. LẤY EMPLOYEE ID
    // ==================================================

    const matchedEmployees = await prisma.employee.findMany({
      where: employeeWhere,

      select: {
        id: true,
      },
    });

    if (matchedEmployees.length === 0) {
      return NextResponse.json({
        total: 0,
        page,
        pageSize,
        data: [],
      });
    }

    const employeeIds = matchedEmployees.map((employee) => employee.id);

    // ==================================================
    // 7. ATTENDANCE WHERE
    // ==================================================

    const attendanceWhere: Prisma.AttendanceWhereInput = {
      employeeId: {
        in: employeeIds,
      },

      ...(fromUtc || toUtc
        ? {
            date: {
              ...(fromUtc
                ? {
                    gte: fromUtc,
                  }
                : {}),

              ...(toUtc
                ? {
                    lte: toUtc,
                  }
                : {}),
            },
          }
        : {}),
    };

    // ==================================================
    // 8. COUNT + DATA
    // ==================================================

    const [total, attendances] = await Promise.all([
      prisma.attendance.count({
        where: attendanceWhere,
      }),

      prisma.attendance.findMany({
        where: attendanceWhere,

        orderBy: {
          date: "desc",
        },

        skip: (page - 1) * pageSize,

        take: pageSize,

        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              name: true,
              avatar: true,
              brand: true,

              workInfo: {
                select: {
                  department: {
                    select: {
                      name: true,
                    },
                  },

                  position: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // ==================================================
    // 9. FORMAT DATA
    // ==================================================

    const data = attendances.map((att) => ({
      employeeId: att.employeeId,

      employeeCode: att.employee.employeeCode,

      avatar: att.employee.avatar,

      employeeName: att.employee.name,

      brand: att.employee.brand,

      department: att.employee.workInfo?.department?.name ?? "",

      position: att.employee.workInfo?.position?.name ?? "",

      date: dayjs(att.date).tz(TZ).format("YYYY-MM-DD"),

      firstCheckIn: att.checkInTime
        ? dayjs(att.checkInTime).tz(TZ).format("YYYY-MM-DD HH:mm:ss")
        : null,

      lastCheckOut: att.checkOutTime
        ? dayjs(att.checkOutTime).tz(TZ).format("YYYY-MM-DD HH:mm:ss")
        : null,

      totalHours: calcHours(att.checkInTime, att.checkOutTime),
    }));

    // ==================================================
    // 10. RESPONSE
    // ==================================================

    return NextResponse.json({
      total,
      page,
      pageSize,
      data,

      // Có thể dùng UI để biết quyền hiện tại
      permission: {
        role: currentUser.role,
        global: currentUser.global,
        brand: currentUser.brand,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching attendance summary:", error);

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
