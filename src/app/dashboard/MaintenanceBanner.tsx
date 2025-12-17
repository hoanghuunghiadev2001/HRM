/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Alert, Tag } from "antd";
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ToolOutlined,
  TeamOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

/**
 * =========================================================
 * THEME CONFIG
 * =========================================================
 */
const THEME: Record<
  string,
  {
    color: string;
    gradient: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  MAINTENANCE: {
    color: "warning",
    gradient: "from-orange-600 via-amber-500 to-yellow-500",
    icon: <ToolOutlined />,
    label: "BẢO TRÌ HỆ THỐNG",
  },
  SYSTEM: {
    color: "processing",
    gradient: "from-blue-600 to-indigo-500",
    icon: <InfoCircleOutlined />,
    label: "THÔNG BÁO HỆ THỐNG",
  },
  HR: {
    color: "success",
    gradient: "from-green-600 to-emerald-500",
    icon: <TeamOutlined />,
    label: "THÔNG BÁO NHÂN SỰ",
  },
  SECURITY: {
    color: "error",
    gradient: "from-red-600 to-rose-500",
    icon: <SafetyOutlined />,
    label: "CẢNH BÁO BẢO MẬT",
  },
};

const PRIORITY = ["MAINTENANCE", "SECURITY", "SYSTEM", "HR"];

export default function NotificationBanner() {
  const [notice, setNotice] = useState<any>(null);
  const [now, setNow] = useState(dayjs());
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [durationSec, setDurationSec] = useState(20);

  useEffect(() => {
    load();

    const poll = setInterval(load, 300000); // refresh mỗi 5 phút
    const tick = setInterval(() => setNow(dayjs()), 1000);

    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/notifications/active", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setNotice(null);
        return;
      }

      const selected = data.sort(
        (a, b) => PRIORITY.indexOf(a.type) - PRIORITY.indexOf(b.type)
      )[0];

      setNotice(selected);
    } catch {
      setNotice(null);
    }
  }

  /**
   * Tính tốc độ marquee theo độ dài nội dung
   */
  useEffect(() => {
    if (!marqueeRef.current) return;

    const contentWidth = marqueeRef.current.scrollWidth;
    const speed = window.innerWidth < 768 ? 35 : 55; // mobile chậm hơn

    const duration = Math.max(contentWidth / speed, 15);
    setDurationSec(duration);
  }, [notice]);

  if (!notice) return null;

  const theme = THEME[notice.type] || THEME.SYSTEM;

  /**
   * Countdown – chỉ cho MAINTENANCE
   */
  let remainingText: string | null = null;

  if (notice.type === "MAINTENANCE" && notice.endTime) {
    const end = dayjs(notice.endTime);
    const remaining = dayjs.duration(end.diff(now));

    remainingText =
      remaining.asSeconds() <= 0
        ? "Sắp kết thúc"
        : `${remaining.hours()}h ${remaining.minutes()}m ${remaining.seconds()}s`;
  }

  return (
    <div className="sticky top-0 z-50 px-2 md:px-4">
      <div
        className={`bg-gradient-to-r ${theme.gradient} text-white rounded-xl shadow-lg`}
      >
        <Alert
          banner
          icon={<ExclamationCircleOutlined />}
          style={{
            background: "transparent",
            color: "white",
            border: "none",
          }}
          message={
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 overflow-hidden">
              {/* LEFT */}
              <div className="flex items-center gap-2 shrink-0">
                <Tag
                  color={theme.color}
                  icon={theme.icon}
                  className="text-xs md:text-sm"
                >
                  {theme.label}
                </Tag>

                {remainingText && (
                  <Tag color="error" className="text-xs md:text-sm">
                    ⏳ {remainingText}
                  </Tag>
                )}
              </div>

              {/* MARQUEE */}
              <div className="relative flex-1 overflow-hidden">
                <div
                  ref={marqueeRef}
                  className="animate-marquee whitespace-nowrap text-xs md:text-sm"
                  style={{
                    animationDuration: `${durationSec}s`,
                  }}
                >
                  <strong>{notice.title || "Thông báo"}:</strong>{" "}
                  {notice.message}
                  {notice.startTime && notice.endTime && (
                    <>
                      &nbsp;|&nbsp; ⏰{" "}
                      {dayjs(notice.startTime).format("DD/MM HH:mm")} →{" "}
                      {dayjs(notice.endTime).format("DD/MM HH:mm")}
                    </>
                  )}
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* MARQUEE ANIMATION */}
      <style jsx>{`
        .animate-marquee {
          display: inline-block;
          padding-left: 100%;
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
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
