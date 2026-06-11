"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  DatePicker,
  Button,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  Tooltip,
  Empty,
  message,
  ConfigProvider,
  Select,
} from "antd";
import {
  DownloadOutlined,
  SearchOutlined,
  CarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import "dayjs/locale/vi";
import locale from "antd/locale/vi_VN";
import dayjs, { Dayjs } from "dayjs";
import { exportSecureGrabPDF } from "@/lib/exportPDFGSM";
import type { ReportData, Proposal } from "@/lib/exportPDFGSM";

dayjs.locale("vi");
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ─── Status map ───────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  approved: { label: "Đã duyệt", color: "success" },
  rejected: { label: "Từ chối", color: "error" },
  pending_signatures: { label: "Chờ ký", color: "warning" },
  waiting_approval: { label: "Chờ duyệt", color: "processing" },
};

function fmtMoney(val: number | null | undefined): string {
  if (!val) return "—";
  return val.toLocaleString("vi-VN") + " đ";
}

function fmtDt(
  val: string | null | undefined,
  fmt = "DD/MM/YYYY HH:mm",
): string {
  return val ? dayjs(val).format(fmt) : "—";
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GSMReportPage() {
  // Mặc định khoảng ngày: 23 tháng trước -> 22 tháng này dựa theo chu kỳ lương
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(1, "month").date(23),
    dayjs().date(22),
  ]);
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchReport = useCallback(
    async (range: [Dayjs | null, Dayjs | null], dept: string) => {
      const [start, end] = range;
      if (!start || !end)
        return message.warning("Vui lòng chọn đầy đủ khoảng ngày lọc");

      setLoading(true);
      try {
        const fromDateStr = start.format("YYYY-MM-DD");
        const toDateStr = end.format("YYYY-MM-DD");

        // Chuyển API endpoint nhận tham số lọc theo ngày (đảm bảo Backend route khớp tên query này)
        const res = await fetch(
          `/api/proposals/grab-report?fromDate=${fromDateStr}&toDate=${toDateStr}&dept=${dept}`,
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Lỗi tải dữ liệu");

        setReportData(json as ReportData);
      } catch (e: any) {
        message.error(e.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Auto-load khoảng ngày mặc định khi mount ứng dụng
  useEffect(() => {
    const defaultRange: [Dayjs, Dayjs] = [
      dayjs().subtract(1, "month").date(23),
      dayjs().date(22),
    ];
    fetchReport(defaultRange, "ALL");
  }, [fetchReport]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = () => fetchReport(dateRange, selectedDept);

  const handleDeptChange = (val: string) => {
    setSelectedDept(val);
    fetchReport(dateRange, val);
  };

  const handleExport = async () => {
    if (!reportData || !dateRange[0] || !dateRange[1]) return;
    setExporting(true);
    try {
      // Đính kèm trực tiếp dateFrom và dateTo vào object trước khi truyền qua hàm in PDF bảo mật
      await exportSecureGrabPDF({
        ...reportData,
        dateFrom: dateRange[0].format("YYYY-MM-DD"),
        dateTo: dateRange[1].format("YYYY-MM-DD"),
      });
      message.success("Xuất PDF thành công!");
    } catch (e: any) {
      message.error("Lỗi xuất PDF: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 50,
      align: "center" as const,
      render: (_: any, __: Proposal, idx: number) => idx + 1,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (v: string) => fmtDt(v),
    },
    {
      title: "Người đặt",
      key: "proposer",
      width: 160,
      render: (_: any, r: Proposal) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.proposer.name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {r.proposer.employeeCode}
          </Text>
          {r.proposer.department && (
            <Tag
              color="blue"
              style={{
                fontSize: 10,
                margin: 0,
                marginTop: 2,
                lineHeight: "16px",
              }}
            >
              {r.proposer.department.abbreviation}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "KH / Mô tả",
      key: "desc",
      width: 180,
      render: (_: any, r: Proposal) => (
        <Space direction="vertical" size={0}>
          {r.customerName && <Text strong>{r.customerName}</Text>}
          {r.description && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {r.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Số RO",
      dataIndex: "roNumber",
      key: "roNumber",
      width: 110,
      render: (v: string) =>
        v ? (
          <Text copyable style={{ color: "#1677ff", fontWeight: 600 }}>
            {v}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Điểm đón → Trả",
      key: "route",
      width: 180,
      render: (_: any, r: Proposal) => (
        <Space direction="vertical" size={0}>
          {r.pickupPlace && (
            <Space size={3}>
              <EnvironmentOutlined style={{ color: "#52c41a", fontSize: 11 }} />
              <Text style={{ fontSize: 11 }}>{r.pickupPlace}</Text>
            </Space>
          )}
          {r.dropoffPlace && (
            <Space size={3}>
              <EnvironmentOutlined style={{ color: "#ff4d4f", fontSize: 11 }} />
              <Text style={{ fontSize: 11 }}>{r.dropoffPlace}</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: "Tiền trên app",
      dataIndex: "vehicleAmount",
      key: "vehicleAmount",
      align: "right" as const,
      width: 115,
      render: (v: number) => (
        <Text style={{ color: "#1677ff" }}>{fmtMoney(v)}</Text>
      ),
    },
    {
      title: "Tiền trên RO",
      dataIndex: "roAmount",
      key: "roAmount",
      align: "right" as const,
      width: 115,
      render: (v: number) => (
        <Text strong style={{ color: "#389e0d" }}>
          {fmtMoney(v)}
        </Text>
      ),
    },
    {
      title: "Người ký",
      key: "signers",
      width: 150,
      render: (_: any, r: Proposal) => {
        const approved = r.signers.filter((s) => s.status === "approved");
        if (!approved.length) return <Text type="secondary">Chưa ký</Text>;
        return (
          <Space direction="vertical" size={2}>
            {approved.map((s) => (
              <Space key={s.id} size={3}>
                <UserOutlined style={{ fontSize: 10, color: "#52c41a" }} />
                <Text style={{ fontSize: 11 }}>
                  {s.signer.name}
                  {s.signedAt && (
                    <Text type="secondary" style={{ fontSize: 10 }}>
                      {" "}
                      ({fmtDt(s.signedAt, "DD/MM HH:mm")})
                    </Text>
                  )}
                </Text>
              </Space>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center" as const,
      render: (v: string) => {
        const s = STATUS_MAP[v] ?? { label: v, color: "default" };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
  ];

  // ── Breakdown dept columns ─────────────────────────────────────────────────
  const deptColumns = [
    {
      title: "Bộ phận",
      dataIndex: "name",
      key: "name",
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: "Số phiếu",
      dataIndex: "count",
      key: "count",
      align: "center" as const,
      width: 90,
      render: (v: number) => (
        <Tag color="blue" style={{ fontWeight: 700 }}>
          {v} phiếu
        </Tag>
      ),
    },
    {
      title: "Tiền trên app",
      dataIndex: "vehicleAmount",
      key: "vehicleAmount",
      align: "right" as const,
      width: 160,
      render: (v: number) => (
        <Text style={{ color: "#1565c0", fontWeight: 600 }}>{fmtMoney(v)}</Text>
      ),
    },
    {
      title: "Tiền trên RO",
      dataIndex: "roAmount",
      key: "roAmount",
      align: "right" as const,
      width: 160,
      render: (v: number) => (
        <Text strong style={{ color: "#2e7d32" }}>
          {fmtMoney(v)}
        </Text>
      ),
    },
  ];

  const deptBreakdownRows = reportData?.deptBreakdown
    ? Object.entries(reportData.deptBreakdown)
        .map(([key, d]) => ({ key, ...d }))
        .sort((a, b) => a.name.localeCompare(b.name, "vi"))
    : [];

  // ── Dept select options ────────────────────────────────────────────────────
  const deptOptions = [
    { value: "ALL", label: "Tất cả bộ phận" },
    ...(reportData?.departments ?? []).map((d) => ({
      value: String(d.id),
      label: d.name,
    })),
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <ConfigProvider locale={locale} componentSize="small">
      <div style={{ padding: 16, background: "#f0f2f5", minHeight: "100vh" }}>
        {/* ── Toolbar ── */}
        <Card
          bordered={false}
          style={{
            borderRadius: 8,
            marginBottom: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,.08)",
          }}
        >
          <Row gutter={[12, 8]} align="middle">
            <Col xs={24} md={8}>
              <Space align="center">
                <div
                  style={{
                    background: "#C62828",
                    borderRadius: 6,
                    padding: "4px 8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <CarOutlined style={{ color: "#fff", fontSize: 15 }} />
                  <span
                    style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}
                  >
                    GSM
                  </span>
                </div>
                <Title level={5} style={{ margin: 0 }}>
                  Báo Cáo Đặt Xe GSM
                </Title>
                <Tag color="green" style={{ margin: 0 }}>
                  Chỉ hiện phiếu đã duyệt
                </Tag>
              </Space>
            </Col>

            <Col xs={24} md={16} style={{ textAlign: "right" }}>
              <Space wrap>
                {/* Thay thế Bộ chọn tháng thành bộ chọn RangePicker từ ngày -> đến ngày */}
                <RangePicker
                  value={dateRange}
                  onChange={(val) =>
                    setDateRange(val ? [val[0], val[1]] : [null, null])
                  }
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  allowClear={false}
                  style={{ width: 230 }}
                />

                {/* Chọn bộ phận */}
                <Select
                  style={{ width: 180 }}
                  value={selectedDept}
                  onChange={handleDeptChange}
                  loading={loading}
                  suffixIcon={<ApartmentOutlined />}
                  options={deptOptions}
                  placeholder="Chọn bộ phận"
                />

                {/* Xem báo cáo */}
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={loading}
                  style={{ background: "#C62828", borderColor: "#C62828" }}
                >
                  Xem báo cáo
                </Button>

                {/* Xuất PDF */}
                <Tooltip title={!reportData ? "Tải dữ liệu trước" : ""}>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                    loading={exporting}
                    disabled={!reportData || reportData.total === 0}
                  >
                    Xuất PDF
                  </Button>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* ── KPI cards ── */}
        {reportData && (
          <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
            {[
              {
                title:
                  selectedDept === "ALL"
                    ? "Tổng phiếu đã duyệt"
                    : "Phiếu đã duyệt (bộ phận)",
                value: reportData.total,
                color: "#1677ff",
                suffix: "phiếu",
              },
              {
                title: "Có tiền trên app",
                value: reportData.proposals.filter((p) => p.roAmount).length,
                color: "#52c41a",
                suffix: "phiếu",
              },
              {
                title: "Tổng tiền trên app",
                value: reportData.totalVehicleAmount,
                color: "#1677ff",
                suffix: "₫",
                formatter: (v: any) => Number(v).toLocaleString("vi-VN"),
              },
              {
                title: "Tổng tiền trên RO",
                value: reportData.totalRoAmount,
                color: "#389e0d",
                suffix: "₫",
                formatter: (v: any) => Number(v).toLocaleString("vi-VN"),
              },
            ].map((k, i) => (
              <Col xs={12} sm={6} key={i}>
                <Card
                  bordered
                  size="small"
                  style={{ borderRadius: 8, borderColor: "#f0f0f0" }}
                  bodyStyle={{ padding: "12px 14px" }}
                >
                  <Statistic
                    title={
                      <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                        {k.title}
                      </span>
                    }
                    value={k.value}
                    suffix={k.suffix}
                    formatter={k.formatter}
                    valueStyle={{
                      color: k.color,
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* ── Bảng tổng hợp bộ phận (chỉ hiện khi xem ALL) ── */}
        {reportData &&
          selectedDept === "ALL" &&
          deptBreakdownRows.length > 0 && (
            <Card
              bordered={false}
              style={{
                borderRadius: 8,
                marginBottom: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              }}
              title={
                <Space>
                  <ApartmentOutlined style={{ color: "#C62828" }} />
                  <Text strong style={{ fontSize: 13 }}>
                    Tổng hợp theo bộ phận
                  </Text>
                </Space>
              }
              size="small"
            >
              <Table
                size="small"
                dataSource={deptBreakdownRows}
                columns={deptColumns}
                pagination={false}
                bordered
                summary={(rows) => {
                  const totalCount = rows.reduce((s, r) => s + r.count, 0);
                  const totalVeh = rows.reduce(
                    (s, r) => s + r.vehicleAmount,
                    0,
                  );
                  const totalRo = rows.reduce((s, r) => s + r.roAmount, 0);
                  return (
                    <Table.Summary.Row style={{ background: "#fff3e0" }}>
                      <Table.Summary.Cell index={0}>
                        <Text strong>Tổng cộng</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="center">
                        <Text strong style={{ color: "#1677ff" }}>
                          {totalCount} phiếu
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <Text strong style={{ color: "#1565c0" }}>
                          {fmtMoney(totalVeh)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <Text strong style={{ color: "#2e7d32" }}>
                          {fmtMoney(totalRo)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </Card>
          )}

        {/* ── Bảng proposals ── */}
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            loading={loading}
            dataSource={reportData?.proposals ?? []}
            columns={columns}
            rowKey="id"
            size="small"
            bordered
            scroll={{ x: 1400, y: "calc(100vh - 380px)" }}
            pagination={{
              pageSize: 50,
              showSizeChanger: true,
              pageSizeOptions: ["20", "50", "100"],
              showTotal: (t) =>
                `Tổng: ${t} phiếu đã duyệt${
                  selectedDept !== "ALL"
                    ? ` · Bộ phận: ${
                        reportData?.departments.find(
                          (d) => String(d.id) === selectedDept,
                        )?.name ?? selectedDept
                      }`
                    : ""
                }`,
              size: "small",
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    reportData
                      ? "Không có phiếu đã duyệt nào trong khoảng thời gian / bộ phận này"
                      : "Đang tải..."
                  }
                />
              ),
            }}
          />
        </Card>
      </div>
    </ConfigProvider>
  );
}
