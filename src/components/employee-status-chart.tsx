/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Cell,
} from "recharts";

// Định nghĩa kiểu dữ liệu
interface StatusData {
  workStatus: string;
  _count: {
    employeeId: number;
  };
}

interface StatusChartData {
  name: string;
  value: number;
  color: string;
}

interface DepartmentChartData {
  color: string;
  name: string;
  chính_thức: number;
  học_việc: number;
  nghỉ_việc: number;
}

export function EmployeeStatusChart({ statusData: initialData = [] }) {
  const [statusData, setStatusData] = useState<StatusChartData[]>([]);

  const [loading, setLoading] = useState(initialData === null);

  // Dữ liệu mẫu khi API chưa trả về kết quả - định nghĩa bên ngoài useEffect
  const sampleStatusData = useMemo<StatusChartData[]>(
    () => [
      { name: "Chính thức", value: 0, color: "#4ade80" },
      { name: "Học việc", value: 0, color: "#facc15" },
      { name: "Nghỉ việc", value: 0, color: "#f87171" },
    ],
    []
  );

  const sampleDepartmentData = useMemo<DepartmentChartData[]>(
    () => [
      { name: "Kỹ thuật", chính_thức: 0, học_việc: 0, nghỉ_việc: 0, color: "" },
      {
        name: "Kinh doanh",
        chính_thức: 0,
        học_việc: 0,
        nghỉ_việc: 0,
        color: "",
      },
      {
        name: "Hành chính",
        chính_thức: 0,
        học_việc: 0,
        nghỉ_việc: 0,
        color: "",
      },
      { name: "Nhân sự", chính_thức: 0, học_việc: 0, nghỉ_việc: 0, color: "" },
      { name: "Kế toán", chính_thức: 0, học_việc: 0, nghỉ_việc: 0, color: "" },
    ],
    []
  );

  // Helper function to get status name
  const getStatusName = (status: string): string => {
    const statusNames: Record<string, string> = {
      OFFICIAL: "Chính thức",
      PROBATION: "Học việc",
      RESIGNED: "Nghỉ việc",
    };
    return statusNames[status] || status;
  };

  // Helper function to get color for status
  const getColorForStatus = (status: string): string => {
    const colors: Record<string, string> = {
      OFFICIAL: "#4ade80",
      PROBATION: "#facc15",
      RESIGNED: "#f87171",
    };
    return colors[status] || "#9ca3af";
  };

  useEffect(() => {
    if (initialData) {
      // Transform the data to the format needed by the chart
      const transformedData = initialData.map((status: StatusData) => ({
        name: getStatusName(status.workStatus),
        value: status._count.employeeId,
        color: getColorForStatus(status.workStatus),
      }));
      setStatusData(transformedData);
      return;
    }

    async function fetchEmployeeData() {
      try {
        const response = await fetch("/api/report/dashboard");
        const data = await response.json();

        if (data && data.employeeStatusDistribution) {
          // Transform the data to the format needed by the chart
          const transformedData = data.employeeStatusDistribution.map(
            (status: StatusData) => ({
              name: getStatusName(status.workStatus),
              value: status._count.employeeId,
              color: getColorForStatus(status.workStatus),
            })
          );
          setStatusData(transformedData);
        } else {
          setStatusData(sampleStatusData);
        }
      } catch (error) {
        console.error("Error fetching employee status data:", error);
        // Use sample data if API fails
        setStatusData(sampleStatusData);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployeeData();
  }, [initialData, sampleStatusData, sampleDepartmentData]);

  if (loading) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  }

  // Xác định dữ liệu hiển thị dựa trên viewType
  const data = statusData.length > 0 ? statusData : sampleStatusData;

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey={"value"}>
            {data.map((item, index) => {
              return <Cell key={`cell-${index}`} fill={item?.color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
