"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Định nghĩa kiểu dữ liệu
interface LeaveTypeData {
  type: string;
  count: number;
  hours: number;
  approved: number;
  rejected: number;
  pending: number;
}

interface LeaveTimePeriodData {
  period: string;
  total: number;
  hours: number;
  approved: number;
  rejected: number;
  pending: number;
  byType: Record<string, { count: number; hours: number }>;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface LeaveRequestsChartProps {
  leaveTypeData?: LeaveTypeData[] | LeaveTimePeriodData[];
}

export function LeaveRequestsChart({ leaveTypeData }: LeaveRequestsChartProps) {
  const [leaveData, setLeaveData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(leaveTypeData === undefined);

  // Dữ liệu mẫu khi API chưa trả về kết quả - định nghĩa bên ngoài useEffect
  const sampleData = useMemo<ChartData[]>(
    () => [
      { name: "Phép năm (PN)", value: 0, color: "#0ea5e9" },
      { name: "Nghỉ bù (NB)", value: 0, color: "#22c55e" },
      { name: "Phép cưới (PC)", value: 0, color: "#f59e0b" },
      { name: "Phép tang (PT)", value: 0, color: "#64748b" },
      { name: "Công tác (Cgt)", value: 0, color: "#8b5cf6" },
      { name: "Phép bệnh (PB)", value: 0, color: "#ec4899" },
      { name: "Không có", value: 1, color: "#ec4899" },
    ],
    []
  );

  // Helper function to get leave type name
  const getLeaveTypeName = (type: string): string => {
    const typeNames: Record<string, string> = {
      PN: "Phép năm (PN)",
      NB: "Nghỉ bù (NB)",
      PC: "Phép cưới (PC)",
      PT: "Phép tang (PT)",
      Cgt: "Công tác (Cgt)",
      PB: "Phép bệnh (PB)",
    };
    return typeNames[type] || type;
  };

  // Helper function to get color for leave type
  const getColorForLeaveType = (type: string): string => {
    const colors: Record<string, string> = {
      PN: "#0ea5e9",
      NB: "#22c55e",
      PC: "#f59e0b",
      PT: "#64748b",
      Cgt: "#8b5cf6",
      PB: "#ec4899",
    };
    return colors[type] || "#9ca3af";
  };

  useEffect(() => {
    if (leaveTypeData && leaveTypeData.length > 0) {
      // Kiểm tra xem dữ liệu là theo loại phép hay theo thời gian
      const isTypeData = "type" in leaveTypeData[0];

      if (isTypeData) {
        // Dữ liệu theo loại phép
        const chartData = (leaveTypeData as LeaveTypeData[]).map((item) => ({
          name: getLeaveTypeName(item.type),
          value: item.count,
          color: getColorForLeaveType(item.type),
        }));
        setLeaveData(chartData);
      } else {
        // Dữ liệu theo thời gian - tổng hợp theo loại phép
        const typeData: Record<string, number> = {};

        // Tổng hợp số lượng đơn theo loại phép
        (leaveTypeData as LeaveTimePeriodData[]).forEach((period) => {
          Object.entries(period.byType).forEach(([type, data]) => {
            typeData[type] = (typeData[type] || 0) + data.count;
          });
        });

        // Chuyển đổi thành dữ liệu biểu đồ
        const chartData = Object.entries(typeData).map(([type, count]) => ({
          name: getLeaveTypeName(type),
          value: count,
          color: getColorForLeaveType(type),
        }));

        setLeaveData(chartData);
      }
      setLoading(false);
    } else {
      // Nếu không có dữ liệu, sử dụng dữ liệu mẫu
      setLeaveData(sampleData);
      setLoading(false);
    }
  }, [leaveTypeData, sampleData]);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${
          (percent * 100).toFixed(0) !== "0"
            ? (percent * 100).toFixed(0) + "%"
            : ""
        }`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  }

  // Sử dụng dữ liệu từ state hoặc dữ liệu mẫu
  const data = leaveData.length > 0 ? leaveData : sampleData;

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} đơn`, "Số lượng"]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
