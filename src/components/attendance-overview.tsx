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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      { name: "T2", đúng_giờ: 120, đi_muộn: 5, vắng: 2 },
      { name: "T3", đúng_giờ: 118, đi_muộn: 7, vắng: 3 },
      { name: "T4", đúng_giờ: 115, đi_muộn: 9, vắng: 4 },
      { name: "T5", đúng_giờ: 119, đi_muộn: 6, vắng: 3 },
      { name: "T6", đúng_giờ: 117, đi_muộn: 8, vắng: 3 },
      { name: "T7", đúng_giờ: 110, đi_muộn: 4, vắng: 14 },
      { name: "CN", đúng_giờ: 30, đi_muộn: 2, vắng: 96 },
    ],
    []
  );

  const monthlyData = useMemo<AttendanceData[]>(
    () => [
      { name: "T1", đúng_giờ: 2200, đi_muộn: 120, vắng: 80 },
      { name: "T2", đúng_giờ: 2150, đi_muộn: 130, vắng: 90 },
      { name: "T3", đúng_giờ: 2180, đi_muộn: 110, vắng: 85 },
      { name: "T4", đúng_giờ: 2220, đi_muộn: 100, vắng: 70 },
      { name: "T5", đúng_giờ: 2250, đi_muộn: 95, vắng: 65 },
      { name: "T6", đúng_giờ: 2300, đi_muộn: 90, vắng: 60 },
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
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle>Thống kê chấm công</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">6 tháng gần đây</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          {timeRange === "week"
            ? "Số liệu chấm công trong tuần này"
            : "Số liệu chấm công 6 tháng gần đây"}
        </CardDescription>
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
    </Card>
  );
}
