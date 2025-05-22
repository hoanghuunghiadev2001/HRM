import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  if (!token) {
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return NextResponse.json(
      { message: "Không có quyền truy cập" },
      { status: 403 }
    );
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
      include: {
        workInfo: true,
        personalInfo: true,
        contactInfo: true,
        otherInfo: true,
        LeaveRequest: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Không tìm thấy nhân viên" },
        { status: 404 }
      );
    }

    const formattedEmployee = {
      ...employee,
      birthDate: formatDate(employee.birthDate),
      workInfo: employee.workInfo
        ? {
            ...employee.workInfo,
            joinedTBD: formatDate(employee.workInfo.joinedTBD),
            joinedTeSCC: formatDate(employee.workInfo.joinedTeSCC),
            seniorityStart: formatDate(employee.workInfo.seniorityStart),
            contractDate: formatDate(employee.workInfo.contractDate),
            contractEndDate: formatDate(employee.workInfo.contractEndDate),
          }
        : null,
      personalInfo: employee.personalInfo
        ? {
            ...employee.personalInfo,
            issueDate: formatDate(employee.personalInfo.issueDate),
          }
        : null,
      contactInfo: employee.contactInfo ?? null,
      otherInfo: employee.otherInfo
        ? {
            ...employee.otherInfo,
            resignedDate: formatDate(employee.otherInfo.resignedDate),
            updatedAt: formatDate(employee.otherInfo.updatedAt),
          }
        : null,
      LeaveRequest: employee.LeaveRequest?.map((leave) => ({
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
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json(
      { message: "Token không hợp lệ" },
      { status: 401 }
    );
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Không tìm thấy nhân viên" },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN" && employee.id !== user.id) {
      return NextResponse.json(
        { message: "Không có quyền sửa nhân viên này" },
        { status: 403 }
      );
    }

    const body = await req.json();
    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        avatar: body.avatar,
        name: body.name,
        birthDate: body.birthDate,
        role: body.role,
        gender: body.gender,
      },
    });
    if (body.workInfo) {
      await prisma.workInfo.update({
        where: { employeeId: employee.id },
        data: {
          department: body.workInfo.department,
          position: body.workInfo.position,
          specialization: body.workInfo.specialization,
          joinedTBD: body.workInfo.joinedTBD
            ? new Date(body.workInfo.joinedTBD)
            : undefined,
          joinedTeSCC: body.workInfo.joinedTeSCC
            ? new Date(body.workInfo.joinedTeSCC)
            : undefined,
          seniorityStart: body.workInfo.seniorityStart
            ? new Date(body.workInfo.seniorityStart)
            : undefined,
          seniority: body.workInfo.seniority,
          contractNumber: body.workInfo.contractNumber,
          contractDate: body.workInfo.contractDate
            ? new Date(body.workInfo.contractDate)
            : undefined,
          contractType: body.workInfo.contractType,
          contractEndDate: body.workInfo.contractEndDate
            ? new Date(body.workInfo.contractEndDate)
            : undefined,
        },
      });
    }

    if (body.personalInfo) {
      await prisma.personalInfo.update({
        where: { employeeId: employee.id },
        data: {
          identityNumber: body.personalInfo.identityNumber,
          issueDate: body.personalInfo.issueDate
            ? new Date(body.personalInfo.issueDate)
            : undefined,
          issuePlace: body.personalInfo.issuePlace,
          hometown: body.personalInfo.hometown,
          idAddress: body.personalInfo.idAddress,
          education: body.personalInfo.education,
          drivingLicense: body.personalInfo.drivingLicense,
          toyotaCertificate: body.personalInfo.toyotaCertificate,
          taxCode: body.personalInfo.taxCode,
          insuranceNumber: body.personalInfo.insuranceNumber,
          insuranceSalary: body.personalInfo.insuranceSalary,
        },
      });
    }

    if (body.contactInfo) {
      await prisma.contactInfo.update({
        where: { employeeId: employee.id },
        data: {
          phoneNumber: body.contactInfo.phoneNumber,
          relativePhone: body.contactInfo.relativePhone,
          companyPhone: body.contactInfo.companyPhone,
          email: body.contactInfo.email,
        },
      });
    }

    if (body.otherInfo) {
      await prisma.otherInfo.update({
        where: { employeeId: employee.id },
        data: {
          workStatus: body.otherInfo.workStatus,
          resignedDate: body.otherInfo.resignedDate
            ? new Date(body.otherInfo.resignedDate)
            : undefined,
          documentsChecked: body.otherInfo.documentsChecked,
          updatedAt: new Date(),
          VCB: body.otherInfo.VCB,
          MTCV: body.otherInfo.MTCV,
          PNJ: body.otherInfo.PNJ,
        },
      });
    }

    return NextResponse.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật nhân viên:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
