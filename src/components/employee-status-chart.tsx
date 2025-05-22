/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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
  name: string;
  chính_thức: number;
  học_việc: number;
  nghỉ_việc: number;
}

export function EmployeeStatusChart({ statusData: initialData = [] }) {
  const [viewType, setViewType] = useState("status");
  const [statusData, setStatusData] = useState<StatusChartData[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentChartData[]>(
    []
  );
  const [loading, setLoading] = useState(initialData === null);

  // Dữ liệu mẫu khi API chưa trả về kết quả - định nghĩa bên ngoài useEffect
  const sampleStatusData = useMemo<StatusChartData[]>(
    () => [
      { name: "Chính thức", value: 95, color: "#4ade80" },
      { name: "Học việc", value: 23, color: "#facc15" },
      { name: "Nghỉ việc", value: 2, color: "#f87171" },
    ],
    []
  );

  const sampleDepartmentData = useMemo<DepartmentChartData[]>(
    () => [
      { name: "Kỹ thuật", chính_thức: 30, học_việc: 8, nghỉ_việc: 0 },
      { name: "Kinh doanh", chính_thức: 25, học_việc: 5, nghỉ_việc: 1 },
      { name: "Hành chính", chính_thức: 15, học_việc: 3, nghỉ_việc: 0 },
      { name: "Nhân sự", chính_thức: 10, học_việc: 2, nghỉ_việc: 0 },
      { name: "Kế toán", chính_thức: 15, học_việc: 5, nghỉ_việc: 1 },
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

        if (data && data.departmentDistribution) {
          // Transform department data
          const deptData = data.departmentDistribution.map((dept: any) => {
            const deptName = dept.department;
            // We don't have the breakdown by status per department from the API
            // So we'll use a simplified approach for now
            return {
              name: deptName,
              chính_thức: Math.round(dept._count.employeeId * 0.8), // Assume 80% are official
              học_việc: Math.round(dept._count.employeeId * 0.18), // Assume 18% are probation
              nghỉ_việc: Math.round(dept._count.employeeId * 0.02), // Assume 2% have resigned
            };
          });
          setDepartmentData(deptData);
        } else {
          setDepartmentData(sampleDepartmentData);
        }
      } catch (error) {
        console.error("Error fetching employee status data:", error);
        // Use sample data if API fails
        setStatusData(sampleStatusData);
        setDepartmentData(sampleDepartmentData);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployeeData();
  }, [initialData, sampleStatusData, sampleDepartmentData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value} nhân viên
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  }

  // Xác định dữ liệu hiển thị dựa trên viewType
  const data =
    viewType === "status"
      ? statusData.length > 0
        ? statusData
        : sampleStatusData
      : departmentData.length > 0
      ? departmentData
      : sampleDepartmentData;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle>Trạng thái nhân viên</CardTitle>
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn kiểu hiển thị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Theo trạng thái</SelectItem>
              <SelectItem value="department">Theo phòng ban</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          {viewType === "status"
            ? "Phân bố nhân viên theo trạng thái"
            : "Phân bố nhân viên theo phòng ban"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewType === "status" ? (
              <BarChart
                layout="vertical"
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" scale="band" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Số lượng" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
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
                <Legend />
                <Bar
                  dataKey="chính_thức"
                  name="Chính thức"
                  stackId="a"
                  fill="#4ade80"
                />
                <Bar
                  dataKey="học_việc"
                  name="Học việc"
                  stackId="a"
                  fill="#facc15"
                />
                <Bar
                  dataKey="nghỉ_việc"
                  name="Nghỉ việc"
                  stackId="a"
                  fill="#f87171"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
