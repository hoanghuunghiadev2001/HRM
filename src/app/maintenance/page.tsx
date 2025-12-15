/* eslint-disable @next/next/no-img-element */
"use client";

import { Button, Divider } from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(duration);
dayjs.extend(customParseFormat);

/**
 * Parse maintenance time from env
 * Accept format: "15/12/2025 18:00"
 */
function parseMaintenanceTime(value?: string) {
  if (!value) return null;

  const parsed = dayjs(value, "DD/MM/YYYY HH:mm", true);
  return parsed.isValid() ? parsed : null;
}

export default function MaintenancePage() {
  const maintenanceTime = parseMaintenanceTime(
    process.env.NEXT_PUBLIC_MAINTENANCE_TIME
  );

  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    if (!maintenanceTime) return null;

    const diff = maintenanceTime.diff(now);
    if (diff <= 0) return null;

    const d = dayjs.duration(diff);
    return {
      days: Math.floor(d.asDays()),
      hours: d.hours(),
      minutes: d.minutes(),
      seconds: d.seconds(),
    };
  }, [now, maintenanceTime]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-950 to-black text-white px-4">
      <div className="relative max-w-2xl w-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 md:p-10 text-center">
        {/* Illustration */}
        <img
          src="/images/404_page-not-found.png"
          alt="System Maintenance"
          className="mx-auto mb-6 opacity-25 max-w-xs"
        />

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Hệ thống đang bảo trì
        </h1>

        {/* Sub title */}
        <p className="text-gray-400 mt-3 leading-relaxed">
          Hệ thống Quản lý Nhân sự (HRM) đang được nâng cấp định kỳ nhằm cải
          thiện hiệu năng, độ ổn định và tăng cường bảo mật dữ liệu.
        </p>

        <Divider className="border-white/10 my-6" />

        {/* Maintenance info */}
        <div className="text-left text-sm text-gray-300 space-y-2">
          <InfoRow label="🔧 Phạm vi ảnh hưởng">
            Đăng nhập, chấm công, quản lý nhân sự, báo cáo
          </InfoRow>
          <InfoRow label="📌 Trạng thái">
            Đang trong thời gian bảo trì hệ thống
          </InfoRow>
          <InfoRow label="🕒 Thời gian dự kiến hoàn tất">
            {maintenanceTime
              ? maintenanceTime.format("DD/MM/YYYY HH:mm")
              : "Đang cập nhật"}
          </InfoRow>
        </div>

        {/* Countdown */}
        {countdown && (
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-3">⏳ Thời gian còn lại</p>
            <div className="grid grid-cols-4 gap-3">
              <TimeBox label="Ngày" value={countdown.days} />
              <TimeBox label="Giờ" value={countdown.hours} />
              <TimeBox label="Phút" value={countdown.minutes} />
              <TimeBox label="Giây" value={countdown.seconds} />
            </div>
          </div>
        )}

        {!countdown && (
          <div className="mt-6 text-sm text-emerald-400">
            ✅ Hệ thống sắp hoạt động trở lại
          </div>
        )}

        {/* Action */}
        <div className="mt-8 flex justify-center">
          <Button
            type="primary"
            ghost
            size="large"
            onClick={() => {
              window.location.href =
                "mailto:nghia.hh@toyota.binhduong.vn" +
                "?subject=" +
                encodeURIComponent("[HRM] Hỗ trợ trong thời gian bảo trì") +
                "&body=" +
                encodeURIComponent(
                  `Chào bộ phận IT,

Tôi đang gặp vấn đề khi truy cập hệ thống HRM trong thời gian bảo trì.

Thời điểm truy cập: ${dayjs().format("DD/MM/YYYY HH:mm")}
Hệ thống: HRM Web

Vui lòng hỗ trợ giúp tôi.

Trân trọng,`
                );
            }}
          >
            Liên hệ IT nội bộ
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-500">
          © {dayjs().year()} HRM · Phòng Công nghệ Thông tin (IT)
        </p>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <span className="min-w-[180px] text-gray-400">{label}</span>
      <span className="text-gray-200">{children}</span>
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-black/30 border border-white/10 py-4">
      <div className="text-2xl font-semibold">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
