// app/api/create-leaves/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { sendEmail } from "@/lib/mail";
import dayjs from "dayjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      leaveType,
      startDateTime,
      endDateTime,
      reason,
      totalHours,
    } = body;

    if (
      !employeeId?.toString().trim() ||
      !leaveType?.toString().trim() ||
      !startDateTime?.toString().trim() ||
      !endDateTime?.toString().trim() ||
      totalHours === undefined
    ) {
      return NextResponse.json(
        { message: "Thiếu trường dữ liệu bắt buộc" },
        { status: 400 }
      );
    }

    const start = dayjs(startDateTime, "DD/MM/YYYY HH:mm:ss", true);
    const end = dayjs(endDateTime, "DD/MM/YYYY HH:mm:ss", true);

    if (!start.isValid() || !end.isValid()) {
      return NextResponse.json(
        { message: "Định dạng ngày giờ không hợp lệ" },
        { status: 400 }
      );
    }

    if (start.isAfter(end) || start.isSame(end)) {
      return NextResponse.json(
        { message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc" },
        { status: 400 }
      );
    }

    // Tạo đơn nghỉ
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate: start.toDate(),
        endDate: end.toDate(),
        totalHours: Number(totalHours),
        reason: reason?.toString() || "",
      },
    });

    // Lấy thông tin nhân viên và phòng ban
    // const employee = await prisma.employee.findUnique({
    //   where: { id: employeeId },
    //   include: { workInfo: true },
    // });

    // const department = employee?.workInfo?.department;
    // const position = employee?.workInfo?.position;

    //     if (!employee || !department) {
    //       console.warn("Không tìm thấy thông tin phòng ban hoặc nhân viên");
    //     } else {
    //       // Lấy các manager của cùng bộ phận
    //       const managers = await prisma.employee.findMany({
    //         where: {
    //           role: "MANAGER",
    //           workInfo: {
    //             department,
    //           },
    //         },
    //         include: {
    //           contactInfo: true,
    //         },
    //       });

    //       // Lấy tất cả admin
    //       const admins = await prisma.employee.findMany({
    //         where: {
    //           role: "ADMIN",
    //         },
    //         include: {
    //           contactInfo: true,
    //         },
    //       });

    //       const emails = [
    //         ...managers
    //           .map((m: any) => m.contactInfo?.email)
    //           .filter((e: any): e is string => typeof e === "string"),
    //         ...admins
    //           .map((a: any) => a.contactInfo?.email)
    //           .filter((e: any): e is string => typeof e === "string"),
    //       ];

    //       if (emails.length > 0) {
    //         const html = `
    //   <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px;">
    //     <!-- Logo -->
    //     <div style="text-align: center; margin-bottom: 24px;">
    //      <img src="${
    //        process.env.logoToyota
    //      }" alt="Toyota" style="height: 50px; object-fit: contain;" />
    //     </div>

    //     <h2 style="color: #2a8af6; margin-bottom: 8px;">📌 Đơn xin nghỉ mới</h2>
    //     <p>Xin chào,</p>
    //     <p>Hệ thống HRM vừa ghi nhận một đơn xin nghỉ mới với thông tin như sau:</p>

    //     <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
    //       <tr>
    //         <td style="padding: 8px; font-weight: bold; width: 120px;">👤 Nhân viên:</td>
    //         <td style="padding: 8px;">${employee.name} (${
    //           employee.employeeCode
    //         })</td>
    //       </tr>
    //       <tr style="background-color: #f9f9f9;">
    //         <td style="padding: 8px; font-weight: bold;">💼 Chức vụ:</td>
    //         <td style="padding: 8px;">${position}</td>
    //       </tr>
    //       <tr>
    //         <td style="padding: 8px; font-weight: bold;">🏢 Bộ phận:</td>
    //         <td style="padding: 8px;">${department}</td>
    //       </tr>
    //       <tr style="background-color: #f9f9f9;">
    //         <td style="padding: 8px; font-weight: bold;">📝 Loại phép:</td>
    //         <td style="padding: 8px;">${leaveType}</td>
    //       </tr>
    //       <tr>
    //         <td style="padding: 8px; font-weight: bold;">🕒 Thời gian:</td>
    //         <td style="padding: 8px;">${start.format(
    //           "DD/MM/YYYY HH:mm"
    //         )} - ${end.format("DD/MM/YYYY HH:mm")}</td>
    //       </tr>
    //       <tr style="background-color: #f9f9f9;">
    //         <td style="padding: 8px; font-weight: bold;">📄 Lý do:</td>
    //         <td style="padding: 8px;">${reason || "Không có"}</td>
    //       </tr>
    //     </table>

    //     <div style="text-align: center; margin-top: 32px;">
    //       <a href="${process.env.detailUrlRequest}" target="_blank" style="
    //           display: inline-block;
    //           padding: 12px 24px;
    //           font-weight: bold;
    //           color: white;
    //           background-color: #2a8af6;
    //           border-radius: 6px;
    //           text-decoration: none;
    //           box-shadow: 0 3px 6px rgba(42, 138, 246, 0.4);
    //           transition: background-color 0.3s ease;
    //         "
    //         onmouseover="this.style.backgroundColor='#1a5edb'"
    //         onmouseout="this.style.backgroundColor='#2a8af6'"
    //       >
    //         🔍 Xem chi tiết
    //       </a>
    //     </div>

    //     <p style="color: #888; font-size: 12px; margin-top: 40px; text-align: center;">
    //       Email được gửi tự động từ hệ thống HRM.
    //     </p>
    //   </div>
    // `;

    //         await sendEmail({
    //           to: emails,
    //           subject: "📝 Thông báo đơn xin nghỉ mới",
    //           html,
    //         });
    //       }
    //     }

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi tạo đơn nghỉ:", error);
    return NextResponse.json(
      { message: "Tạo đơn nghỉ thất bại" },
      { status: 500 }
    );
  }
}
