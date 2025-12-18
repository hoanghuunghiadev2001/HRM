/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Tag, Tooltip } from "antd";
import {
  InfoCircleOutlined,
  ToolOutlined,
  TeamOutlined,
  SafetyOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const THEME: Record<
  string,
  { color: string; gradient: string; icon: React.ReactNode; label: string }
> = {
  MAINTENANCE: {
    color: "warning",
    gradient: "from-orange-500 via-orange-400 to-yellow-400",
    icon: <ToolOutlined style={{ fontSize: 24 }} />,
    label: "BẢO TRÌ HỆ THỐNG",
  },
  SYSTEM: {
    color: "processing",
    gradient: "from-blue-500 to-indigo-500",
    icon: <InfoCircleOutlined style={{ fontSize: 24 }} />,
    label: "THÔNG BÁO HỆ THỐNG",
  },
  HR: {
    color: "success",
    gradient: "from-green-500 to-emerald-500",
    icon: <TeamOutlined style={{ fontSize: 24 }} />,
    label: "THÔNG BÁO NHÂN SỰ",
  },
  SECURITY: {
    color: "error",
    gradient: "from-red-500 to-rose-500",
    icon: <SafetyOutlined style={{ fontSize: 24 }} />,
    label: "CẢNH BÁO BẢO MẬT",
  },
};

const PRIORITY = ["MAINTENANCE", "SECURITY", "SYSTEM", "HR"];

export default function NotificationBanner() {
  const [noticeList, setNoticeList] = useState<any[]>([]);
  const [now, setNow] = useState(dayjs());
  const marqueeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [durationSec, setDurationSec] = useState<Record<string, number>>({});
  const [closedIds, setClosedIds] = useState<string[]>([]);

  useEffect(() => {
    load();
    const poll = setInterval(load, 300000);
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
        setNoticeList([]);
        return;
      }
      const sorted = data.sort(
        (a, b) => PRIORITY.indexOf(a.type) - PRIORITY.indexOf(b.type)
      );
      setNoticeList(sorted);
    } catch {
      setNoticeList([]);
    }
  }

  useEffect(() => {
    const newDurations: Record<string, number> = {};
    noticeList.forEach((notice) => {
      const ref = marqueeRefs.current[notice.id];
      if (!ref) return;
      const contentWidth = ref.scrollWidth;
      const speed = window.innerWidth < 768 ? 35 : 55;
      newDurations[notice.id] = Math.max(contentWidth / speed, 15);
    });
    setDurationSec(newDurations);
  }, [noticeList]);

  function handleClose(id: string) {
    setClosedIds((prev) => [...prev, id]);
  }

  if (!noticeList || noticeList.length === 0) return null;

  return (
    <div className="sticky top-0 z-50 px-2 md:px-4 space-y-3">
      {noticeList
        .filter((notice) => !closedIds.includes(notice.id))
        .map((notice) => {
          const theme = THEME[notice.type] || THEME.SYSTEM;
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
            <div
              key={notice.id}
              className={`relative bg-gradient-to-r ${theme.gradient} text-white rounded-2xl shadow-xl overflow-hidden`}
            >
              {/* Nút đóng */}
              <Tooltip title="Đóng thông báo">
                <button
                  onClick={() => handleClose(notice.id)}
                  className="absolute top-2 right-2 text-white hover:text-gray-200 transition text-lg md:text-xl"
                >
                  <CloseOutlined />
                </button>
              </Tooltip>

              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 p-3 md:p-4 overflow-hidden">
                {/* LEFT */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-2xl md:text-3xl">{theme.icon}</div>
                  <Tag
                    color={theme.color}
                    className="font-semibold text-sm md:text-base"
                  >
                    {theme.label}
                  </Tag>
                  {remainingText && (
                    <Tag color="error">{`⏳ ${remainingText}`}</Tag>
                  )}
                </div>

                {/* MARQUEE */}
                <div className="relative flex-1 overflow-hidden">
                  <div
                    ref={(el) => {
                      marqueeRefs.current[notice.id] = el;
                    }}
                    className="animate-marquee whitespace-nowrap text-sm md:text-base font-medium"
                    style={{
                      animationDuration: `${durationSec[notice.id] || 20}s`,
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
            </div>
          );
        })}

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
