import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        workInfo: {
          include: {
            department: true,
            position: true,
          },
        },
        personalInfo: true,
        contactInfo: true,
        otherInfo: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh sách nhân viên");

    // Định nghĩa cột Excel theo thứ tự bạn cung cấp
    worksheet.columns = [
      { header: "STT", key: "stt", width: 5 },
      { header: "Mã NV", key: "employeeCode", width: 10 },
      { header: "Tên", key: "name", width: 20 },
      { header: "Bộ phận", key: "department", width: 15 },
      { header: "Chức vụ", key: "position", width: 15 },
      { header: "Ngày vào TBD", key: "joinedTBD", width: 15 },
      { header: "Ngày vào TeSCC", key: "joinedTeSCC", width: 15 },
      {
        header: "Ngày bắt đầu tính thâm niên",
        key: "seniorityStart",
        width: 20,
      },
      { header: "Thâm niên", key: "seniority", width: 10 },
      { header: "Số HĐ", key: "contractNumber", width: 15 },
      { header: "Ngày ký HĐ", key: "contractDate", width: 15 },
      { header: "Loại HĐ", key: "contractType", width: 15 },
      { header: "Ngày hết hạn", key: "contractEndDate", width: 15 },
      { header: "Ngày sinh", key: "birthDate", width: 15 },
      { header: "Giới tính", key: "gender", width: 10 },
      { header: "Số CMND/CCCD", key: "identityNumber", width: 18 },
      { header: "Ngày cấp", key: "issueDate", width: 15 },
      { header: "Nơi cấp", key: "issuePlace", width: 15 },
      { header: "Nguyên quán", key: "hometown", width: 20 },
      { header: "Địa chỉ theo CMND", key: "idAddress", width: 25 },
      { header: "Trình độ", key: "education", width: 15 },
      { header: "Giấy phép lái xe", key: "drivingLicense", width: 18 },
      { header: "Chứng chỉ Toyota", key: "toyotaCertificate", width: 18 },
      { header: "Số sổ BH", key: "insuranceNumber", width: 15 },
      { header: "Lương đóng BH", key: "insuranceSalary", width: 15 },
      { header: "Điện thoại cá nhân", key: "phoneNumber", width: 18 },
      { header: "Điện thoại công ty", key: "companyPhone", width: 18 },
      { header: "Email", key: "email", width: 25 },
      { header: "Chính thức", key: "workStatus", width: 15 },
      { header: "Ngày nghỉ", key: "resignedDate", width: 15 },
      { header: "MST", key: "taxCode", width: 18 },
      { header: "SĐT người thân", key: "relativePhone", width: 18 },
      { header: "Check hồ sơ", key: "documentsChecked", width: 15 },
      { header: "Thời gian update", key: "updatedAt", width: 15 },
      { header: "VCB", key: "VCB", width: 15 },
      { header: "Bảng MTCV", key: "MTCV", width: 15 },
      { header: "Ngành", key: "specialization", width: 15 },
      { header: "PNJ", key: "PNJ", width: 15 },
    ];

    let index = 1;
    for (const emp of employees) {
      worksheet.addRow({
        stt: index++,
        employeeCode: emp.employeeCode,
        name: emp.name,
        department: emp.workInfo?.department?.name,
        position: emp.workInfo?.position?.name,
        joinedTBD: formatDate(emp.workInfo?.joinedTBD),
        joinedTeSCC: formatDate(emp.workInfo?.joinedTeSCC),
        seniorityStart: formatDate(emp.workInfo?.seniorityStart),
        seniority: emp.workInfo?.seniority,
        contractNumber: emp.workInfo?.contractNumber,
        contractDate: formatDate(emp.workInfo?.contractDate),
        contractType: emp.workInfo?.contractType,
        contractEndDate: formatDate(emp.workInfo?.contractEndDate),
        birthDate: formatDate(emp.birthDate),
        gender: emp.gender === "MALE" ? "Nam" : "Nữ",
        identityNumber: emp.personalInfo?.identityNumber,
        issueDate: formatDate(emp.personalInfo?.issueDate),
        issuePlace: emp.personalInfo?.issuePlace,
        hometown: emp.personalInfo?.hometown,
        idAddress: emp.personalInfo?.idAddress,
        education: emp.personalInfo?.education,
        drivingLicense: emp.personalInfo?.drivingLicense,
        toyotaCertificate: emp.personalInfo?.toyotaCertificate,
        insuranceNumber: emp.personalInfo?.insuranceNumber,
        insuranceSalary: emp.personalInfo?.insuranceSalary,
        phoneNumber: emp.contactInfo?.phoneNumber,
        companyPhone: emp.contactInfo?.companyPhone,
        email: emp.contactInfo?.email,
        workStatus: emp.otherInfo?.workStatus,
        resignedDate: formatDate(emp.otherInfo?.resignedDate),
        taxCode: emp.personalInfo?.taxCode,
        relativePhone: emp.contactInfo?.relativePhone,
        documentsChecked: emp.otherInfo?.documentsChecked,
        updatedAt: formatDate(emp.otherInfo?.updatedAt),
        VCB: emp.otherInfo?.VCB,
        MTCV: emp.otherInfo?.MTCV,
        specialization: emp.workInfo?.specialization,
        PNJ: emp.otherInfo?.PNJ,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=employees.xlsx`,
      },
    });
  } catch (err) {
    console.error("Export Excel error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function formatDate(date?: Date | null): string {
  return date ? date.toISOString().split("T")[0] : "";
}
