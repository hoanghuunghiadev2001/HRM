// PATCH /api/maintenance/[id]/toggle
import { sendEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const formatVN = (date: Date) =>
  dayjs(date).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isActive } = await req.json();
  const id = Number((await params).id);

  // 1️⃣ Lấy trạng thái cũ
  const old = await prisma.maintenanceNotice.findUnique({
    where: { id },
  });

  if (!old) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // 2️⃣ Update
  const updated = await prisma.maintenanceNotice.update({
    where: { id },
    data: { isActive },
  });

  // 3️⃣ CHỈ gửi mail khi false → true
  if (!old.isActive && isActive) {
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        contactInfo: {
          email: { not: null },
        },
      },
      select: {
        contactInfo: {
          select: { email: true },
        },
      },
    });

    const emails = employees
      .map((e) => e.contactInfo?.email)
      .filter(Boolean) as string[];

    if (emails.length > 0) {
      await sendEmail({
        to: emails,
        subject: "🔧 Thông báo bảo trì hệ thống HRM",
        html: `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#fa8c16; padding:16px 24px; color:#ffffff;">
              <h2 style="margin:0; font-size:18px;">🔧 Thông báo bảo trì hệ thống</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px; color:#333333; font-size:14px; line-height:1.6;">
              <p>Chào <strong>Anh/Chị</strong>,</p>

              <p>
                Phòng CNTT xin thông báo hệ thống <strong>HRM</strong> sẽ được thực hiện bảo trì theo thông tin sau:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
                <tr>
                  <td style="padding:12px; background-color:#fff7e6; border-left:4px solid #fa8c16;">
                    <p style="margin:0; font-weight:bold;">
                      ${updated.title ?? "Bảo trì hệ thống"}
                    </p>
                    <p style="margin:8px 0 0 0;">
                      ${updated.message}
                    </p>
                  </td>
                </tr>
              </table>

              <p>
                <strong>⏰ Thời gian bảo trì:</strong><br/>
${formatVN(updated.startTime)} → ${formatVN(updated.endTime)}
              </p>

              <p>
                Trong thời gian bảo trì, hệ thống có thể bị gián đoạn truy cập.
                Kính mong Anh/Chị chủ động sắp xếp công việc phù hợp.
              </p>

              <p style="margin-top:24px;">
                Trân trọng,<br/>
                <strong>Phòng Công Nghệ Thông Tin</strong><br/>
                Hệ thống HRM
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa; padding:16px 24px; font-size:12px; color:#888888; text-align:center;">
              Email này được gửi tự động từ hệ thống HRM. Vui lòng không phản hồi email này.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
      });
    }
  }

  return NextResponse.json({ success: true });
}
