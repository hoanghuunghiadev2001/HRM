/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "antd";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { buildMenuItems } from "@/lib/lunch-menu";

dayjs.extend(weekOfYear);

const DAYS_OF_WEEK = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
type Brand = "TBD" | "TMP";

interface Props {
  /** Đường dẫn tới trang thực đơn đầy đủ */
  href?: string;
  /** Chi nhánh của nhân viên đang đăng nhập */
  brand?: Brand;
}

export default function LunchMenuWidget({
  href = "/lunch-menu",
  brand = "TBD",
}: Props) {
  // Chủ nhật không có thực đơn -> hiển thị thứ 2 hôm sau
  const target = dayjs().day() === 0 ? dayjs().add(1, "day") : dayjs();
  const isToday = target.isSame(dayjs(), "day");
  const dayName = DAYS_OF_WEEK[target.day() - 1];
  const week = target.week();
  const year = target.year();

  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); // ⭐ hiện skeleton khi đổi brand/ngày, tránh nháy dữ liệu cũ
    fetch(`/api/lunch-menu?week=${week}&year=${year}&brand=${brand}`)
      .then((res) => res.json())
      .then((json: any[]) => {
        if (cancelled) return;
        const list = Array.isArray(json) ? json : [];
        const found = list.find(
          (item) =>
            item.dayOfWeek.includes(dayName) ||
            dayName.includes(item.dayOfWeek),
        );
        setMenu(found ?? null);
      })
      .catch(() => !cancelled && setMenu(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [week, year, dayName, brand]); // ⭐ thêm brand

  return (
    <section
      className="rounded-2xl border border-[#D9D2BF] bg-[#FDFBF6] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06)] md:p-5"
      style={{ fontFamily: "'Lora', Georgia, serif" }}
    >
      <header className="mb-3 flex items-start justify-between gap-3 border-b border-[#D9D2BF] pb-3">
        <div>
          <h3 className="m-0 text-base font-semibold text-[#262420]">
            Thực đơn {isToday ? "hôm nay" : "ngày mai"}
          </h3>
          <p className="m-0 mt-0.5 text-xs italic text-[#8A8577]">
            {dayName}, {target.format("DD/MM/YYYY")}
          </p>
        </div>
        <Link
          href={href}
          className="shrink-0 whitespace-nowrap text-[12.5px] text-[#7A3B34] underline"
        >
          Xem cả tuần
        </Link>
      </header>

      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} title={false} />
      ) : buildMenuItems(menu).length === 0 ? (
        <div className="py-6 text-center text-[13px] italic text-[#8A8577]">
          Chưa cập nhật
        </div>
      ) : (
        <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {buildMenuItems(menu).map(({ key, label, value }) => (
            <div key={key}>
              <dt className="text-[11.5px] italic text-[#8A8577]">{label}</dt>
              <dd className="m-0 mt-0.5 text-[14px] leading-snug text-[#262420]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
