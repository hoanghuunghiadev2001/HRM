/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Typography, Skeleton, ConfigProvider, Tag } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  HeartFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);
const { Title, Text } = Typography;

// Định nghĩa bảng màu Pastel chuyên nghiệp cho từng ngày
const DAY_THEMES: any = {
  "Thứ 2": { bg: "#e6f4ff", primary: "#1677ff", accent: "#0050b3", icon: "💎" },
  "Thứ 3": { bg: "#f6ffed", primary: "#52c41a", accent: "#237804", icon: "🍀" },
  "Thứ 4": { bg: "#fff7e6", primary: "#fa8c16", accent: "#ad4e00", icon: "🍊" },
  "Thứ 5": { bg: "#fff1f0", primary: "#f5222d", accent: "#a8071a", icon: "🍎" },
  "Thứ 6": { bg: "#f9f0ff", primary: "#722ed1", accent: "#391085", icon: "🍇" },
  "Thứ 7": { bg: "#e6fffb", primary: "#13c2c2", accent: "#006d75", icon: "🌊" },
};

export const LunchMenuUserView = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentWeek = dayjs().week();
  const currentYear = dayjs().year();
  const daysOfWeek = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

  useEffect(() => {
    fetch(`/api/lunch-menu?week=${currentWeek}&year=${currentYear}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [currentWeek, currentYear]);

  const getMenuByDay = (dayName: string) => {
    return data.find(
      (item) =>
        item.dayOfWeek.includes(dayName) || dayName.includes(item.dayOfWeek)
    );
  };

  if (loading)
    return (
      <div style={{ padding: 60 }}>
        <Skeleton active round paragraph={{ rows: 8 }} />
      </div>
    );

  return (
    <ConfigProvider
      theme={{ token: { fontFamily: "'Segoe UI', Roboto, sans-serif" } }}
    >
      <div
        style={{
          minHeight: "calc(100vh - 80px)",
          background: "#fafafa",
          padding: "40px 16px",
          backgroundImage: "linear-gradient(180deg, #ffffff 0%, #f0f2f5 100%)",
        }}
      >
        {/* Header tinh tế hơn */}
        <div
          style={{ maxWidth: 1200, margin: "0 auto 48px", textAlign: "center" }}
        >
          <Text
            strong
            style={{ color: "#8c8c8c", letterSpacing: 2, fontSize: 12 }}
          >
            EST. {currentYear} • KITCHEN MENU
          </Text>
          <Title
            level={2}
            style={{ marginTop: 8, fontWeight: 800, fontSize: 32 }}
          >
            Thực Đơn{" "}
            <span style={{ color: "#1677ff" }}>Tuần {currentWeek}</span>
          </Title>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              alignItems: "center",
            }}
          >
            <Tag
              icon={<CalendarOutlined />}
              bordered={false}
              color="orange-inverse"
            >
              Năm {currentYear}
            </Tag>
            <Tag icon={<EnvironmentOutlined />} bordered={false} color="blue">
              TBD Phòng ăn tầng 2
            </Tag>
          </div>
        </div>

        {/* Menu Grid */}
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "16px",
          }}
        >
          {daysOfWeek.map((day) => {
            const menu = getMenuByDay(day);
            const theme = DAY_THEMES[day];
            const dayMap: any = {
              1: "Chủ Nhật",
              2: "Thứ 2",
              3: "Thứ 3",
              4: "Thứ 4",
              5: "Thứ 5",
              6: "Thứ 6",
              7: "Thứ 7",
            };
            const isToday = day === dayMap[dayjs().day() + 1];

            return (
              <div
                key={day}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "20px",
                  border: isToday
                    ? `2px solid ${theme.primary}`
                    : "1px solid #f0f0f0",
                  boxShadow: isToday
                    ? `0 12px 24px ${theme.primary}20`
                    : "0 4px 10px rgba(0,0,0,0.03)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "380px",
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    background: theme.bg,
                    margin: "-20px -20px 20px -20px",
                    padding: "16px",
                    borderRadius: "20px 20px 0 0",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <Text strong style={{ color: theme.accent, fontSize: 16 }}>
                    {day}
                  </Text>
                  {isToday && (
                    <Badge
                      dot
                      color={theme.primary}
                      style={{ position: "absolute", top: 15, right: 15 }}
                    />
                  )}
                </div>

                {menu ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
                    >
                      <CompactFoodItem
                        icon="🍖"
                        label="Món mặn"
                        value={menu.salty}
                      />
                      <CompactFoodItem
                        icon="🥗"
                        label="Món chay"
                        value={menu.vegetarian}
                      />
                      <CompactFoodItem
                        icon="🔥"
                        label="Món xào"
                        value={menu.stir}
                      />
                      <CompactFoodItem
                        icon="🥣"
                        label="Canh"
                        value={menu.soup}
                      />
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: 16 }}>
                      <div
                        style={{
                          background: "#f5f5f5",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          border: "1px dashed #d9d9d9",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#8c8c8c",
                            display: "block",
                          }}
                        >
                          TRÁNG MIỆNG
                        </Text>
                        <Text strong style={{ fontSize: 12, color: "#595959" }}>
                          {menu.dessert || "Trái cây mùa"}
                        </Text>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: 0.3,
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ fontSize: 24, marginBottom: 8 }}
                    />
                    <Text style={{ fontSize: 12 }}>Chưa cập nhật</Text>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div style={{ textAlign: "center", marginTop: 48, opacity: 0.6 }}>
          <Text style={{ fontSize: 12 }}>
            <HeartFilled style={{ color: "#ff4d4f", marginRight: 4 }} />
            Chúc bạn một bữa trưa ngon miệng và đầy năng lượng!
          </Text>
        </div>
      </div>
    </ConfigProvider>
  );
};

// Component con tối giản hơn
const CompactFoodItem = ({ icon, label, value }: any) => (
  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
    <span style={{ fontSize: 16, marginTop: 2 }}>{icon}</span>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Text
        style={{
          fontSize: 9,
          color: "#bfbfbf",
          fontWeight: 700,
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#262626",
          fontWeight: 500,
          lineHeight: 1.3,
        }}
      >
        {value}
      </Text>
    </div>
  </div>
);

// Helper Badge nhỏ gọn
const Badge = ({ style }: any) => (
  <div
    style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "#ff4d4f",
      ...style,
    }}
  ></div>
);
