"use client";
import { useEffect, useState, useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#8884d8",
  "#83a6ed",
  "#8dd1e1",
  "#82ca9d",
  "#a4de6c",
  "#d0ed57",
  "#ffc658",
];

// Định nghĩa kiểu dữ liệu
interface DepartmentData {
  department: string;
  _count: {
    employeeId: number;
  };
}

interface TreemapData {
  name: string;
  children: {
    name: string;
    size: number;
    color: string;
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
        children: initialData.map((dept: DepartmentData, index: number) => ({
          name: dept.department,
          size: dept._count.employeeId,
          color: COLORS[index % COLORS.length],
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
              (dept: DepartmentData, index: number) => ({
                name: dept.department,
                size: dept._count.employeeId,
                color: COLORS[index % COLORS.length],
              })
            ),
          };
          setData([transformedData]);
        } else {
          // Nếu không có dữ liệu, sử dụng dữ liệu mẫu
          setData(sampleData);
        }
      } catch (error) {
        console.error("Error fetching department data:", error);
        // Use sample data if API fails
        setData(sampleData);
      } finally {
        setLoading(false);
      }
    }

    fetchDepartmentData();
  }, [initialData, sampleData]);

  // Helper function to get total employees - chuyển thành useMemo để tránh tính toán lại
  const getTotalEmployees = useMemo(() => {
    if (!data || data.length === 0 || !data[0]?.children) return 120; // Default value
    return data[0].children.reduce((sum, dept) => sum + dept.size, 0);
  }, [data]);

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

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, size } = props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? "none" : props.color,
            stroke: "#fff",
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
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

  if (loading) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  }

  // Sử dụng data trực tiếp thay vì tính toán lại
  const chartData = data.length > 0 ? data : sampleData;

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={chartData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
