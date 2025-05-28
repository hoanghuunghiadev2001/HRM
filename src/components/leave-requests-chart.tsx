"use client";

import { RootState } from "@/store";
import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
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
  const isMobile = useSelector((state: RootState) => state.responsive.isMobile);

  // Dữ liệu mẫu khi API chưa trả về kết quả - định nghĩa bên ngoài useEffect
  const sampleData = useMemo<ChartData[]>(
    () => [
      { name: "Phép năm (PN)", value: 0, color: "#3b82f6" }, // Xanh dương (Blue-500)
      { name: "Nghỉ bù (NB)", value: 0, color: "#10b981" }, // Xanh lá ngọc (Emerald-500)
      { name: "Phép cưới (PC)", value: 0, color: "#f59e0b" }, // Cam đậm (Amber-500)
      { name: "Phép tang (PT)", value: 0, color: "#6b7280" }, // Xám tro (Gray-500)
      { name: "Công tác (Cgt)", value: 0, color: "#8b5cf6" }, // Tím tươi (Violet-500)
      { name: "Phép bệnh (PB)", value: 0, color: "#ec4899" }, // Hồng sen (Pink-500)
      { name: "Thai sản (TS)", value: 0, color: "#eab308" }, // Vàng sẫm (Yellow-500)
      { name: "Phép riêng (PR)", value: 0, color: "#0d9488" }, // Xanh teal (Teal-600)
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
      TS: "Thai sản (TS)",
      PR: "Phép riêng (PB)",
    };
    return typeNames[type] || type;
  };

  // Helper function to get color for leave type
  const getColorForLeaveType = (type: string): string => {
    const colors: Record<string, string> = {
      PN: "#3b82f6",
      NB: "#10b981",
      PC: "#f59e0b",
      PT: "#6b7280",
      Cgt: "#8b5cf6",
      PB: "#ec4899",
      TS: "#eab308",
      PR: "#0d9488",
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

  // const renderCustomizedLabel = ({
  //   cx,
  //   cy,
  //   outerRadius,
  //   index,
  //   name,
  //   value,
  // }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // any) => {
  //   const radius = outerRadius + 50; // đẩy ra ngoài vòng
  //   const x = cx + radius;
  //   const y = cy + (index - 2.5) * 24; // canh chỉnh để label theo hàng dọc, bạn có thể chỉnh lại khoảng cách theo số lát
  //   const color = data[index]?.color || "#000";
  //   return (
  //     <g>
  //       {/* Chấm tròn màu */}
  //       <circle cx={x - 12} cy={y} r={6} fill={color} />

  //       {/* Nhãn tên loại đơn */}
  //       <text
  //         x={x}
  //         y={y}
  //         fill={color}
  //         textAnchor="start"
  //         dominantBaseline="middle"
  //         fontSize="14"
  //         fontWeight="500"
  //       >
  //         {name}: {value}
  //       </text>
  //     </g>
  //   );
  // };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel2 = ({
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
        className={`${percent === 0 ? "hidden" : ""}`}
      >
        {`${(percent * 100).toFixed(0)}%`}
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
    <div className="h-[500px] w-[100%] md:px-10">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%" // lệch sang trái để chừa chỗ bên phải cho label
            cy={"50%"}
            labelLine={false}
            label={renderCustomizedLabel2}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} đơn`, `${name}`]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "none",
              boxShadow: "none",
              border: "none",
              outline: "none",
            }}
          />
          <Legend
            align={isMobile ? "center" : "right"}
            layout={isMobile ? "horizontal" : "vertical"}
            verticalAlign={isMobile ? "bottom" : "middle"}
            cx={isMobile ? "0" : "80%"}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
