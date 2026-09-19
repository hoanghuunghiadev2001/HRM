/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Skeleton, Tabs, ConfigProvider } from "antd";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useEffect } from "react";

dayjs.extend(weekOfYear);

const DAYS_OF_WEEK = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const FOOD_ITEMS = [
  { key: "salty", label: "Món mặn" },
  { key: "vegetarian", label: "Món chay" },
  { key: "stir", label: "Món xào" },
  { key: "soup", label: "Canh" },
];

const ACCENT = "#7A3B34";

const formatWeekRange = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
  if (start.month() === end.month()) {
    return `${start.format("D")} – ${end.format("D")} tháng ${end.format("M")}, ${end.year()}`;
  }
  return `${start.format("D/M")} – ${end.format("D/M")}, ${end.year()}`;
};

// Nội dung 1 ngày — dùng chung cho cả cột desktop lẫn panel mobile
const DayContent = ({ menu }: { menu: any }) => {
  if (!menu) {
    return (
      <div className="text-center italic text-[13px] text-[#8A8577] opacity-75 py-10">
        Chưa cập nhật
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {FOOD_ITEMS.map(({ key, label }) => (
        <div key={key}>
          <span className="block italic text-[11.5px] text-[#8A8577]">
            {label}
          </span>
          <span className="block text-[14px] leading-snug mt-0.5 text-[#262420]">
            {menu[key] || "—"}
          </span>
        </div>
      ))}
      <div className="pt-4 mt-4 border-t border-[#D9D2BF]">
        <span className="block italic text-[11.5px] text-[#8A8577]">
          Tráng miệng
        </span>
        <span className="block text-[14px] leading-snug mt-0.5 text-[#262420]">
          {menu.dessert || "Trái cây mùa"}
        </span>
      </div>
    </div>
  );
};

export const LunchMenuUserView = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(dayjs());

  // Ngày đang chọn trên mobile — mặc định là hôm nay nếu đang xem tuần hiện tại
  const [mobileDayIdx, setMobileDayIdx] = useState(() => {
    const today = dayjs().day(); // 0 = CN, 1 = T2 ... 6 = T7
    return today >= 1 && today <= 6 ? today - 1 : 0;
  });

  const currentWeek = viewDate.week();
  const currentYear = viewDate.year();
  const isCurrentWeek = viewDate.isSame(dayjs(), "week");
  const weekStart = viewDate.day(1);
  const weekEnd = viewDate.day(6);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lunch-menu?week=${currentWeek}&year=${currentYear}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentWeek, currentYear]);

  const handlePrevWeek = () => setViewDate(viewDate.subtract(1, "week"));
  const handleNextWeek = () => setViewDate(viewDate.add(1, "week"));
  const handleCurrentWeek = () => setViewDate(dayjs());

  const getMenuByDay = (dayName: string) =>
    data.find(
      (item) =>
        item.dayOfWeek.includes(dayName) || dayName.includes(item.dayOfWeek),
    );

  if (loading && data.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#EAE4D6] py-10 px-5">
        <div className="max-w-[1180px] mx-auto bg-[#FDFBF6] border border-[#D9D2BF] rounded-sm p-10">
          <Skeleton active round paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-80px)] bg-[#EAE4D6] text-[#262420]"
      style={{ fontFamily: "'Lora', Georgia, serif" }}
    >
      {/* Chuyển vào layout.tsx / next/font nếu muốn dùng ổn định hơn */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap');`}</style>

      <div className="max-w-[1180px] mx-auto px-4 md:px-5 py-10 pb-16">
        <div className="bg-[#FDFBF6] border border-[#D9D2BF] rounded-sm shadow-[0_24px_46px_-30px_rgba(38,36,32,0.35)] px-5 pt-8 pb-8 md:px-10 md:pt-11">
          {/* Header */}
          <header className="text-center">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handlePrevWeek}
                aria-label="Tuần trước"
                className="w-9 h-9 flex items-center justify-center text-2xl leading-none text-[#8A8577] hover:bg-black/5 rounded-full transition-colors"
              >
                ‹
              </button>
              <h1 className="text-xl md:text-[28px] font-semibold px-2">
                Thực đơn tuần {currentWeek}
              </h1>
              <button
                onClick={handleNextWeek}
                aria-label="Tuần sau"
                className="w-9 h-9 flex items-center justify-center text-2xl leading-none text-[#8A8577] hover:bg-black/5 rounded-full transition-colors"
              >
                ›
              </button>
            </div>

            <p className="italic text-[#8A8577] text-sm md:text-[15px] mt-1">
              {formatWeekRange(weekStart, weekEnd)}
            </p>

            <p className="text-[12.5px] text-[#8A8577] mt-2">
              Chi nhánh Toyota Bình Dương.
              {!isCurrentWeek && (
                <>
                  {" · "}
                  <button
                    onClick={handleCurrentWeek}
                    className="text-[#7A3B34] underline"
                  >
                    về tuần này
                  </button>
                </>
              )}
            </p>
            <p className="text-[12.5px] text-[#8A8577] mt-2">
              (Chỉ áp dụng cho chi nhánh Toyota Bình Dương)
            </p>
          </header>

          {/* ===== Desktop / tablet: lưới 6 cột ===== */}
          <div
            className={`hidden md:grid md:grid-cols-3 lg:grid-cols-6 mt-9 transition-opacity ${
              loading ? "opacity-50" : "opacity-100"
            }`}
          >
            {DAYS_OF_WEEK.map((day, idx) => {
              const menu = getMenuByDay(day);
              const date = viewDate.day(idx + 1);
              const isToday = isCurrentWeek && dayjs().isSame(date, "day");

              return (
                <div
                  key={day}
                  className={`px-5 pb-2 border-t border-[#D9D2BF] md:border-t-0
                    ${idx % 3 !== 0 ? "md:border-l md:border-[#D9D2BF]" : ""}
                    lg:border-l lg:border-[#D9D2BF]
                    ${idx === 0 ? "lg:border-l-0" : ""}
                    ${idx >= 3 ? "mt-8 pt-8 border-t md:border-t md:border-[#D9D2BF] lg:mt-0 lg:pt-0 lg:border-t-0" : ""}
                    ${isToday ? "bg-[#F2E7E2] -mt-px" : ""}
                  `}
                >
                  <div
                    className={`text-center pb-3 mb-4 border-b ${
                      isToday ? "border-[#7A3B34]" : "border-[#D9D2BF]"
                    }`}
                  >
                    <span
                      className={`block font-semibold text-[15px] ${isToday ? "text-[#7A3B34]" : ""}`}
                    >
                      {day}
                    </span>
                    <span className="block text-xs text-[#8A8577] mt-0.5">
                      {date.format("DD/MM")}
                    </span>
                    {isToday && (
                      <span className="inline-block italic text-[11px] text-[#7A3B34] mt-1">
                        hôm nay
                      </span>
                    )}
                  </div>
                  <DayContent menu={menu} />
                </div>
              );
            })}
          </div>

          {/* ===== Mobile: chọn ngày bằng Tabs ===== */}
          <div className="md:hidden mt-6">
            <ConfigProvider theme={{ token: { colorPrimary: ACCENT } }}>
              <Tabs
                centered
                size="small"
                activeKey={String(mobileDayIdx)}
                onChange={(k) => setMobileDayIdx(Number(k))}
                items={DAYS_OF_WEEK.map((day, idx) => ({
                  key: String(idx),
                  label: day,
                }))}
              />
            </ConfigProvider>

            {(() => {
              const idx = mobileDayIdx;
              const day = DAYS_OF_WEEK[idx];
              const menu = getMenuByDay(day);
              const date = viewDate.day(idx + 1);
              const isToday = isCurrentWeek && dayjs().isSame(date, "day");

              return (
                <div
                  className={`mt-2 px-3 py-4 rounded-sm ${isToday ? "bg-[#F2E7E2]" : ""}`}
                >
                  <div
                    className={`text-center pb-3 mb-4 border-b ${isToday ? "border-[#7A3B34]" : "border-[#D9D2BF]"}`}
                  >
                    <span className="block text-xs text-[#8A8577]">
                      {date.format("DD/MM")}
                    </span>
                    {isToday && (
                      <span className="inline-block italic text-[11px] text-[#7A3B34] mt-1">
                        hôm nay
                      </span>
                    )}
                  </div>
                  <DayContent menu={menu} />
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
