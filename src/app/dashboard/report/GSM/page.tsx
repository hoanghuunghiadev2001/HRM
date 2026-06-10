/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(main)/proposals/GSM-report/page.tsx
"use client";

import React, { useState, useCallback } from "react";
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
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "dayjs/locale/vi";
import locale from "antd/locale/vi_VN";

dayjs.locale("vi");
import dayjs, { Dayjs } from "dayjs";
import QRCode from "qrcode";
import { createHmac } from "crypto";
const { Title, Text } = Typography;

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

// ─── PDF Export (jsPDF + autoTable) ──────────────────────────────────────────

// ─── Config ───────────────────────────────────────────────────────────────────
// Trong thực tế đọc từ process.env.PDF_HMAC_SECRET
const HMAC_SECRET =
  process.env.NEXT_PUBLIC_PDF_HMAC_SECRET ?? "toyota-binh-duong-hrm-secret";
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://hrm.toyotabinhduong.com";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PdfSecurityInfo {
  docId: string; // VD: GR-202506-0001
  hash: string; // HMAC-SHA256 32 ký tự
  verifyUrl: string; // URL QR trỏ đến
  issuedAt: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Sinh docId dạng GR-YYYYMM-XXXX */
export function makeDocId(month: number, year: number, total: number): string {
  const seq = String(total).padStart(4, "0");
  return `GR-${year}${String(month).padStart(2, "0")}-${seq}`;
}

/**
 * HMAC-SHA256 của nội dung báo cáo.
 * Bất kỳ ai sửa 1 con số → hash thay đổi → xác thực thất bại.
 */
export function makeDocHash(
  docId: string,
  month: number,
  year: number,
  total: number,
  totalAmount: number,
): string {
  const payload = `${docId}|${String(month).padStart(2, "0")}/${year}|${total}|${Math.round(totalAmount)}`;
  return createHmac("sha256", HMAC_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 32)
    .toUpperCase();
}

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

const STATUS_LABEL: Record<string, string> = {
  approved: "Da duyet",
  rejected: "Tu choi",
  pending_signatures: "Cho ky",
  waiting_approval: "Cho duyet",
};

// ─── Main export function ─────────────────────────────────────────────────────
export async function exportSecureGrabPDF(data: ReportData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const {
    month,
    year,
    proposals,
    totalVehicleAmount,
    totalRoAmount,
    approvedCount,
  } = data;

  // ── 1. Sinh security info ──────────────────────────────────────────────────
  const docId = makeDocId(month, year, proposals.length);
  const docHash = makeDocHash(
    docId,
    month,
    year,
    proposals.length,
    totalVehicleAmount,
  );
  const verifyUrl = `${APP_BASE_URL}/api/proposals/grab-report/verify?id=${docId}&hash=${docHash}`;
  const issuedAt = new Date();

  // ── 2. Sinh QR PNG (base64) ────────────────────────────────────────────────
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "H",
    width: 160,
    margin: 1,
    color: { dark: "#C62828", light: "#FFFFFF" },
  });

  // ── 3. Setup jsPDF ────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PW = doc.internal.pageSize.getWidth(); // 297
  const PH = doc.internal.pageSize.getHeight(); // 210

  const RED_RGB = [194, 40, 40] as [number, number, number];
  const WHITE_RGB = [255, 255, 255] as [number, number, number];
  const GRAY_RGB = [245, 245, 245] as [number, number, number];
  const DGRAY_RGB = [97, 97, 97] as [number, number, number];
  const LIGHT_RGB = [255, 235, 238] as [number, number, number];

  // ── Helper vẽ watermark + footer bar lên canvas hiện tại ──────────────────
  function drawSecurityLayer() {
    doc.saveGraphicsState?.();

    // ── Watermark diagonal tiled ─────────────────────────────────────────
    // jsPDF không có setGState alpha đơn giản, dùng màu rất nhạt thay thế
    doc.setTextColor(210, 210, 210);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    const stepX = 75,
      stepY = 44;
    const angleRad = (30 * Math.PI) / 180;
    const cos30 = Math.cos(angleRad),
      sin30 = Math.sin(angleRad);
    const TEXT = "HRM TOYOTA BINH DUONG";

    for (let ix = -1; ix <= Math.ceil(PW / stepX) + 1; ix++) {
      for (let iy = -1; iy <= Math.ceil(PH / stepY) + 1; iy++) {
        const cx = ix * stepX + (iy % 2) * (stepX / 2);
        const cy = PH - iy * stepY; // jsPDF y từ top
        doc.text(TEXT, cx, cy, { angle: 30, renderingMode: "fill" });
      }
    }

    // ── Footer security bar ───────────────────────────────────────────────
    const barH = 7;
    doc.setFillColor(250, 250, 250);
    doc.rect(0, PH - barH, PW, barH, "F");

    // Đường đỏ trên footer
    doc.setDrawColor(...RED_RGB);
    doc.setLineWidth(0.6);
    doc.line(0, PH - barH, PW, PH - barH);

    doc.setTextColor(...DGRAY_RGB);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.text(
      `HASH: ${docHash}  |  Ma tai lieu: ${docId}  |  ` +
        `He Thong HRM - Toyota Binh Duong  |  ` +
        `Moi chinh sua noi dung se lam mat hieu luc ma xac thuc`,
      PW / 2,
      PH - barH + 3,
      { align: "center" },
    );

    // Số trang góc phải
    const pageCount = (doc.internal as any).getNumberOfPages?.() ?? 1;
    doc.setFontSize(6);
    doc.text(
      `Trang ${(doc.internal as any).getCurrentPageInfo?.().pageNumber ?? 1}`,
      PW - 8,
      PH - barH + 3,
      { align: "right" },
    );
  }

  // ── 4. Header ─────────────────────────────────────────────────────────────
  // Background đỏ
  doc.setFillColor(...RED_RGB);
  doc.rect(0, 0, PW, 22, "F");

  // Logo text trái
  doc.setTextColor(...WHITE_RGB);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("HRM - TOYOTA BINH DUONG", 10, 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("He Thong Quan Ly Noi Bo", 10, 15);

  // Tiêu đề giữa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("BAO CAO DE XUAT DAT XE GRAB", PW / 2, 9, { align: "center" });
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Thang ${String(month).padStart(2, "0")}/${year}`, PW / 2, 16, {
    align: "center",
  });

  // Ngày xuất + DocID bên phải (nhường chỗ cho QR)
  doc.setFontSize(7);
  doc.text(
    `Ngay xuat: ${dayjs(issuedAt).format("HH:mm DD/MM/YYYY")}`,
    PW - 42,
    8,
    { align: "right" },
  );
  doc.text(`Ma tai lieu: ${docId}`, PW - 42, 13, { align: "right" });

  // ── 5. QR Code góc phải header ────────────────────────────────────────────
  const QR_SIZE = 26;
  doc.addImage(qrDataUrl, "PNG", PW - QR_SIZE - 8, 23, QR_SIZE, QR_SIZE);
  doc.setTextColor(...DGRAY_RGB);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("Quet QR xac thuc", PW - QR_SIZE / 2 - 8, 52, { align: "center" });

  // ── 6. Hash badge ─────────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_RGB);
  doc.setDrawColor(...RED_RGB);
  doc.setLineWidth(0.4);
  doc.roundedRect(8, 23, PW - QR_SIZE - 24, 10, 1.5, 1.5, "FD");

  doc.setTextColor(183, 28, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(
    `MA XAC THUC: ${docHash.slice(0, 8)}-${docHash.slice(8, 16)}-${docHash.slice(16, 24)}-${docHash.slice(24)}`,
    12,
    29,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...DGRAY_RGB);
  doc.text("HMAC-SHA256 · Ket qua se khac neu noi dung bi thay doi", 12, 32);

  // ── 7. KPI bar ────────────────────────────────────────────────────────────
  const kpiY = 36,
    kpiH = 14;
  const kpiAvailW = PW - QR_SIZE - 24;
  const kpiItemW = kpiAvailW / 4;
  const kpiItems = [
    { label: "Tong phieu", value: String(proposals.length) },
    { label: "Da duyet", value: String(approvedCount) },
    { label: "Tien du tinh", value: fmtMoney(totalVehicleAmount) },
    { label: "Tien thuc te", value: fmtMoney(totalRoAmount) },
  ];
  kpiItems.forEach((k, i) => {
    const x = 8 + i * kpiItemW;
    doc.setFillColor(...LIGHT_RGB);
    doc.setDrawColor(...RED_RGB);
    doc.setLineWidth(0.4);
    doc.rect(x, kpiY, kpiItemW - 1, kpiH, "FD");

    doc.setTextColor(...RED_RGB);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(k.value, x + (kpiItemW - 1) / 2, kpiY + 6, { align: "center" });

    doc.setTextColor(...DGRAY_RGB);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(k.label, x + (kpiItemW - 1) / 2, kpiY + 11, { align: "center" });
  });

  // ── 8. Main table ─────────────────────────────────────────────────────────
  const tableBody = proposals.map((p, idx) => {
    const approvedSigners = p.signers
      .filter((s) => s.status === "approved")
      .map(
        (s) =>
          `${s.signer.name}${s.signedAt ? " (" + dayjs(s.signedAt).format("DD/MM HH:mm") + ")" : ""}`,
      )
      .join("\n");

    const desc =
      [p.customerName, p.description].filter(Boolean).join("\n") || "—";
    const route =
      [
        p.pickupPlace ? `Don: ${p.pickupPlace}` : "",
        p.dropoffPlace ? `Tra: ${p.dropoffPlace}` : "",
      ]
        .filter(Boolean)
        .join("\n") || "—";
    const timing =
      [
        p.startAt ? dayjs(p.startAt).format("HH:mm DD/MM") : "",
        p.endAt ? dayjs(p.endAt).format("HH:mm DD/MM") : "",
      ]
        .filter(Boolean)
        .join(" ->\n") || "—";

    return [
      idx + 1,
      dayjs(p.createdAt).format("DD/MM/YY\nHH:mm"),
      p.proposer.name,
      desc,
      p.roNumber || "—",
      route,
      timing,
      fmtMoney(p.vehicleAmount),
      fmtMoney(p.roAmount),
      approvedSigners || "Chua ky",
      STATUS_LABEL[p.status] ?? p.status,
    ];
  });

  autoTable(doc, {
    startY: kpiY + kpiH + 3,
    head: [
      [
        "STT",
        "Ngay dat",
        "Nguoi dat",
        "KH / Mo ta",
        "So RO",
        "Diem don / tra",
        "Gio di -> ve",
        "Du tinh",
        "Thuc te",
        "Nguoi ky",
        "TT",
      ],
    ],
    body: tableBody,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 2,
      valign: "top",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: RED_RGB,
      textColor: WHITE_RGB,
      fontStyle: "bold",
      halign: "center",
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: GRAY_RGB },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { cellWidth: 21 },
      2: { cellWidth: 25 },
      3: { cellWidth: 34 },
      4: { cellWidth: 19 },
      5: { cellWidth: 30 },
      6: { cellWidth: 22 },
      7: { halign: "right", cellWidth: 22 },
      8: { halign: "right", cellWidth: 22 },
      9: { cellWidth: 27 },
      10: { halign: "center", cellWidth: 16 },
    },
    margin: { left: 8, right: 8 },
    // Vẽ security layer sau mỗi trang
    didDrawPage: () => {
      drawSecurityLayer();
    },
  });

  // ── 9. Security note cuối cùng ────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable?.finalY ?? 160;
  if (finalY < PH - 30) {
    doc.setDrawColor(...DGRAY_RGB);
    doc.setLineWidth(0.3);
    doc.line(8, finalY + 4, PW - 8, finalY + 4);

    doc.setTextColor(183, 28, 28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(
      `[BAO MAT] SHA-256 HMAC: ${docHash}  |  ID: ${docId}  |  ` +
        `${dayjs(issuedAt).format("HH:mm:ss DD/MM/YYYY")}  |  ` +
        `Moi su thay doi noi dung se lam mat hieu luc ma xac thuc.`,
      PW / 2,
      finalY + 9,
      { align: "center" },
    );
  }

  // Đảm bảo security layer trang cuối cũng được vẽ
  drawSecurityLayer();

  // ── 10. Save ──────────────────────────────────────────────────────────────
  const fileName = `BaoCao_Grab_T${String(month).padStart(2, "0")}_${year}_${docId}.pdf`;
  doc.save(fileName);
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function GSMReportPage() {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleFetch = useCallback(async () => {
    if (!selectedMonth) return message.warning("Vui lòng chọn tháng");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/proposals/GSM-report?month=${selectedMonth.month() + 1}&year=${selectedMonth.year()}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lỗi tải dữ liệu");
      setReportData(json);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

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

  // ── Table columns ──────────────────────────────────────────────────────
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
      title: "Giờ đi → Về",
      key: "timing",
      width: 140,
      render: (_: any, r: Proposal) => (
        <Space direction="vertical" size={0}>
          <Space size={3}>
            <ClockCircleOutlined style={{ fontSize: 11, color: "#1677ff" }} />
            <Text style={{ fontSize: 11 }}>
              {fmtDt(r.startAt, "HH:mm DD/MM")}
            </Text>
          </Space>
          <Space size={3}>
            <ClockCircleOutlined style={{ fontSize: 11, color: "#ff7875" }} />
            <Text style={{ fontSize: 11 }}>
              {fmtDt(r.endAt, "HH:mm DD/MM")}
            </Text>
          </Space>
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
      title: "Tiền thực tế",
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
        if (approved.length === 0) return <Text type="secondary">Chưa ký</Text>;
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
      filters: Object.entries(STATUS_MAP).map(([k, v]) => ({
        text: v.label,
        value: k,
      })),
      onFilter: (value: any, record: Proposal) => record.status === value,
    },
  ];

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
                  onClick={handleFetch}
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

        {/* ── KPI Cards ── */}
        {reportData && (
          <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
            {[
              {
                title: "Tổng phiếu",
                value: reportData.total,
                icon: <FileTextOutlined />,
                color: "#1677ff",
                suffix: "phiếu",
              },
              {
                title: "Đã duyệt",
                value: reportData.approvedCount,
                icon: <CheckCircleOutlined />,
                color: "#52c41a",
                suffix: "phiếu",
              },
              {
                title: "Tổng tiền dự tính",
                value: reportData.totalVehicleAmount,
                icon: <DollarOutlined />,
                color: "#1677ff",
                suffix: "₫",
                formatter: (v: any) => Number(v).toLocaleString("vi-VN"),
              },
              {
                title: "Tổng tiền thực tế",
                value: reportData.totalRoAmount,
                icon: <DollarOutlined />,
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
                      <Space size={4}>
                        <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                          {k.title}
                        </span>
                      </Space>
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

        {/* ── Table ── */}
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
            scroll={{ x: 1500, y: "calc(100vh - 340px)" }}
            pagination={{
              pageSize: 50,
              showSizeChanger: true,
              pageSizeOptions: ["20", "50", "100"],
              showTotal: (t) => `Tổng: ${t} phiếu`,
              size: "small",
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    reportData
                      ? "Không có phiếu nào trong tháng này"
                      : "Chọn tháng và nhấn Xem báo cáo"
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
