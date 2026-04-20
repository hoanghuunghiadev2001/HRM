/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  DownloadOutlined,
  EyeOutlined,
  LockOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const VND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v ?? 0,
  );

interface MonthSummary {
  month: number;
  year: number;
  type: string;
  workingDays: number;
  totalGross: number;
  totalNet: number;
  firstReceived: number;
  actualReceived: number;
}

interface SalaryRow {
  employee: {
    id: number;
    employeeCode: string;
    name: string;
    department: string | null;
    departmentAbbr: string | null;
    position: string | null;
    contractType: string | null;
  };
  monthlySummary: MonthSummary[];
  totalAnnualGross: number;
  totalAnnualNet: number;
  salaryDetails?: Record<number, any>;
}

interface ApiResp {
  year: number;
  month: number | null;
  isAdmin: boolean;
  total: number;
  data: SalaryRow[];
}

export default function SalaryViewPage() {
  const [resp, setResp] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<SalaryRow | null>(null);
  const [detailMonth, setDetailMonth] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ year: String(year) });
      if (month) p.set("month", String(month));
      const res = await fetch(`/api/salary/view?${p}`);
      if (res.status === 403) {
        message.error("Bạn không có quyền xem trang này");
        return;
      }
      if (!res.ok) throw new Error();
      setResp(await res.json());
    } catch {
      message.error("Không thể tải dữ liệu");
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
      const p = new URLSearchParams({ year: String(year) });
      if (month) p.set("month", String(month));
      const res = await fetch(`/api/salary/view/export?${p}`);
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `luong_${year}${month ? `_t${month}` : ""}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      message.success("Xuất thành công");
    } catch {
      message.error("Xuất thất bại");
    } finally {
      setExporting(false);
    }
  };

  const rows = (resp?.data ?? []).filter(
    (r) =>
      !search ||
      r.employee.name.toLowerCase().includes(search.toLowerCase()) ||
      r.employee.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      (r.employee.department ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const totalGross = rows.reduce((s, r) => s + r.totalAnnualGross, 0);
  const totalNet = rows.reduce((s, r) => s + r.totalAnnualNet, 0);

  const monthCols = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
    title: `T${m}`,
    key: `m${m}`,
    width: 118,
    render: (_: any, r: SalaryRow) => {
      const ms = r.monthlySummary.find((s) => s.month === m);
      if (!ms)
        return (
          <Text type="secondary" className="text-xs">
            —
          </Text>
        );
      const net = (ms.firstReceived ?? 0) + (ms.actualReceived ?? 0);
      return (
        <Tooltip
          title={
            <>
              Gộp: {VND(ms.totalGross)}
              <br />
              Công: {ms.workingDays}nc
            </>
          }
        >
          <div className="text-right cursor-default">
            <div className="text-xs font-semibold text-green-700">
              {VND(net)}
            </div>
            <div className="text-xs text-gray-400">{ms.workingDays}nc</div>
          </div>
        </Tooltip>
      );
    },
  }));

  const columns = [
    {
      title: "Nhân viên",
      key: "emp",
      width: 220,
      fixed: "left" as const,
      render: (_: any, r: SalaryRow) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ background: "#6366f1" }}
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
      width: 120,
      render: (_: any, r: SalaryRow) => (
        <Tag color="blue">
          {r.employee.departmentAbbr ?? r.employee.department ?? "—"}
        </Tag>
      ),
    },
    {
      title: "Chức vụ",
      key: "pos",
      width: 140,
      render: (_: any, r: SalaryRow) => (
        <Text className="text-xs">{r.employee.position ?? "—"}</Text>
      ),
    },
    ...monthCols,
    {
      title: "Tổng gộp",
      key: "gross",
      width: 145,
      fixed: "right" as const,
      sorter: (a: SalaryRow, b: SalaryRow) =>
        a.totalAnnualGross - b.totalAnnualGross,
      render: (_: any, r: SalaryRow) => (
        <div className="text-right font-semibold text-blue-700 text-xs">
          {VND(r.totalAnnualGross)}
        </div>
      ),
    },
    {
      title: "Tổng thực lãnh",
      key: "net",
      width: 145,
      fixed: "right" as const,
      sorter: (a: SalaryRow, b: SalaryRow) =>
        a.totalAnnualNet - b.totalAnnualNet,
      render: (_: any, r: SalaryRow) => (
        <div className="text-right font-semibold text-green-700 text-xs">
          {VND(r.totalAnnualNet)}
        </div>
      ),
    },
    {
      title: "",
      key: "act",
      width: 48,
      fixed: "right" as const,
      render: (_: any, r: SalaryRow) => (
        <Tooltip title="Chi tiết">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setDetail(r);
              setDetailMonth(null);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  // Chi tiết tháng (admin)
  const detailMonthData = detail?.salaryDetails?.[detailMonth!];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <DollarOutlined className="text-white text-lg" />
            </div>
            <div>
              <Title level={4} className="!mb-0">
                Bảng lương nhân viên
              </Title>
              <Text type="secondary" className="text-sm">
                {resp?.isAdmin
                  ? "Toàn bộ · Admin view"
                  : "Chỉ hiển thị những nhân viên bạn được cấp quyền xem"}
              </Text>
            </div>
          </div>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
            type="primary"
            ghost
          >
            Xuất CSV
          </Button>
        </div>

        {/* Permission notice */}
        {resp && !resp.isAdmin && (
          <Card size="small" className="mb-4 border-indigo-200 bg-indigo-50">
            <Space>
              <LockOutlined className="text-indigo-500" />
              <Text className="text-indigo-700 text-sm">
                Bạn đang xem với quyền được cấp — không phụ thuộc vào role hệ
                thống. Để thay đổi quyền, liên hệ Admin.
              </Text>
            </Space>
          </Card>
        )}

        {/* Stats */}
        <Row gutter={16} className="mb-6">
          {[
            {
              title: "Nhân viên hiển thị",
              value: rows.length,
              color: "#6366f1",
              prefix: <UserOutlined />,
            },
            {
              title: `Tổng lương gộp ${year}`,
              value: totalGross,
              format: true,
              color: "#7c3aed",
              prefix: <CalendarOutlined />,
            },
            {
              title: `Tổng thực lãnh ${year}`,
              value: totalNet,
              format: true,
              color: "#059669",
              prefix: <DollarOutlined />,
            },
            {
              title: "Bình quân/người",
              value: rows.length ? totalNet / rows.length : 0,
              format: true,
              color: "#d97706",
              prefix: <DollarOutlined />,
            },
          ].map((s, i) => (
            <Col span={6} key={i}>
              <Card size="small">
                <Statistic
                  title={s.title}
                  value={s.value}
                  formatter={s.format ? (v) => VND(Number(v)) : undefined}
                  prefix={s.prefix}
                  valueStyle={{ color: s.color, fontSize: 14 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <div className="flex gap-3 mb-4 items-center">
          <Input
            placeholder="Tìm nhân viên, phòng ban..."
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
            options={[2023, 2024, 2025, 2026].map((y) => ({
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
          <Badge count={rows.length} showZero color="#6366f1" />
        </div>

        {/* Table */}
        <Card className="shadow-sm">
          <Spin spinning={loading}>
            <Table
              dataSource={rows}
              columns={columns}
              rowKey={(r) => r.employee.id}
              scroll={{ x: 2400 }}
              size="small"
              pagination={{
                pageSize: 15,
                showSizeChanger: true,
                showTotal: (t) => `${t} nhân viên`,
              }}
              summary={() => (
                <Table.Summary fixed="bottom">
                  <Table.Summary.Row className="bg-indigo-50 font-bold">
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>TỔNG ({rows.length} NV)</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} colSpan={12} />
                    <Table.Summary.Cell index={15}>
                      <div className="text-right text-blue-700 font-bold text-xs">
                        {VND(totalGross)}
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={16}>
                      <div className="text-right text-green-700 font-bold text-xs">
                        {VND(totalNet)}
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
              Chi tiết: <strong>{detail?.employee.name}</strong>
            </span>
            <Tag>{detail?.employee.employeeCode}</Tag>
          </Space>
        }
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={860}
        destroyOnClose
      >
        {detail && (
          <>
            <Descriptions size="small" bordered column={2} className="mb-4">
              <Descriptions.Item label="Phòng ban">
                {detail.employee.department ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Chức vụ">
                {detail.employee.position ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Loại HĐ">
                {detail.employee.contractType ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng thực lãnh năm">
                <span className="font-bold text-green-700">
                  {VND(detail.totalAnnualNet)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" orientationMargin={0}>
              <Text strong>Tổng hợp theo tháng</Text>
            </Divider>
            <Table
              dataSource={detail.monthlySummary}
              rowKey="month"
              size="small"
              pagination={false}
              onRow={(r) => ({
                logger: "info",
                onClick: () => {
                  setDetailMonth(r.month);
                },
                style: { cursor: detail.salaryDetails ? "pointer" : "default" },
              })}
              rowClassName={(r) =>
                r.month === detailMonth ? "bg-indigo-50" : ""
              }
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
                  width: 80,
                },
                {
                  title: "Ngày công",
                  dataIndex: "workingDays",
                  align: "right" as const,
                  width: 90,
                },
                {
                  title: "Lương gộp",
                  dataIndex: "totalGross",
                  align: "right" as const,
                  render: (v) => (
                    <span className="text-blue-700">{VND(v)}</span>
                  ),
                },
                ...(resp?.isAdmin
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
                  render: (v: number) => VND(v ?? 0),
                },
                {
                  title: "Thực lãnh",
                  key: "net",
                  align: "right" as const,
                  render: (_: any, r: MonthSummary) => (
                    <span className="font-bold text-green-700">
                      {VND((r.firstReceived ?? 0) + (r.actualReceived ?? 0))}
                    </span>
                  ),
                },
              ]}
            />

            {/* Admin-only detail block */}
            {detail.salaryDetails && (
              <>
                <Divider orientation="left" orientationMargin={0}>
                  <Text strong className="text-red-500">
                    Chi tiết đầy đủ (Admin)
                  </Text>
                  <Text type="secondary" className="text-xs ml-2">
                    — bấm vào hàng tháng phía trên để chọn
                  </Text>
                </Divider>
                {detailMonth && detailMonthData ? (
                  <div className="grid grid-cols-2 gap-x-6">
                    {[
                      ["Lương BHXH+PC", "baseSalary"],
                      ["Lương hiệu quả", "efficiencySalary"],
                      ["Lương 70%", "salary70"],
                      ["PC điện thoại", "phoneAllowance"],
                      ["PC thâm niên", "seniorityAllowance"],
                      ["PC bữa ăn", "mealAllowance"],
                      ["PC thai sản", "maternityAllowance"],
                      ["PC nhà ở", "houseAllowance"],
                      ["Năng suất", "productivitySalary"],
                      ["Năng suất khác", "productivityOther"],
                      ["Thưởng ngày 10", "bonusDay10"],
                      ["Thưởng ngày 25", "bonusDay25"],
                      ["Thưởng", "bonus"],
                      ["OT", "overtime"],
                      ["Thu nhập khác", "otherIncome"],
                      ["Bù lương", "salaryAdjust"],
                    ].map(([label, key]) => (
                      <div
                        key={key}
                        className="flex justify-between py-1 border-b border-gray-100 text-sm"
                      >
                        <Text type="secondary">{label}</Text>
                        <span>{VND(detailMonthData[key] ?? 0)}</span>
                      </div>
                    ))}
                    <div className="col-span-2 mt-2">
                      <Divider className="!my-2">
                        <Text type="danger" className="text-xs">
                          Khấu trừ
                        </Text>
                      </Divider>
                    </div>
                    {[
                      ["BHXH-YT 9.5%", "insuranceDeduction"],
                      ["BHTN 1%", "unemploymentInsu"],
                      ["Công đoàn", "unionFee"],
                      ["Tạm ứng", "advancePayment"],
                      ["Thuế TNCN", "taxTNCN"],
                      ["PC điện thoại trừ", "phoneDeduction"],
                      ["Trừ lương cuối", "salaryDeductionFinal"],
                    ].map(([label, key]) => (
                      <div
                        key={key}
                        className="flex justify-between py-1 border-b border-red-50 text-sm"
                      >
                        <Text type="danger">{label}</Text>
                        <span className="text-red-600">
                          -{VND(detailMonthData[key] ?? 0)}
                        </span>
                      </div>
                    ))}
                    <div className="col-span-2 mt-3 p-3 bg-green-50 rounded-lg flex justify-between">
                      <Text strong>Thực lãnh tháng {detailMonth}</Text>
                      <span className="font-bold text-green-700 text-base">
                        {VND(
                          (detailMonthData.firstReceived ?? 0) +
                            (detailMonthData.actualReceived ?? 0),
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Text type="secondary" className="text-sm">
                    Bấm vào một dòng tháng ở bảng trên để xem chi tiết.
                  </Text>
                )}
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
