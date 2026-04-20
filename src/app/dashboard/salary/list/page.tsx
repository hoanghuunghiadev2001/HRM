/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Select,
  Tag,
  Space,
  Card,
  Typography,
  Input,
  Modal,
  Descriptions,
  Divider,
  Statistic,
  Row,
  Col,
  message,
  Tooltip,
  Spin,
  Badge,
  Avatar,
} from "antd";
import {
  DownloadOutlined,
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const VND = (val: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val,
  );

interface EmployeeSummary {
  employee: {
    id: number;
    employeeCode: string;
    name: string;
    role: string;
    department: string | null;
    departmentAbbr: string | null;
    position: string | null;
    contractType: string | null;
  };
  monthlySummary: {
    month: number;
    year: number;
    type: string;
    totalGross: number;
    totalNet: number;
    actualReceived: number;
    firstReceived: number;
    workingDays: number;
  }[];
  totalAnnualGross: number;
  totalAnnualNet: number;
  salaryDetails?: Record<number, any>; // chỉ admin
}

interface ApiResponse {
  year: number;
  month: number | null;
  isAdmin: boolean;
  total: number;
  data: EmployeeSummary[];
}

export default function SalaryListPage() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    record: EmployeeSummary | null;
  }>({
    open: false,
    record: null,
  });
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ year: String(year) });
      if (month) params.set("month", String(month));
      const res = await fetch(`/api/salary/manager/employees?${params}`);
      if (res.status === 403) {
        message.error("Bạn không có quyền xem trang này");
        return;
      }
      if (!res.ok) throw new Error();
      const json: ApiResponse = await res.json();
      setApiData(json);
    } catch {
      message.error("Không thể tải dữ liệu lương");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ year: String(year) });
      if (month) params.set("month", String(month));
      const res = await fetch(`/api/salary/manager/export?${params}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `luong_${year}${month ? `_thang${month}` : ""}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      message.success("Xuất file thành công");
    } catch {
      message.error("Xuất file thất bại");
    } finally {
      setExporting(false);
    }
  };

  const filtered = (apiData?.data || []).filter(
    (r) =>
      !search ||
      r.employee.name.toLowerCase().includes(search.toLowerCase()) ||
      r.employee.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      (r.employee.department || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  // Tổng toàn bộ
  const totalGrossAll = filtered.reduce((s, r) => s + r.totalAnnualGross, 0);
  const totalNetAll = filtered.reduce((s, r) => s + r.totalAnnualNet, 0);

  const columns = [
    {
      title: "Nhân viên",
      key: "employee",
      width: 240,
      fixed: "left" as const,
      render: (_: any, r: EmployeeSummary) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ background: "#1677ff" }}
          />
          <div>
            <div className="font-semibold text-sm">{r.employee.name}</div>
            <Text type="secondary" className="text-xs">
              {r.employee.employeeCode}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Phòng ban",
      key: "dept",
      width: 140,
      render: (_: any, r: EmployeeSummary) => (
        <Tag color="blue">
          {r.employee.departmentAbbr || r.employee.department || "—"}
        </Tag>
      ),
    },
    {
      title: "Chức vụ",
      dataIndex: ["employee", "position"],
      key: "position",
      width: 150,
      render: (v: string) => <Text className="text-xs">{v || "—"}</Text>,
    },
    // Monthly columns
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({
      title: `T${m}`,
      key: `month_${m}`,
      width: 120,
      render: (_: any, r: EmployeeSummary) => {
        const ms = r.monthlySummary.find((s) => s.month === m);
        if (!ms)
          return (
            <Text type="secondary" className="text-xs">
              —
            </Text>
          );
        const net = (ms.firstReceived || 0) + (ms.actualReceived || 0);
        return (
          <Tooltip
            title={
              <div>
                <div>Lương gộp: {VND(ms.totalGross)}</div>
                <div>Ngày công: {ms.workingDays}</div>
              </div>
            }
          >
            <div className="text-right">
              <div className="text-xs font-medium text-green-700">
                {VND(net)}
              </div>
              <div className="text-xs text-gray-400">{ms.workingDays}nc</div>
            </div>
          </Tooltip>
        );
      },
    })),
    {
      title: "Tổng lương gộp",
      key: "totalGross",
      width: 150,
      fixed: "right" as const,
      render: (_: any, r: EmployeeSummary) => (
        <div className="text-right font-semibold text-blue-700">
          {VND(r.totalAnnualGross)}
        </div>
      ),
      sorter: (a: EmployeeSummary, b: EmployeeSummary) =>
        a.totalAnnualGross - b.totalAnnualGross,
    },
    {
      title: "Tổng thực lãnh",
      key: "totalNet",
      width: 150,
      fixed: "right" as const,
      render: (_: any, r: EmployeeSummary) => (
        <div className="text-right font-semibold text-green-700">
          {VND(r.totalAnnualNet)}
        </div>
      ),
      sorter: (a: EmployeeSummary, b: EmployeeSummary) =>
        a.totalAnnualNet - b.totalAnnualNet,
    },
    {
      title: "",
      key: "action",
      width: 60,
      fixed: "right" as const,
      render: (_: any, r: EmployeeSummary) => (
        <Tooltip title="Xem chi tiết">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setDetailModal({ open: true, record: r })}
          />
        </Tooltip>
      ),
    },
  ];

  const detail = detailModal.record;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <DollarOutlined className="text-white text-lg" />
            </div>
            <div>
              <Title level={4} className="!mb-0">
                Bảng Lương Nhân Viên
              </Title>
              <Text type="secondary" className="text-sm">
                {apiData?.isAdmin
                  ? "Toàn bộ nhân viên (Admin)"
                  : "Nhân viên dưới quyền quản lý của bạn"}
              </Text>
            </div>
          </div>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={exporting}
              type="primary"
              ghost
            >
              Xuất CSV
            </Button>
          </Space>
        </div>

        {/* Summary cards */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="border-blue-100" size="small">
              <Statistic
                title="Tổng nhân viên"
                value={apiData?.total || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="border-purple-100" size="small">
              <Statistic
                title={`Tổng lương gộp (${year})`}
                value={totalGrossAll}
                formatter={(v) => VND(Number(v))}
                prefix={<RiseOutlined />}
                valueStyle={{ color: "#722ed1", fontSize: 14 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="border-green-100" size="small">
              <Statistic
                title={`Tổng thực lãnh (${year})`}
                value={totalNetAll}
                formatter={(v) => VND(Number(v))}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#389e0d", fontSize: 14 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="border-orange-100" size="small">
              <Statistic
                title="Bình quân/người"
                value={filtered.length ? totalNetAll / filtered.length : 0}
                formatter={(v) => VND(Number(v))}
                prefix={<FallOutlined />}
                valueStyle={{ color: "#d46b08", fontSize: 14 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <Input
            placeholder="Tìm nhân viên, mã, phòng ban..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="w-72"
          />
          <Select
            value={year}
            onChange={setYear}
            className="w-28"
            options={[2022, 2023, 2024, 2025, 2026].map((y) => ({
              label: `Năm ${y}`,
              value: y,
            }))}
          />
          <Select
            placeholder="Tất cả tháng"
            allowClear
            value={month}
            onChange={setMonth}
            className="w-36"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <Option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </Option>
            ))}
          </Select>
          <Button onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
          <Badge count={filtered.length} showZero color="#1677ff">
            <span className="text-sm text-gray-500 pl-1">nhân viên</span>
          </Badge>
        </div>

        {/* Table */}
        <Card className="shadow-sm">
          <Spin spinning={loading}>
            <Table
              dataSource={filtered}
              columns={columns}
              rowKey={(r) => r.employee.id}
              scroll={{ x: 2400 }}
              size="small"
              pagination={{
                pageSize: 15,
                showTotal: (t) => `Tổng ${t} nhân viên`,
                showSizeChanger: true,
                pageSizeOptions: ["15", "30", "50"],
              }}
              summary={() => (
                <Table.Summary fixed="bottom">
                  <Table.Summary.Row className="bg-blue-50 font-bold">
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>TỔNG CỘNG ({filtered.length} NV)</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} colSpan={12} />
                    <Table.Summary.Cell index={15}>
                      <div className="text-right font-bold text-blue-700">
                        {VND(totalGrossAll)}
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={16}>
                      <div className="text-right font-bold text-green-700">
                        {VND(totalNetAll)}
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={17} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Spin>
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>
              Chi tiết lương: <strong>{detail?.employee.name}</strong>
            </span>
            <Tag color="blue">{detail?.employee.employeeCode}</Tag>
          </Space>
        }
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={null}
        width={820}
      >
        {detail && (
          <>
            <Descriptions size="small" bordered column={2} className="mb-4">
              <Descriptions.Item label="Phòng ban">
                {detail.employee.department || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Chức vụ">
                {detail.employee.position || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Loại HĐ">
                {detail.employee.contractType || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag
                  color={
                    detail.employee.role === "ADMIN"
                      ? "red"
                      : detail.employee.role === "MANAGER"
                        ? "blue"
                        : "default"
                  }
                >
                  {detail.employee.role}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" orientationMargin={0}>
              <Text strong>Bảng lương năm {year}</Text>
            </Divider>

            <Table
              dataSource={detail.monthlySummary}
              rowKey="month"
              size="small"
              pagination={false}
              columns={[
                {
                  title: "Tháng",
                  dataIndex: "month",
                  render: (m) => `Tháng ${m}`,
                  width: 80,
                },
                {
                  title: "Loại",
                  dataIndex: "type",
                  render: (v) => <Tag>{v}</Tag>,
                  width: 90,
                },
                {
                  title: "Ngày công",
                  dataIndex: "workingDays",
                  width: 90,
                  align: "right" as const,
                },
                {
                  title: "Lương gộp",
                  dataIndex: "totalGross",
                  align: "right" as const,
                  render: (v) => (
                    <span className="text-blue-700">{VND(v)}</span>
                  ),
                },
                ...(apiData?.isAdmin
                  ? [
                      {
                        title: "Lương (2)",
                        dataIndex: "totalNet",
                        align: "right" as const,
                        render: (v: number) => (
                          <span className="text-purple-700">{VND(v)}</span>
                        ),
                      },
                    ]
                  : []),
                {
                  title: "Nhận lần 1",
                  dataIndex: "firstReceived",
                  align: "right" as const,
                  render: (v: number) => VND(v || 0),
                },
                {
                  title: "Thực lãnh",
                  key: "net",
                  align: "right" as const,
                  render: (_: any, r: any) => (
                    <span className="font-semibold text-green-700">
                      {VND((r.firstReceived || 0) + (r.actualReceived || 0))}
                    </span>
                  ),
                },
              ]}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row className="bg-gray-50 font-bold">
                    <Table.Summary.Cell index={0} colSpan={3}>
                      Tổng cả năm
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <div className="text-right text-blue-700 font-bold">
                        {VND(detail.totalAnnualGross)}
                      </div>
                    </Table.Summary.Cell>
                    {apiData?.isAdmin && <Table.Summary.Cell index={4} />}
                    <Table.Summary.Cell index={apiData?.isAdmin ? 5 : 4} />
                    <Table.Summary.Cell index={apiData?.isAdmin ? 6 : 5}>
                      <div className="text-right text-green-700 font-bold">
                        {VND(detail.totalAnnualNet)}
                      </div>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />

            {/* Admin-only: Full salary detail for selected month */}
            {apiData?.isAdmin && detail.salaryDetails && (
              <>
                <Divider orientation="left" orientationMargin={0}>
                  <Text strong className="text-red-600">
                    Chi tiết đầy đủ (Admin only)
                  </Text>
                </Divider>
                <Select
                  placeholder="Chọn tháng xem chi tiết"
                  className="w-full mb-3"
                  onChange={(m) => {
                    const sd = detail.salaryDetails?.[m];
                    // Could expand to show more detail — simplified here
                    if (!sd) message.info("Chưa có dữ liệu tháng này");
                  }}
                >
                  {Object.keys(detail.salaryDetails).map((m) => (
                    <Option key={m} value={Number(m)}>
                      Tháng {m}
                    </Option>
                  ))}
                </Select>
                <Text type="secondary" className="text-xs">
                  Chọn tháng để xem bảng lương chi tiết (tất cả khoản phụ cấp,
                  khấu trừ, thưởng).
                </Text>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
