/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendanceOverview } from "@/components/attendance-overview";

export default function AttendanceReportPage() {
  const [dateRange, setDateRange] = useState("month");
  const [department, setDepartment] = useState("all");
  const [groupBy, setGroupBy] = useState("day");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendanceReport() {
      try {
        // Calculate date range based on selection
        const today = new Date();
        let startDate, endDate;

        if (dateRange === "week") {
          // Get the start of the week (Monday)
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          startDate = new Date(today.setDate(diff));
          endDate = new Date();
        } else if (dateRange === "month") {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date();
        } else if (dateRange === "quarter") {
          const quarter = Math.floor(today.getMonth() / 3);
          startDate = new Date(today.getFullYear(), quarter * 3, 1);
          endDate = new Date();
        } else if (dateRange === "year") {
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = new Date();
        }

        // Build query parameters
        const params = new URLSearchParams();
        if (startDate)
          params.append("startDate", startDate.toISOString().split("T")[0]);
        if (endDate)
          params.append("endDate", endDate.toISOString().split("T")[0]);
        if (department !== "all") params.append("department", department);
        params.append("groupBy", groupBy);

        const response = await fetch(
          `/api/report/attendance?${params.toString()}`
        );
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching attendance report:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAttendanceReport();
  }, [dateRange, department, groupBy]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Đang tải dữ liệu...</h2>
          <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  const summary = reportData?.summary || {
    attendanceRate: 95.3,
    punctualityRate: 89.7,
    late: 5.6,
    absent: 4.7,
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Báo Cáo Chấm Công</h1>
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              <SelectItem value="tech">Kỹ thuật</SelectItem>
              <SelectItem value="sales">Kinh doanh</SelectItem>
              <SelectItem value="admin">Hành chính</SelectItem>
              <SelectItem value="hr">Nhân sự</SelectItem>
              <SelectItem value="accounting">Kế toán</SelectItem>
            </SelectContent>
          </Select>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Nhóm theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Theo ngày</SelectItem>
              <SelectItem value="week">Theo tuần</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ đi làm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.attendanceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng số ngày làm việc
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đúng giờ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.punctualityRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tỷ lệ đi làm đúng giờ
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đi muộn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.late.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Tỷ lệ đi làm muộn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vắng mặt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.absent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Tỷ lệ vắng mặt</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê chấm công</CardTitle>
            <CardDescription>Biểu đồ chấm công theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceOverview />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết chấm công</CardTitle>
            <CardDescription>
              Danh sách chi tiết chấm công nhân viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NV</TableHead>
                  <TableHead>Tên nhân viên</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Tổng ngày</TableHead>
                  <TableHead>Đi làm</TableHead>
                  <TableHead>Đúng giờ</TableHead>
                  <TableHead>Đi muộn</TableHead>
                  <TableHead>Vắng mặt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData?.data?.slice(0, 10).map((employee: any) => (
                  <TableRow key={employee.employee.employeeId}>
                    <TableCell>{employee.employee.employeeCode}</TableCell>
                    <TableCell>{employee.employee.name}</TableCell>
                    <TableCell>
                      {employee.employee.workInfo.department || "N/A"}
                    </TableCell>
                    {/* <TableCell>{employee.employee.attendance.total}</TableCell>
                    <TableCell>
                      {employee.employee.attendance.present}
                    </TableCell>
                    <TableCell>{employee.employee.attendance.onTime}</TableCell>
                    <TableCell>{employee.employee.attendance.late}</TableCell>
                    <TableCell>{employee.employee.attendance.absent}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
