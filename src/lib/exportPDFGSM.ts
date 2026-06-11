/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "dayjs/locale/vi";
import dayjs from "dayjs";
import QRCode from "qrcode";
// ✅ Import từ lib — không tự định nghĩa makeDocHash ở đây nữa
import { makeDocId, makeDocHash, APP_BASE_URL } from "@/lib/grab-report-utils";
import { ROBOTO_BOLD_B64, ROBOTO_REGULAR_B64 } from "@/lib/var";

dayjs.locale("vi");

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

// ─── PDF Export ───────────────────────────────────────────────────────────────
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

  // ── Security ───────────────────────────────────────────────────────────────
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

  // ── QR Code ────────────────────────────────────────────────────────────────
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "H",
    width: 160,
    margin: 1,
    color: { dark: "#C62828", light: "#FFFFFF" },
  });

  // ── jsPDF setup ────────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();

  // ── Đăng ký font Roboto hỗ trợ tiếng Việt ─────────────────────────────────
  doc.addFileToVFS("Roboto-Regular.ttf", ROBOTO_REGULAR_B64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", ROBOTO_BOLD_B64);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "normal");

  const RED_RGB = [194, 40, 40] as [number, number, number];
  const WHITE_RGB = [255, 255, 255] as [number, number, number];
  const GRAY_RGB = [245, 245, 245] as [number, number, number];
  const DGRAY_RGB = [97, 97, 97] as [number, number, number];
  const LIGHT_RGB = [255, 235, 238] as [number, number, number];

  // ── Security layer (watermark + footer) ───────────────────────────────────
  function drawSecurityLayer() {
    // Watermark rất mờ — màu (230,230,230) gần trắng
    doc.setTextColor(244, 244, 244);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(13);
    const TEXT = "HRM TOYOTA BINH DUONG";
    const stepX = 82,
      stepY = 40;
    for (let ix = -1; ix <= Math.ceil(PW / stepX) + 1; ix++) {
      for (let iy = -1; iy <= Math.ceil(PH / stepY) + 1; iy++) {
        const cx = ix * stepX + (iy % 2 === 0 ? 0 : stepX / 2);
        const cy = PH - iy * stepY;
        doc.text(TEXT, cx, cy, { angle: 28, renderingMode: "fill" });
      }
    }

    // Footer bar
    const barH = 7;
    doc.setFillColor(250, 250, 250);
    doc.rect(0, PH - barH, PW, barH, "F");
    doc.setDrawColor(...RED_RGB);
    doc.setLineWidth(0.5);
    doc.line(0, PH - barH, PW, PH - barH);

    doc.setTextColor(...DGRAY_RGB);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(5.5);
    doc.text(
      `HASH: ${docHash}  |  Mã tài liệu: ${docId}  |  Hệ Thống HRM - Toyota Bình Dương  |  Mọi chỉnh sửa sẽ làm mất hiệu lực mã xác thực`,
      PW / 2,
      PH - barH + 3,
      { align: "center" },
    );
    doc.setFontSize(6);
    const pageNum =
      (doc.internal as any).getCurrentPageInfo?.().pageNumber ?? 1;
    doc.text(`Trang ${pageNum}`, PW - 8, PH - barH + 3, { align: "right" });
  }

  // ── Header ─────────────────────────────────────────────────────────────────
  doc.setFillColor(...RED_RGB);
  doc.rect(0, 0, PW, 22, "F");

  doc.setTextColor(...WHITE_RGB);
  doc.setFont("Roboto", "bold");
  doc.setFontSize(11);
  doc.text("HRM - TOYOTA BÌNH DƯƠNG", 10, 9);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(7.5);
  doc.text("Hệ Thống Quản Lý Nội Bộ", 10, 15);

  doc.setFont("Roboto", "bold");
  doc.setFontSize(14);
  doc.text("BÁO CÁO ĐỀ XUẤT ĐẶT XE GSM", PW / 2, 9, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("Roboto", "normal");
  doc.text(
    `Tháng ${String(month).padStart(2, "0")}/${year}  —  Chỉ hiển thị phiếu Đã duyệt`,
    PW / 2,
    16,
    { align: "center" },
  );

  doc.setFontSize(7);
  doc.text(
    `Ngày xuất: ${dayjs(issuedAt).format("HH:mm DD/MM/YYYY")}`,
    PW - 42,
    8,
    { align: "right" },
  );
  doc.text(`Mã tài liệu: ${docId}`, PW - 42, 13, { align: "right" });

  // ── QR ─────────────────────────────────────────────────────────────────────
  const QR_SIZE = 26;
  doc.addImage(qrDataUrl, "PNG", PW - QR_SIZE - 8, 23, QR_SIZE, QR_SIZE);
  doc.setTextColor(...DGRAY_RGB);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(6);
  doc.text("Quét QR xác thực", PW - QR_SIZE / 2 - 8, 52, { align: "center" });

  // ── Hash badge ─────────────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_RGB);
  doc.setDrawColor(...RED_RGB);
  doc.setLineWidth(0.4);
  doc.roundedRect(8, 23, PW - QR_SIZE - 24, 10, 1.5, 1.5, "FD");
  doc.setTextColor(183, 28, 28);
  doc.setFont("Roboto", "bold");
  doc.setFontSize(7);
  doc.text(
    `MÃ XÁC THỰC: ${docHash.slice(0, 8)}-${docHash.slice(8, 16)}-${docHash.slice(16, 24)}-${docHash.slice(24)}`,
    12,
    29,
  );
  doc.setFont("Roboto", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...DGRAY_RGB);
  doc.text("HMAC-SHA256 · Kết quả sẽ khác nếu nội dung bị thay đổi", 12, 32);

  // ── KPI bar ────────────────────────────────────────────────────────────────
  const kpiY = 36,
    kpiH = 14;
  const kpiAvailW = PW - QR_SIZE - 24;
  const kpiItemW = kpiAvailW / 4;
  const kpiItems = [
    { label: "Tổng phiếu đã duyệt", value: String(proposals.length) },
    {
      label: "Có tiền trên app",
      value: String(proposals.filter((p) => p.roAmount).length),
    },
    { label: "Tiền dự tính", value: fmtMoney(totalVehicleAmount) },
    { label: "Tiền trên R0", value: fmtMoney(totalRoAmount) },
  ];
  kpiItems.forEach((k, i) => {
    const x = 8 + i * kpiItemW;
    doc.setFillColor(...LIGHT_RGB);
    doc.setDrawColor(...RED_RGB);
    doc.setLineWidth(0.4);
    doc.rect(x, kpiY, kpiItemW - 1, kpiH, "FD");
    doc.setTextColor(...RED_RGB);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(10);
    doc.text(k.value, x + (kpiItemW - 1) / 2, kpiY + 6, { align: "center" });
    doc.setTextColor(...DGRAY_RGB);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(6);
    doc.text(k.label, x + (kpiItemW - 1) / 2, kpiY + 11, { align: "center" });
  });

  // ── Table ──────────────────────────────────────────────────────────────────
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
        p.pickupPlace ? `Đón: ${p.pickupPlace}` : "",
        p.dropoffPlace ? `Trả: ${p.dropoffPlace}` : "",
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
      approvedSigners || "Chưa ký",
      STATUS_LABEL[p.status] ?? p.status,
    ];
  });

  autoTable(doc, {
    startY: kpiY + kpiH + 3,
    head: [
      [
        "STT",
        "Ngày đặt",
        "Người đặt",
        "KH / Mô tả",
        "Số RO",
        "Điểm đón / trả",
        "Giờ đi → về",
        "Dự tính",
        "Thực tế",
        "Người ký",
        "TT",
      ],
    ],
    body: tableBody,
    theme: "grid",
    styles: {
      font: "Roboto", // ← dùng Roboto thay helvetica
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
    didDrawPage: () => {
      drawSecurityLayer();
    },
  });

  // ── Security note ──────────────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable?.finalY ?? 160;
  if (finalY < PH - 30) {
    doc.setDrawColor(...DGRAY_RGB);
    doc.setLineWidth(0.3);
    doc.line(8, finalY + 4, PW - 8, finalY + 4);
    doc.setTextColor(183, 28, 28);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(6.5);
    doc.text(
      `[BẢO MẬT] SHA-256 HMAC: ${docHash}  |  ID: ${docId}  |  ${dayjs(issuedAt).format("HH:mm:ss DD/MM/YYYY")}  |  Mọi thay đổi sẽ làm mất hiệu lực mã xác thực.`,
      PW / 2,
      finalY + 9,
      { align: "center" },
    );
  }

  drawSecurityLayer();
  doc.save(
    `BaoCao_GSM_T${String(month).padStart(2, "0")}_${year}_${docId}.pdf`,
  );
}
