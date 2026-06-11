/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import "dayjs/locale/vi";
import dayjs from "dayjs";
import QRCode from "qrcode";
import { makeDocId, makeDocHash, APP_BASE_URL } from "@/lib/grab-report-utils";
import { ROBOTO_BOLD_B64, ROBOTO_REGULAR_B64 } from "@/lib/var";

dayjs.locale("vi");

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DeptInfo {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Signer {
  id: number;
  signerId: number;
  status: string;
  signedAt: string | null;
  level: number;
  signer: { id: number; name: string };
}

export interface Proposal {
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
  proposer: {
    id: number;
    name: string;
    employeeCode: string;
    department: DeptInfo | null;
  };
  vehicle: { id: number; name: string; plateNumber: string | null } | null;
  signers: Signer[];
}

export interface DeptBreakdown {
  name: string;
  abbreviation: string;
  count: number;
  vehicleAmount: number;
  roAmount: number;
}

export interface ReportData {
  dateFrom: string | Date; // Nhận ngày bắt đầu từ UI (VD: "2026-06-01" hoặc đối tượng Date)
  dateTo: string | Date; // Nhận ngày kết thúc từ UI (VD: "2026-06-15" hoặc đối tượng Date)
  total: number;
  approvedCount: number;
  totalVehicleAmount: number;
  totalRoAmount: number;
  deptFilter: string;
  departments: DeptInfo[];
  deptBreakdown: Record<string, DeptBreakdown>;
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

// ─── Color constants ──────────────────────────────────────────────────────────
const RED_RGB = [194, 40, 40] as [number, number, number];
const WHITE_RGB = [255, 255, 255] as [number, number, number];
const GRAY_RGB = [245, 245, 245] as [number, number, number];
const DGRAY_RGB = [97, 97, 97] as [number, number, number];
const LIGHT_RGB = [255, 235, 238] as [number, number, number];
const BLUE_RGB = [13, 71, 161] as [number, number, number];

// ─── PDF Export ───────────────────────────────────────────────────────────────
export async function exportSecureGrabPDF(data: ReportData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const {
    dateFrom,
    dateTo,
    proposals,
    totalVehicleAmount,
    totalRoAmount,
    deptFilter,
    deptBreakdown,
    departments,
  } = data;

  const isAll = deptFilter === "ALL";

  // ── Định dạng mốc thời gian lọc thực tế ─────────────────────────────────────
  const fromDay = dayjs(dateFrom);
  const toDay = dayjs(dateTo);

  const dateFromStr = fromDay.format("YYYYMMDD"); // Chuỗi cho hàm hash mã hóa
  const dateToStr = toDay.format("YYYYMMDD"); // Chuỗi cho hàm hash mã hóa

  const displayFormatRange = `${fromDay.format("DD/MM/YYYY")} - ${toDay.format("DD/MM/YYYY")}`;

  // ── Security tokens (Chuyển sang băm theo dải ngày chính xác) ────────────────
  const docId = makeDocId(dateFromStr, dateToStr, proposals.length);
  const docHash = makeDocHash(
    docId,
    dateFromStr,
    dateToStr,
    proposals.length,
    totalVehicleAmount,
    deptFilter,
  );

  const verifyUrl = `${APP_BASE_URL}/api/proposals/grab-report/verify?id=${docId}&hash=${docHash}&dept=${encodeURIComponent(deptFilter)}`;
  const issuedAt = new Date();

  // Tên bộ phận để hiển thị
  const deptLabel = isAll
    ? "Tất cả bộ phận — Chỉ hiển thị phiếu Đã duyệt"
    : `Bộ phận: ${departments.find((d) => String(d.id) === deptFilter)?.name ?? deptFilter} — Chỉ hiển thị phiếu Đã duyệt`;

  const deptLabelShort = isAll
    ? "ALL"
    : (departments.find((d) => String(d.id) === deptFilter)?.name ??
      deptFilter);

  // ── QR Code ────────────────────────────────────────────────────────────────
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "H",
    width: 200,
    margin: 1,
    color: { dark: "#C62828", light: "#FFFFFF" },
  });

  // ── jsPDF init ─────────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PW = doc.internal.pageSize.getWidth(); // 297mm
  const PH = doc.internal.pageSize.getHeight(); // 210mm

  // ── Fonts ──────────────────────────────────────────────────────────────────
  doc.addFileToVFS("Roboto-Regular.ttf", ROBOTO_REGULAR_B64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", ROBOTO_BOLD_B64);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "normal");

  // ── Layout constants ───────────────────────────────────────────────────────
  const MARGIN = 8;
  const QR_SIZE = 28;
  const QR_X = PW - QR_SIZE - MARGIN - 2;
  const QR_Y = 23;
  const HEADER_H = 22;
  const FOOTER_H = 7;
  const CONTENT_W = QR_X - MARGIN - 2;

  // ── Watermark helper ───────────────────────────────────────────────────────
  function drawWatermark() {
    doc.setTextColor(244, 244, 244);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(13);
    const TEXT = "HRM";
    const stepX = 82;
    const stepY = 40;
    for (let ix = -1; ix <= Math.ceil(PW / stepX) + 1; ix++) {
      for (let iy = -1; iy <= Math.ceil(PH / stepY) + 1; iy++) {
        const cx = ix * stepX + (iy % 2 === 0 ? 0 : stepX / 2);
        const cy = PH - iy * stepY;
        doc.text(TEXT, cx, cy, { angle: 28, renderingMode: "fill" });
      }
    }
  }

  // ── Footer bar helper ──────────────────────────────────────────────────────
  function drawFooter() {
    doc.setFillColor(250, 250, 250);
    doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, "F");
    doc.setDrawColor(...RED_RGB);
    doc.setLineWidth(0.5);
    doc.line(0, PH - FOOTER_H, PW, PH - FOOTER_H);
    doc.setTextColor(...DGRAY_RGB);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(5.5);
    doc.text(
      `HASH: ${docHash}  |  Mã tài liệu: ${docId}  |  Hệ Thống HRM - Toyota Bình Dương  |  Mọi chỉnh sửa sẽ làm mất hiệu lực mã xác thực`,
      PW / 2,
      PH - FOOTER_H + 3,
      { align: "center" },
    );
    doc.setFontSize(6);
    const pageNum =
      (doc.internal as any).getCurrentPageInfo?.().pageNumber ?? 1;
    doc.text(`Trang ${pageNum}`, PW - MARGIN, PH - FOOTER_H + 3, {
      align: "right",
    });
  }

  // ── QR block helper ────────────────────────────────────────────────────────
  function drawQRBlock() {
    doc.setFillColor(255, 255, 255);
    doc.rect(QR_X - 1, QR_Y - 1, QR_SIZE + 3, QR_SIZE + 8, "F");
    doc.addImage(qrDataUrl, "PNG", QR_X, QR_Y, QR_SIZE, QR_SIZE);
    doc.setTextColor(...DGRAY_RGB);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(5.5);
    doc.text("Quét QR xác thực", QR_X + QR_SIZE / 2, QR_Y + QR_SIZE + 5, {
      align: "center",
    });
  }

  // ── Header bar (trang đầu) ─────────────────────────────────────────────────
  function drawPageOneHeader() {
    doc.setFillColor(...RED_RGB);
    doc.rect(0, 0, PW, HEADER_H, "F");

    doc.setTextColor(...WHITE_RGB);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(11);
    doc.text("HRM - TOYOTA BÌNH DƯƠNG", 10, 9);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7.5);
    doc.text("Hệ Thống Quản Lý Nội Bộ", 10, 15);

    doc.setFont("Roboto", "bold");
    doc.setFontSize(13);
    doc.text("BÁO CÁO ĐỀ XUẤT ĐẶT XE GSM", PW / 2, 9, { align: "center" });
    doc.setFont("Roboto", "normal");
    doc.setFontSize(8.5);
    // Tiêu đề phụ hiển thị trực tiếp khoảng ngày động được chọn
    doc.text(`Thời gian lọc: ${displayFormatRange}`, PW / 2, 16, {
      align: "center",
    });

    doc.setFontSize(6.5);
    doc.text(
      `Ngày xuất: ${dayjs(issuedAt).format("HH:mm DD/MM/YYYY")}`,
      PW - MARGIN,
      8,
      { align: "right" },
    );
    doc.text(`Mã tài liệu: ${docId}`, PW - MARGIN, 14, { align: "right" });
  }

  // ── Hash badge ─────────────────────────────────────────────────────────────
  function drawHashBadge(y: number) {
    doc.setFillColor(...LIGHT_RGB);
    doc.setDrawColor(...RED_RGB);
    doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN, y, CONTENT_W, 10, 1.5, 1.5, "FD");

    doc.setTextColor(183, 28, 28);
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7);
    doc.text(
      `MÃ XÁC THỰC: ${docHash.slice(0, 8)}-${docHash.slice(8, 16)}-${docHash.slice(16, 24)}-${docHash.slice(24)}`,
      MARGIN + 4,
      y + 4,
    );

    doc.setFont("Roboto", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...DGRAY_RGB);
    doc.text(
      "HMAC-SHA256 · Kết quả sẽ khác nếu nội dung bị thay đổi",
      MARGIN + 4,
      y + 8,
    );
  }

  // ── KPI bar ────────────────────────────────────────────────────────────────
  function drawKpiBar(
    startY: number,
    items: { label: string; value: string }[],
  ): number {
    const kpiH = 14;
    const kpiW = CONTENT_W / items.length;
    items.forEach((k, i) => {
      const x = MARGIN + i * kpiW;
      doc.setFillColor(...LIGHT_RGB);
      doc.setDrawColor(...RED_RGB);
      doc.setLineWidth(0.4);
      doc.rect(x, startY, kpiW - 1, kpiH, "FD");

      doc.setTextColor(...RED_RGB);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(9.5);
      doc.text(k.value, x + (kpiW - 1) / 2, startY + 6, { align: "center" });

      doc.setTextColor(...DGRAY_RGB);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(5.8);
      doc.text(k.label, x + (kpiW - 1) / 2, startY + 11, { align: "center" });
    });
    return startY + kpiH;
  }

  // ── Bảng tổng hợp bộ phận ─────────────────────────────────────────────────
  function drawDeptSummaryTable(startY: number): number {
    const entries = Object.entries(deptBreakdown).sort((a, b) =>
      a[1].name.localeCompare(b[1].name, "vi"),
    );
    if (!entries.length) return startY;

    doc.setFont("Roboto", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...RED_RGB);
    doc.text("TỔNG HỢP THEO BỘ PHẬN", MARGIN, startY + 4);

    autoTable(doc, {
      startY: startY + 6,
      head: [["Bộ phận", "Phiếu", "Tiền trên app", "Tiền trên RO"]],
      body: entries.map(([, d]) => [
        d.name,
        String(d.count),
        fmtMoney(d.vehicleAmount),
        fmtMoney(d.roAmount),
      ]),
      theme: "grid",
      styles: { font: "Roboto", fontSize: 7.5, cellPadding: 2.5 },
      headStyles: {
        fillColor: RED_RGB,
        textColor: WHITE_RGB,
        fontStyle: "bold",
        halign: "center",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: GRAY_RGB },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: "center", cellWidth: 22 },
        2: { halign: "right", cellWidth: 40 },
        3: { halign: "right", cellWidth: 40 },
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    return (doc as any).lastAutoTable?.finalY ?? startY + 40;
  }

  // ── Bảng proposals ─────────────────────────────────────────────────────────
  function drawProposalTable(
    tableProposals: Proposal[],
    startY: number,
    sectionLabel?: string,
  ): number {
    if (sectionLabel) {
      doc.setFillColor(...BLUE_RGB);
      doc.rect(MARGIN, startY, PW - MARGIN * 2, 7, "F");
      doc.setTextColor(...WHITE_RGB);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(8);
      doc.text(
        `BỘ PHẬN: ${sectionLabel.toUpperCase()}`,
        MARGIN + 4,
        startY + 4.8,
      );
      startY += 8;
    }

    const tableBody = tableProposals.map((p, idx) => {
      const approvedSigners = p.signers
        .filter((s) => s.status === "approved")
        .map(
          (s) =>
            `${s.signer.name}${
              s.signedAt
                ? " (" + dayjs(s.signedAt).format("DD/MM HH:mm") + ")"
                : ""
            }`,
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

      return [
        idx + 1,
        dayjs(p.createdAt).format("DD/MM/YY\nHH:mm"),
        p.proposer.name,
        desc,
        p.roNumber || "—",
        route,
        fmtMoney(p.vehicleAmount),
        fmtMoney(p.roAmount),
        approvedSigners || "Chưa ký",
        STATUS_LABEL[p.status] ?? p.status,
      ];
    });

    autoTable(doc, {
      startY,
      head: [
        [
          "STT",
          "Ngày đặt",
          "Người đặt",
          "KH / Mô tả",
          "Số RO",
          "Điểm đón / trả",
          "Trên app",
          "Trên RO",
          "Người ký",
          "TT",
        ],
      ],
      body: tableBody,
      theme: "grid",
      styles: {
        font: "Roboto",
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
        2: { cellWidth: 26 },
        3: { cellWidth: 34 },
        4: { cellWidth: 18 },
        5: { cellWidth: 60 },
        7: { halign: "right", cellWidth: 22 },
        8: { halign: "right", cellWidth: 22 },
        9: { cellWidth: 26 },
        10: { halign: "center", cellWidth: 16 },
      },
      margin: { left: MARGIN, right: MARGIN },
      didDrawPage: () => {
        drawWatermark();
        drawFooter();
      },
    });

    return (doc as any).lastAutoTable?.finalY ?? startY;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  VẼ NỘI DUNG TÀI LIỆU
  // ══════════════════════════════════════════════════════════════════════════

  drawWatermark();
  drawPageOneHeader();
  drawQRBlock();

  const BADGE_Y = HEADER_H + 1;
  drawHashBadge(BADGE_Y);

  const KPI_Y = BADGE_Y + 12;
  const kpiItems = [
    {
      label: isAll ? "Tổng phiếu đã duyệt" : "Phiếu đã duyệt",
      value: String(proposals.length),
    },
    {
      label: "Có tiền trên app",
      value: String(proposals.filter((p) => p.roAmount).length),
    },
    { label: "Tiền dự tính", value: fmtMoney(totalVehicleAmount) },
    { label: "Tiền thực tế (app)", value: fmtMoney(totalRoAmount) },
  ];
  let cursorY = drawKpiBar(KPI_Y, kpiItems) + 3;

  if (isAll && Object.keys(deptBreakdown).length > 0) {
    cursorY = drawDeptSummaryTable(cursorY) + 5;
  }

  if (isAll) {
    const grouped = new Map<string, { label: string; items: Proposal[] }>();

    for (const dept of departments) {
      grouped.set(String(dept.id), { label: dept.name, items: [] });
    }
    grouped.set("__none__", { label: "Không xác định bộ phận", items: [] });

    for (const p of proposals) {
      const key = p.proposer.department
        ? String(p.proposer.department.id)
        : "__none__";
      grouped.get(key)?.items.push(p);
    }

    for (const [, { label, items }] of grouped) {
      if (items.length === 0) continue;
      cursorY = drawProposalTable(items, cursorY, label) + 5;
    }
  } else {
    cursorY = drawProposalTable(proposals, cursorY);
  }

  const finalY = (doc as any).lastAutoTable?.finalY ?? cursorY;
  if (finalY + 16 < PH - FOOTER_H) {
    doc.setDrawColor(...DGRAY_RGB);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, finalY + 4, PW - MARGIN, finalY + 4);
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

  drawFooter();

  const safeDeptLabel = deptLabelShort.replace(/[\s/\\:*?"<>|]/g, "_");
  // Thay đổi tên file PDF tải xuống phản ánh chính xác dải ngày bắt đầu -> ngày kết thúc
  doc.save(
    `BaoCao_GSM_${dateFromStr}_To_${dateToStr}_${safeDeptLabel}_${docId}.pdf`,
  );
}
