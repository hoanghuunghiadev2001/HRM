/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

// import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

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

// Định nghĩa kiểu dữ liệu
// interface DepartmentData {
//   department: string;
//   _count: {
//     employeeId: number;
//   };
// }

interface TreemapData {
  name: string;
  children: {
    name: string;
    size: number;
  }[];
}

export function DepartmentDistribution({ departmentData: initialData = [] }) {
  const [data, setData] = useState<TreemapData[]>([]);
  const [loading, setLoading] = useState(initialData === null);

  // Dữ liệu mẫu khi API chưa trả về kết quả - định nghĩa bên ngoài useEffect
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

  useEffect(() => {
    if (initialData) {
      // Transform the data to the format needed by the chart
      const transformedData = {
        name: "Phòng ban",
        children: initialData.map((dept: any) => ({
          name: dept.departmentName || "Không xác định",
          size: dept.totalEmployees || 0,
        })),
      };
      setData([transformedData]);
      return;
    }

    async function fetchDepartmentData() {
      try {
        const response = await fetch("/api/report/dashboard");
        const responseData = await response.json();

        if (responseData && responseData.departmentDistribution) {
          // Transform the data to the format needed by the chart
          const transformedData = {
            name: "Phòng ban",
            children: responseData.departmentDistribution.map(
              (dept: any, index: number) => ({
                name: dept.departmentName || "Không xác định",
                size: dept.totalEmployees || 0,
                color: COLORS[index % COLORS.length],
              })
            ),
          };
          setData([transformedData]);
        } else {
          setData(sampleData);
        }
      } catch (error) {
        console.error("Error fetching department data:", error);
        setData(sampleData);
      } finally {
        setLoading(false);
      }
    }

    fetchDepartmentData();
  }, []);

  const series = [
    {
      data:
        data[0]?.children.map((child) => ({
          x: child.name,
          y: child.size,
        })) || [],
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  }
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: "treemap",
    },
    legend: {
      show: true,
    },
    title: {
      text: "Phòng ban",
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    colors: COLORS, // Dùng mảng màu của bạn
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false,
      },
    },
    tooltip: {
      enabled: true,
      // ApexCharts tooltip sẽ hiển thị name và value theo mặc định
      // Nếu muốn customize phức tạp hơn, cần dùng events hoặc custom HTML tooltip riêng
    },
  };

  // Sử dụng data trực tiếp thay vì tính toán lại

  return (
    <div>
      <Chart options={options} series={series} type="treemap" height={350} />
    </div>
  );
}
