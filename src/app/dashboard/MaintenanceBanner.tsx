/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Alert, Tag } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export default function MaintenanceBanner() {
  const [notice, setNotice] = useState<any>(null);
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    load();
    const poll = setInterval(load, 30000); // refresh data 30s
    const tick = setInterval(() => setNow(dayjs()), 1000); // countdown

    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/maintenance/active", {
        cache: "no-store",
      });
      const data = await res.json();
      setNotice(data);
    } catch {
      setNotice(null);
    }
  }

  if (!notice) return null;

  const end = dayjs(notice.startTime);
  const remaining = dayjs.duration(end.diff(now));

  const remainingText =
    remaining.asSeconds() <= 0
      ? "Sắp kết thúc"
      : `${remaining.hours()}h ${remaining.minutes()}m ${remaining.seconds()}s`;

  return (
    <div className="sticky top-0 z-50 shadow-md rounded-2xl">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl">
        <Alert
          banner
          icon={<ExclamationCircleOutlined />}
          style={{
            background: "transparent",
            color: "white",
            border: "none",
          }}
          message={
            <div className="flex items-center gap-3 overflow-hidden">
              {/* LEFT */}
              <Tag color="warning">BẢO TRÌ HỆ THỐNG</Tag>

              {/* MARQUEE */}
              <div className="relative flex-1 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap text-sm">
                  <strong>{notice.title || "Thông báo"}:</strong>{" "}
                  {notice.message} &nbsp;|&nbsp; ⏰{" "}
                  {dayjs(notice.startTime).format("DD/MM HH:mm")} →{" "}
                  {dayjs(notice.endTime).format("DD/MM HH:mm")}
                </div>
              </div>

              {/* RIGHT */}
              <Tag color="red">⏳ Còn lại: {remainingText}</Tag>
            </div>
          }
        />
      </div>

      {/* MARQUEE ANIMATION */}
      <style jsx>{`
        .animate-marquee {
          display: inline-block;
          padding-left: 100%;
          animation: marquee 20s linear infinite;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
