"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(main)/proposals/GSM-report/page.tsx

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
} from "antd";
import {
  DownloadOutlined,
  SearchOutlined,
  CarOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "dayjs/locale/vi";
import locale from "antd/locale/vi_VN";
import dayjs, { Dayjs } from "dayjs";
import QRCode from "qrcode";
// ✅ Import từ lib — không tự định nghĩa makeDocHash ở đây nữa
import { makeDocId, makeDocHash, APP_BASE_URL } from "@/lib/grab-report-utils";
import { ROBOTO_BOLD_B64, ROBOTO_REGULAR_B64 } from "@/lib/var";
import { exportSecureGrabPDF } from "@/lib/exportPDFGSM";

dayjs.locale("vi");
const { Title, Text } = Typography;

// ─── Font base64 (Roboto — hỗ trợ tiếng Việt đầy đủ) ────────────────────────
// Nhúng thẳng vào source để tránh phụ thuộc file tĩnh khi build

// ─── Types ────────────────────────────────────────────────────────────────────
interface Signer {
  id: number;
  signerId: number;
  status: string;
  signedAt: string | null;
  level: number;
  signer: { id: number; name: string };
}
interface Proposal {
  id: number;
  name: string;
  title: string;
  description: string | null;
  status: string;
  customerName: string | null;
  roNumber: string | null;
  vehicleAmount: number | null;
  roAmount: number | null;
  vehicleKm: number | null;
  pickupPlace: string | null;
  dropoffPlace: string | null;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  proposer: { id: number; name: string; employeeCode: string };
  vehicle: { id: number; name: string; plateNumber: string | null } | null;
  signers: Signer[];
}
interface ReportData {
  month: number;
  year: number;
  total: number;
  approvedCount: number;
  totalVehicleAmount: number;
  totalRoAmount: number;
  proposals: Proposal[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  approved: { label: "Đã duyệt", color: "success" },
  rejected: { label: "Từ chối", color: "error" },
  pending_signatures: { label: "Chờ ký", color: "warning" },
  waiting_approval: { label: "Chờ duyệt", color: "processing" },
};
const STATUS_LABEL: Record<string, string> = {
  approved: "Đã duyệt",
  rejected: "Từ chối",
  pending_signatures: "Chờ ký",
  waiting_approval: "Chờ duyệt",
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
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchReport = useCallback(async (month: Dayjs | null) => {
    if (!month) return message.warning("Vui lòng chọn tháng");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/proposals/grab-report?month=${month.month() + 1}&year=${month.year()}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lỗi tải dữ liệu");
      setReportData(json);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load tháng hiện tại khi mount
  useEffect(() => {
    fetchReport(dayjs());
  }, [fetchReport]);

  const handleExport = async () => {
    if (!reportData) return;
    setExporting(true);
    try {
      await exportSecureGrabPDF(reportData);
      message.success("Xuất PDF thành công!");
    } catch (e: any) {
      message.error("Lỗi xuất PDF: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 50,
      align: "center" as const,
      render: (_: any, __: any, idx: number) => idx + 1,
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
      width: 140,
      render: (_: any, r: Proposal) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.proposer.name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {r.proposer.employeeCode}
          </Text>
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
      title: "Tiền dự tính",
      dataIndex: "vehicleAmount",
      key: "vehicleAmount",
      align: "right" as const,
      width: 110,
      render: (v: number) => (
        <Text style={{ color: "#1677ff" }}>{fmtMoney(v)}</Text>
      ),
    },
    {
      title: "tiền trên app",
      dataIndex: "roAmount",
      key: "roAmount",
      align: "right" as const,
      width: 110,
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

  return (
    <ConfigProvider locale={locale} componentSize="small">
      <div style={{ padding: 16, background: "#f0f2f5", minHeight: "100vh" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 8,
            marginBottom: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,.08)",
          }}
        >
          <Row gutter={[12, 8]} align="middle">
            <Col xs={24} md={10}>
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
            <Col xs={24} md={14} style={{ textAlign: "right" }}>
              <Space wrap>
                <DatePicker
                  picker="month"
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  format="MM/YYYY"
                  placeholder="Chọn tháng"
                  allowClear={false}
                  style={{ width: 130 }}
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => fetchReport(selectedMonth)}
                  loading={loading}
                  style={{ background: "#C62828", borderColor: "#C62828" }}
                >
                  Xem báo cáo
                </Button>
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

        {reportData && (
          <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
            {[
              {
                title: "Tổng phiếu đã duyệt",
                value: reportData.total,
                color: "#1677ff",
                suffix: "phiếu",
              },
              {
                title: "Đã duyệt",
                value: reportData.approvedCount,
                color: "#52c41a",
                suffix: "phiếu",
              },
              {
                title: "Tổng tiền dự tính",
                value: reportData.totalVehicleAmount,
                color: "#1677ff",
                suffix: "₫",
                formatter: (v: any) => Number(v).toLocaleString("vi-VN"),
              },
              {
                title: "Tổng tiền trên app",
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
            scroll={{ x: 1400, y: "calc(100vh - 340px)" }}
            pagination={{
              pageSize: 50,
              showSizeChanger: true,
              pageSizeOptions: ["20", "50", "100"],
              showTotal: (t) => `Tổng: ${t} phiếu đã duyệt`,
              size: "small",
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    reportData
                      ? "Không có phiếu đã duyệt nào trong tháng này"
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
