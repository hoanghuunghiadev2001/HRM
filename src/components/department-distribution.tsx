/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

// Mảng màu cho từng phòng ban (xoay vòng theo index)
const COLORS = [
  "#FF6B6B", // Đỏ tươi
  "#4ECDC4", // Xanh ngọc
  "#FF9F43", // Cam sáng
  "#6A89CC", // Xanh tím nhạt
  "#1DD1A1", // Xanh lá biển
  "#F368E0", // Tím hồng
  "#54A0FF", // Xanh dương tươi
  "#576574", // Xám xanh
  "#00D2D3", // Xanh lục bảo nhạt
  "#FF9FF3", // Hồng pastel
  "#EE5253", // Đỏ nhạt
  "#48DBFB", // Xanh nước biển sáng
  "#10AC84", // Xanh lá đậm
  "#5F27CD", // Tím đậm
  "#C4E538", // Xanh lá sáng
  "#FDA7DF", // Hồng phấn
  "#8395A7", // Xám nhạt
  "#F79F1F", // Cam đậm
  "#A3CB38", // Vàng xanh sáng
  "#12CBC4", // Xanh ngọc đậm
];
// Định nghĩa kiểu dữ liệu phòng ban trả về từ API
interface DepartmentData {
  department: string; // Tên phòng ban
  _count: {
    employeeId: number; // Số lượng nhân viên trong phòng ban
  };
}

// Kiểu dữ liệu cần cho Treemap (Recharts yêu cầu)
interface TreemapData {
  name: string; // Tên nhóm gốc (ví dụ: "Phòng ban")
  children: {
    name: string; // Tên phòng ban
    size: number; // Số lượng nhân viên
    color: string; // Màu sắc cho phòng ban
  }[];
}

// Component chính
export function DepartmentDistribution({ departmentData: initialData = [] }) {
  const [data, setData] = useState<TreemapData[]>([]); // Dữ liệu đã xử lý cho Treemap
  const [loading, setLoading] = useState(initialData === null); // Trạng thái loading

  // Dữ liệu mẫu hiển thị khi không có dữ liệu thực (hoặc demo)
  const sampleData: TreemapData[] = useMemo(
    () => [
      {
        name: "Phòng ban",
        children: [
          { name: "Kỹ thuật", size: 35, color: "#8884d8" },
          { name: "Kinh doanh", size: 40, color: "#83a6ed" },
          { name: "Hành chính", size: 15, color: "#8dd1e1" },
          { name: "Nhân sự", size: 10, color: "#82ca9d" },
          { name: "Kế toán", size: 20, color: "#a4de6c" },
        ],
      },
    ],
    []
  );

  // Xử lý dữ liệu ban đầu (nếu có) hoặc fetch dữ liệu từ API
  useEffect(() => {
    if (initialData) {
      // Dữ liệu ban đầu (truyền vào qua prop)
      const transformedData = {
        name: "Phòng ban",
        children: initialData.map((dept: DepartmentData, index: number) => ({
          name: dept.department,
          size: dept._count.employeeId,
          color: COLORS[index % COLORS.length],
        })),
      };
      setData([transformedData]);
      return; // Kết thúc sớm nếu có initialData
    }

    // Hàm fetch dữ liệu từ API
    async function fetchDepartmentData() {
      try {
        const response = await fetch("/api/report/dashboard");
        const responseData = await response.json();

        if (responseData && responseData.departmentDistribution) {
          // Chuyển đổi dữ liệu API thành format Treemap
          const transformedData = {
            name: "Phòng ban",
            children: responseData.departmentDistribution.map(
              (dept: DepartmentData, index: number) => ({
                name: dept.department,
                size: dept._count.employeeId,
                color: COLORS[index % COLORS.length],
              })
            ),
          };
          setData([transformedData]);
        } else {
          // Nếu không có dữ liệu -> dùng sample
          setData(sampleData);
        }
      } catch (error) {
        console.error("Error fetching department data:", error);
        setData(sampleData); // Lỗi API -> fallback sample
      } finally {
        setLoading(false);
      }
    }

    fetchDepartmentData();
  }, [initialData, sampleData]);

  // Tính tổng số nhân viên (dùng useMemo để tránh tính lại mỗi lần render)
  const getTotalEmployees = useMemo(() => {
    if (!data || data.length === 0 || !data[0]?.children) return 120; // Giá trị mặc định (120) nếu chưa có data
    return data[0].children.reduce((sum, dept) => sum + dept.size, 0);
  }, [data]);

  // Custom tooltip hiển thị khi hover
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const tooltipData = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="font-medium">{tooltipData.name}</p>
          <p className="text-sm text-muted-foreground">
            {tooltipData.size} nhân viên
          </p>
          <p className="text-sm text-muted-foreground">
            {((tooltipData.size / getTotalEmployees) * 100).toFixed(1)}% tổng
            nhân viên
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom rendering cho từng phần tử Treemap (ô vuông)
  const CustomizedContent = (props: any) => {
    const { depth, x, y, width, height, name, size } = props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? "none" : props.color, // Màu nền (level 1 không có màu, level 2 có màu)
            stroke: "#fff",
            strokeWidth: 2 / (depth + 1e-10), // Viền mỏng hơn ở cấp sâu hơn
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {/* Chỉ hiển thị tên + số lượng nếu đủ chỗ */}
        {depth === 1 && width > 50 && height > 28 ? (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
            >
              {size} nhân viên
            </text>
          </>
        ) : null}
      </g>
    );
  };

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  }

  // Chọn data để hiển thị (dùng dữ liệu thực nếu có, ngược lại dùng sample)
  const chartData = data.length > 0 ? data : sampleData;
  console.log(chartData);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height="300px">
        <Treemap
          data={chartData} // Dữ liệu cho Treemap
          dataKey="size" // Khóa để xác định diện tích ô
          aspectRatio={4 / 3} // Tỉ lệ khung hình
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />} // Render từng phần tử Treemap
        >
          <Tooltip content={<CustomTooltip />} /> {/* Tooltip khi hover */}
        </Treemap>
      </ResponsiveContainer>
      <div className="mt-3">
        {data.map((item, index) => {
          return (
            <div
              key={item.name + index}
              className="flex gap-4 flex-wrap justify-center"
            >
              {item.children.map((children, i) => {
                return (
                  <div
                    key={children.name + i}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="h-4 w-4 "
                      style={{ backgroundColor: children.color }}
                    ></div>
                    <p style={{ color: children.color }}>{children.name}</p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
