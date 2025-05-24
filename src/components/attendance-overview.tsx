"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "antd";

// Định nghĩa kiểu dữ liệu
interface AttendanceData {
  name: string;
  đúng_giờ: number;
  đi_muộn: number;
  vắng: number;
}

export function AttendanceOverview() {
  const [timeRange, setTimeRange] = useState("week");
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);

  // Dữ liệu mẫu khi API chưa trả về kết quả - định nghĩa bên ngoài useEffect
  const sampleData = useMemo<AttendanceData[]>(
    () => [
      { name: "T2", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "T3", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "T4", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "T5", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "T6", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "T7", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "CN", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
    ],
    []
  );

  const monthlyData = useMemo<AttendanceData[]>(
    () => [
      { name: "T1", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "T2", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "T3", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "T4", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "T5", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
      { name: "T6", đúng_giờ: 0, đi_muộn: 0, vắng: 0 },
    ],
    []
  );

  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        // Tính toán ngày bắt đầu và kết thúc dựa trên timeRange
        const today = new Date();
        let startDate, endDate;

        if (timeRange === "week") {
          // Lấy ngày đầu tuần (thứ 2)
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          startDate = new Date(today.setDate(diff));
          endDate = new Date();
        } else {
          // Lấy 6 tháng gần đây
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 6);
          endDate = new Date();
        }

        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];

        const response = await fetch(
          `/api/report/attendance?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
        );
        const data = await response.json();

        // Xử lý dữ liệu từ API để hiển thị trên biểu đồ
        if (data && data.stats && data.stats.dailyStats) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedData = data.stats.dailyStats.map((day: any) => ({
            name: new Date(day.date).toLocaleDateString("vi-VN", {
              weekday: "short",
            }),
            đúng_giờ: day.onTime,
            đi_muộn: day.late,
            vắng: day.absent,
          }));
          setAttendanceData(formattedData);
        } else {
          // Nếu không có dữ liệu, sử dụng dữ liệu mẫu
          setAttendanceData(timeRange === "week" ? sampleData : monthlyData);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        // Sử dụng dữ liệu mẫu nếu API lỗi
        setAttendanceData(timeRange === "week" ? sampleData : monthlyData);
      } finally {
      }
    }

    fetchAttendanceData();
  }, [timeRange, sampleData, monthlyData]);

  // Sử dụng dữ liệu từ state hoặc dữ liệu mẫu
  const chartData =
    attendanceData.length > 0
      ? attendanceData
      : timeRange === "week"
      ? sampleData
      : monthlyData;

  return (
    <div className="border-none shadow-none shadow-card-report p-6 rounded-2xl">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle>Thống kê chấm công</CardTitle>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e)}
            style={{ width: "100px" }}
            placeholder={"Chọn thời gian"}
            allowClear
            options={[
              { value: "week", label: "Tuần này" },
              { value: "month", label: "6 tháng gần đây" },
            ]}
          />
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "6px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  border: "none",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="đúng_giờ"
                stackId="1"
                stroke="#4ade80"
                fill="#4ade80"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="đi_muộn"
                stackId="1"
                stroke="#facc15"
                fill="#facc15"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="vắng"
                stackId="1"
                stroke="#f87171"
                fill="#f87171"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </div>
  );
}
