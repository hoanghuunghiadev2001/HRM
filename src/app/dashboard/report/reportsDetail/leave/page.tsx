"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { LeaveRequestsChart } from "@/components/leave-requests-chart";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

// Định nghĩa các interface cho dữ liệu
interface LeaveRequest {
  id: number;
  employeeId: number;
  employee: {
    employeeCode: string;
    name: string;
    workInfo?: {
      department?: string;
    };
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  status: "approved" | "rejected" | "pending";
}

interface LeaveTypeStats {
  type: string;
  count: number;
  hours: number;
  approved: number;
  rejected: number;
  pending: number;
}

interface LeaveTimePeriodStats {
  period: string;
  total: number;
  hours: number;
  approved: number;
  rejected: number;
  pending: number;
  byType: Record<string, { count: number; hours: number }>;
}

interface LeaveSummary {
  total: number;
  totalHours: number;
  approved: number;
  rejected: number;
  pending: number;
  approvalRate: number;
  byType: Array<{
    type: string;
    count: number;
    hours: number;
    percentage: number;
  }>;
}

interface EmployeeLeave {
  employeeId: number;
  employeeCode: string;
  name: string;
  department?: string;
  position?: string;
  leave: {
    total: number;
    hours: number;
    approved: number;
    byType: Record<string, { count: number; hours: number }>;
  };
}

interface LeaveReportData {
  data: LeaveTypeStats[] | LeaveTimePeriodStats[];
  summary: LeaveSummary;
  employeeDetails: EmployeeLeave[];
}

export default function LeaveReportPage() {
  dayjs.extend(quarterOfYear);
  const [dateRange, setDateRange] = useState("month");
  const [department, setDepartment] = useState("all");
  const [reportData, setReportData] = useState<LeaveReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Danh sách phòng ban
  const departments = useMemo(
    () => [
      { value: "all", label: "Tất cả phòng ban" },
      { value: "tech", label: "Kỹ thuật" },
      { value: "sales", label: "Kinh doanh" },
      { value: "admin", label: "Hành chính" },
      { value: "hr", label: "Nhân sự" },
      { value: "accounting", label: "Kế toán" },
    ],
    []
  );

  // Fetch dữ liệu báo cáo nghỉ phép
  useEffect(() => {
    async function fetchLeaveReport() {
      try {
        setLoading(true);
        setError(null);

        // Tính toán ngày bắt đầu và kết thúc dựa trên dateRange
        const today = new Date();
        let startDate: Date, endDate: Date;

        if (dateRange === "week") {
          // Lấy ngày đầu tuần (thứ 2)
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          startDate = new Date(today.getFullYear(), today.getMonth(), diff);
          endDate = new Date();
        } else if (dateRange === "month") {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date();
        } else if (dateRange === "quarter") {
          const startOfQuarter = dayjs()
            .startOf("quarter")
            .format("YYYY-MM-DD");

          // Kết thúc quý hiện tại
          const endOfQuarter = dayjs().endOf("quarter").format("YYYY-MM-DD");
          startDate = new Date(startOfQuarter);
          endDate = new Date(endOfQuarter);
        } else {
          // year
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = new Date(today.getFullYear(), 11, 31);
        }

        // Xây dựng query parameters
        const params = new URLSearchParams();
        params.append("startDate", startDate.toISOString().split("T")[0]);
        params.append("endDate", endDate.toISOString().split("T")[0]);
        if (department !== "all") {
          params.append("department", department);
        }

        // Gọi API
        const response = await fetch(`/api/report/leave?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Lỗi khi tải dữ liệu: ${response.status}`);
        }

        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching leave report:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi tải dữ liệu"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLeaveReport();
  }, [dateRange, department]);

  // Hàm format ngày tháng
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Hàm lấy tên loại phép
  const getLeaveTypeName = (type: string): string => {
    const typeNames: Record<string, string> = {
      PN: "Phép năm",
      NB: "Nghỉ bù",
      PC: "Phép cưới",
      PT: "Phép tang",
      Cgt: "Công tác",
      PB: "Phép bệnh",
    };
    return typeNames[type] || type;
  };

  // Hàm lấy trạng thái đơn
  const getStatusName = (status: string): string => {
    const statusNames: Record<string, string> = {
      approved: "Đã duyệt",
      rejected: "Từ chối",
      pending: "Chờ duyệt",
    };
    return statusNames[status] || status;
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Đang tải dữ liệu...</h2>
            <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive">
              Đã xảy ra lỗi
            </h2>
            <p className="text-muted-foreground">{error}</p>
            <button
              className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Lấy dữ liệu tổng quan từ API hoặc sử dụng giá trị mặc định
  const summary = reportData?.summary || {
    total: 0,
    totalHours: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    approvalRate: 0,
  };

  // Lấy danh sách chi tiết đơn nghỉ phép
  const leaveDetails = reportData?.employeeDetails || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Báo Cáo Nghỉ Phép</h1>
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
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng đơn nghỉ phép
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalHours} giờ nghỉ phép
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.approved}</div>
            <p className="text-xs text-muted-foreground">
              {summary.total > 0
                ? ((summary.approved / summary.total) * 100).toFixed(1)
                : 0}
              % tổng đơn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Đang chờ duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending}</div>
            <p className="text-xs text-muted-foreground">
              {summary.total > 0
                ? ((summary.pending / summary.total) * 100).toFixed(1)
                : 0}
              % tổng đơn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.rejected}</div>
            <p className="text-xs text-muted-foreground">
              {summary.total > 0
                ? ((summary.rejected / summary.total) * 100).toFixed(1)
                : 0}
              % tổng đơn
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê nghỉ phép theo loại</CardTitle>
            <CardDescription>
              Phân bố đơn nghỉ phép theo từng loại phép
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <LeaveRequestsChart leaveTypeData={reportData?.data ?? []} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đơn nghỉ phép</CardTitle>
            <CardDescription>Danh sách chi tiết đơn nghỉ phép</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NV</TableHead>
                  <TableHead>Tên nhân viên</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Tổng đơn</TableHead>
                  <TableHead>Tổng giờ</TableHead>
                  <TableHead>Đã duyệt</TableHead>
                  <TableHead>Loại phép phổ biến</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveDetails.slice(0, 10).map((employee) => {
                  // Tìm loại phép phổ biến nhất
                  let popularLeaveType = { type: "", count: 0 };
                  Object.entries(employee.leave.byType).forEach(
                    ([type, data]) => {
                      if (data.count > popularLeaveType.count) {
                        popularLeaveType = { type, count: data.count };
                      }
                    }
                  );

                  return (
                    <TableRow key={employee.employeeId}>
                      <TableCell>{employee.employeeCode}</TableCell>
                      <TableCell className="font-medium">
                        {employee.name}
                      </TableCell>
                      <TableCell>{employee.department || "N/A"}</TableCell>
                      <TableCell>{employee.leave.total}</TableCell>
                      <TableCell>{employee.leave.hours}</TableCell>
                      <TableCell>
                        <Badge variant="success">
                          {employee.leave.approved} (
                          {employee.leave.total > 0
                            ? (
                                (employee.leave.approved /
                                  employee.leave.total) *
                                100
                              ).toFixed(0)
                            : 0}
                          %)
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {popularLeaveType.type
                          ? `${getLeaveTypeName(popularLeaveType.type)} (${
                              popularLeaveType.count
                            })`
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {leaveDetails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
