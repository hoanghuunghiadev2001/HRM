/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendNotificationMail } from "@/lib/notificationMailer";

/**
 * =========================================================
 * CREATE NOTIFICATION
 * =========================================================
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      message,
      mailContent, // HTML email
      type = "SYSTEM",
      startTime,
      endTime,
      sendMail = false,
      sendApp = true,
    } = body;

    if (!message || !type) {
      return NextResponse.json(
        { message: "Thiếu nội dung hoặc loại thông báo" },
        { status: 400 }
      );
    }
    if (sendMail && !mailContent) {
      return NextResponse.json(
        { message: "Bật gửi mail nhưng thiếu nội dung email" },
        { status: 400 }
      );
    }

    // 1️⃣ Nếu là MAINTENANCE → tắt maintenance cũ
    if (type === "MAINTENANCE") {
      await prisma.notification.updateMany({
        where: {
          type: "MAINTENANCE",
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    // 2️⃣ Tạo notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        mailContent: sendMail ? mailContent : null,
        type,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        sendMail,
        sendApp,
        isActive: true,
      },
    });

    // 3️⃣ Nếu bật gửi mail → gửi cho toàn bộ user active
    if (sendMail) {
      /**
       * ⚠ CHỈ LẤY USER:
       * - isActive = true
       * - có email
       */
      const employees = await prisma.employee.findMany({
        where: {
          isActive: true,
          contactInfo: {
            email: {
              not: null,
            },
          },
        },
        select: {
          contactInfo: {
            select: {
              email: true,
            },
          },
        },
      });

      const emails = employees
        .map((e) => e.contactInfo?.email)
        .filter(Boolean) as string[];

      // Gửi mail batch – không block API
      if (sendMail) {
        const subjectMap: Record<string, string> = {
          HR: "[HRM] Thông báo nhân sự",
          SYSTEM: "[HRM] Thông báo hệ thống",
          MAINTENANCE: "[HRM] Thông báo bảo trì",
          SECURITY: "[HRM] Thông báo bảo mật",
          FEATURE: "[HRM] Thông báo tính năng mới",
        };

        sendNotificationMail({
          emails,
          subject: title || subjectMap[type] || "[HRM] Thông báo",
          html: mailContent,
        }).catch((err) => {
          console.error("Send mail failed:", err);
        });
      }
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json({ message: "Lỗi tạo thông báo" }, { status: 500 });
  }
}

/**
 * =========================================================
 * GET NOTIFICATIONS
 * =========================================================
 */
export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { message: "Lỗi tải danh sách thông báo" },
      { status: 500 }
    );
  }
}
