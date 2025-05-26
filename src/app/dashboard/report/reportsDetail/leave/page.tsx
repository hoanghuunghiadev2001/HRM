"use client";

import { useState, useEffect } from "react";

import { LeaveRequestsChart } from "@/components/leave-requests-chart";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { Select, Table, Tag } from "antd";
import "../../../../globals.css";
import {
  DiffOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
} from "@ant-design/icons";
import { createStyles } from "antd-style";

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

const useStyle = createStyles((utils) => {
  const { css, token } = utils;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const antCls = (token as any).antCls || ".ant"; // fallback nếu token.antCls không tồn tại

  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

export default function LeaveReportPage() {
  dayjs.extend(quarterOfYear);
  const [dateRange, setDateRange] = useState("month");
  const [department, setDepartment] = useState("all");
  const [reportData, setReportData] = useState<LeaveReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { styles } = useStyle();

  // Danh sách phòng ban
  const dateRangeSelect = [
    { value: "week", label: "Tuần này" },
    { value: "month", label: "Tháng này" },
    { value: "quarter", label: "Quý này" },
    { value: "year", label: "Năm này" },
  ];

  const departments = [
    { value: "KD", label: "KD" },
    { value: "SCC", label: "SCC" },
    { value: "ĐS", label: "ĐS" },
    { value: "HC", label: "HC" },
    { value: "CV", label: "CV" },
    { value: "PT", label: "PT" },
    { value: "KT", label: "KT" },
    { value: "IT", label: "IT" },
    { value: "CS", label: "CS" },
  ];

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

  const dataSource: DataType[] = leaveDetails.slice(0, 10).map((emp) => {
    // Tìm loại phép phổ biến
    let popularType = { type: "", count: 0 };
    Object.entries(emp.leave.byType).forEach(([type, data]) => {
      if (data.count > popularType.count) {
        popularType = { type, count: data.count };
      }
    });

    return {
      id: emp.employeeId,
      employeeCode: emp.employeeCode,
      name: emp.name,
      department: emp.department || "N/A",
      totalRequests: emp.leave.total,
      totalHours: emp.leave.hours,
      totalApproved: emp.leave.approved,
      approvalRate:
        emp.leave.total > 0
          ? `${((emp.leave.approved / emp.leave.total) * 100).toFixed(0)}%`
          : "0%",
      popularType: popularType.type
        ? `${getLeaveTypeName(popularType.type)} (${popularType.count})`
        : "N/A",
    };
  });

  interface DataType {
    id: number;
    employeeCode: string;
    name: string;
    department: string;
    totalRequests: number;
    totalHours: number;
    totalApproved: number;
    approvalRate: string;
    popularType: string;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Báo Cáo Nghỉ Phép</h1>
        <div className="flex gap-4">
          <Select
            onChange={(e) => setDateRange(e)}
            style={{ width: "100px" }}
            placeholder={"Thời gian"}
            allowClear
            options={dateRangeSelect}
          />
          <Select
            onChange={(e) => setDepartment(e)}
            style={{ width: "100px" }}
            placeholder={"Bộ phận"}
            allowClear
            options={departments}
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 shadow-card-report p-6 rounded-2xl">
        <div className="rounded-2xl bg-gradient-to-r from-[#2c00cc] to-[#9076ec] p-4">
          <p className="text-white text-lg font-bold">Tổng đơn nghỉ phép</p>

          <div className="flex justify-between">
            <div>
              <p className="text-white !text-[30px] font-bold">
                {summary.total}
              </p>
              <p className="text-base text-white font-semibold">
                {summary.totalHours} giờ
              </p>
            </div>
            <FileTextOutlined className="!text-white !text-[50px] " />
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-r from-[#cc8b00] to-[#ecc776] p-4">
          <p className="text-white text-lg font-bold">Đã duyệt</p>

          <div className="flex justify-between">
            <div>
              <p className="text-white !text-[30px] font-bold">
                {summary.approved}
              </p>
              <p className="text-base text-white font-semibold">
                {summary.total > 0
                  ? ((summary.approved / summary.total) * 100).toFixed(1)
                  : 0}
                % tổng đơn
              </p>
            </div>
            <FileProtectOutlined className="!text-white !text-[50px] " />
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-r from-[#0069cc] to-[#76a5ec] p-4">
          <p className="text-white text-lg font-bold">Đang chờ duyệt</p>
          <div className="flex justify-between">
            <div>
              <p className="text-white !text-[30px] font-bold">
                {summary.pending}
              </p>
              <p className="text-base text-white font-semibold">
                {summary.total > 0
                  ? ((summary.pending / summary.total) * 100).toFixed(1)
                  : 0}
                % tổng đơn
              </p>
            </div>
            <FileUnknownOutlined className="!text-white !text-[50px] " />
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-r from-[#07cc00] to-[#7aec76] p-4">
          <p className="text-white text-lg font-bold">Từ chối</p>

          <div className="flex justify-between">
            <div>
              <p className="text-white !text-[30px] font-bold">
                {summary.rejected}
              </p>
              <p className="text-base text-white font-semibold">
                {summary.total > 0
                  ? ((summary.rejected / summary.total) * 100).toFixed(1)
                  : 0}
                % tổng đơn
              </p>
            </div>
            <DiffOutlined className="!text-white !text-[50px] " />
          </div>
        </div>
      </div>

      <div className="mt-6 shadow-card-report p-6 rounded-2xl">
        <p className="text-2xl font-bold">Thống kê nghỉ phéo theo loại</p>
        <LeaveRequestsChart leaveTypeData={reportData?.data ?? []} />
      </div>

      <div className="mt-6 shadow-card-report p-6 rounded-2xl">
        <p className="text-2xl font-bold">Chi tiết đơn nghỉ phép</p>

        <Table<DataType>
          dataSource={dataSource}
          columns={[
            {
              title: "Mã NV",
              dataIndex: "employeeCode",
              key: "employeeCode",
              width: "80px",
            },
            {
              title: "Tên nhân viên",
              dataIndex: "name",
              key: "name",
              width: "120px",
              render: (text) => <strong>{text}</strong>,
            },
            {
              title: "Phòng ban",
              dataIndex: "department",
              key: "department",
              width: "80px",
            },
            {
              title: "Tổng đơn",
              dataIndex: "totalRequests",
              key: "totalRequests",
              width: "80px",
            },
            {
              title: "Tổng giờ",
              dataIndex: "totalHours",
              key: "totalHours",
              width: "80px",
            },
            {
              title: "Đã duyệt",
              dataIndex: "approved",
              key: "approved",
              width: "80px",
              render: (approved: number, record) => (
                <Tag color="green">
                  {record.totalApproved} (
                  {Number(
                    (record.totalApproved / record.totalRequests) * 100
                  ).toFixed(0)}
                  %)
                </Tag>
              ),
            },
            {
              title: "Loại phép phổ biến",
              dataIndex: "popularType",
              key: "popularType",
              width: "120px",
            },
          ]}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: "Không có dữ liệu",
          }}
          className={styles.customTable}
          // columns={columns}
          // dataSource={formatted ?? []}
          // pagination={{ pageSize: 12 }}
          scroll={{ y: "calc(100vh - 305px)" }}
        />
        {/* <Table>
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
              Object.entries(employee.leave.byType).forEach(([type, data]) => {
                if (data.count > popularLeaveType.count) {
                  popularLeaveType = { type, count: data.count };
                }
              });

              return (
                <TableRow key={employee.employeeId}>
                  <TableCell>{employee.employeeCode}</TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.department || "N/A"}</TableCell>
                  <TableCell>{employee.leave.total}</TableCell>
                  <TableCell>{employee.leave.hours}</TableCell>
                  <TableCell>
                    <Badge variant="success">
                      {employee.leave.approved} (
                      {employee.leave.total > 0
                        ? (
                            (employee.leave.approved / employee.leave.total) *
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
        </Table> */}
      </div>
    </div>
  );
}
