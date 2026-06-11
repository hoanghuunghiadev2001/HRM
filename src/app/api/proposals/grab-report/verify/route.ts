/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeDocHash } from "@/lib/grab-report-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get("id");
  const hashParam = searchParams.get("hash");
  const deptFilter = searchParams.get("dept") ?? "ALL";

  if (!docId || !hashParam) {
    return verifyPage(false, "Thiếu tham số xác thực", null);
  }

  // ── Parse docId: GR-YYYYMMDD-YYYYMMDD-XXXX ────────────────────────────────
  const match = docId.match(/^GR-(\d{8})-(\d{8})-(\d+)$/);
  if (!match) {
    return verifyPage(false, "Mã tài liệu không đúng định dạng", null);
  }

  const rawFrom = match[1]; // "YYYYMMDD"
  const rawTo = match[2]; // "YYYYMMDD"

  // Parse sang Date
  const fromDate = new Date(
    `${rawFrom.slice(0, 4)}-${rawFrom.slice(4, 6)}-${rawFrom.slice(6, 8)}T00:00:00`,
  );
  const toDate = new Date(
    `${rawTo.slice(0, 4)}-${rawTo.slice(4, 6)}-${rawTo.slice(6, 8)}T23:59:59`,
  );

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return verifyPage(false, "Mã tài liệu chứa ngày không hợp lệ", null);
  }

  // ── Query DB ───────────────────────────────────────────────────────────────
  const allProposals = await prisma.proposal.findMany({
    where: {
      proposalType: "VEHICLE_GRAB",
      status: "approved",
      createdAt: { gte: fromDate, lte: toDate },
    },
    include: {
      proposer: {
        select: {
          workInfo: {
            select: {
              department: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  // ── Lọc theo deptFilter ───────────────────────────────────────────────────
  const filtered =
    deptFilter === "ALL"
      ? allProposals
      : allProposals.filter(
          (p) =>
            String(p.proposer.workInfo?.department?.id ?? "") === deptFilter,
        );

  const actualTotal = filtered.length;
  const totalVehicleAmount = filtered.reduce(
    (s, p) => s + (Number(p.vehicleAmount) || 0),
    0,
  );

  // ── Breakdown theo bộ phận (từ toàn bộ) ──────────────────────────────────
  const deptBreakdown: Record<
    string,
    { name: string; count: number; vehicleAmount: number; roAmount: number }
  > = {};
  for (const p of allProposals) {
    const dept = p.proposer.workInfo?.department;
    const key = dept ? String(dept.id) : "__none__";
    const label = dept?.name ?? "Không xác định";
    if (!deptBreakdown[key]) {
      deptBreakdown[key] = {
        name: label,
        count: 0,
        vehicleAmount: 0,
        roAmount: 0,
      };
    }
    deptBreakdown[key].count++;
    deptBreakdown[key].vehicleAmount += Number(p.vehicleAmount) || 0;
    deptBreakdown[key].roAmount += Number((p as any).roAmount) || 0;
  }

  // ── Tính lại hash ─────────────────────────────────────────────────────────
  const expectedHash = makeDocHash(
    docId,
    rawFrom,
    rawTo,
    actualTotal,
    totalVehicleAmount,
    deptFilter,
  );
  const isValid = expectedHash === hashParam.toUpperCase();

  // Tên bộ phận để hiển thị
  const deptName =
    deptFilter === "ALL"
      ? "Tất cả bộ phận"
      : (deptBreakdown[deptFilter]?.name ?? deptFilter);

  // Format ngày hiển thị dd/MM/yyyy
  const fmtDate = (raw: string) =>
    `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}`;

  return verifyPage(
    isValid,
    isValid
      ? "Tài liệu hợp lệ — nội dung chưa bị chỉnh sửa"
      : "Hash không khớp — tài liệu có thể đã bị chỉnh sửa hoặc giả mạo",
    {
      docId,
      dateFrom: fmtDate(rawFrom),
      dateTo: fmtDate(rawTo),
      deptFilter,
      deptName,
      total: actualTotal,
      totalAmount: totalVehicleAmount,
      deptBreakdown,
    },
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtVND(v: number): string {
  return Number(v).toLocaleString("vi-VN") + " đ";
}

function verifyPage(
  valid: boolean,
  message: string,
  info: Record<string, any> | null,
) {
  const color = valid ? "#2e7d32" : "#c62828";
  const bgColor = valid ? "#e8f5e9" : "#ffebee";
  const icon = valid ? "✅" : "❌";
  const title = valid ? "TÀI LIỆU HỢP LỆ" : "XÁC THỰC THẤT BẠI";

  // Bảng breakdown bộ phận
  const breakdownRows = info?.deptBreakdown
    ? Object.entries<any>(info.deptBreakdown)
        .sort((a, b) => a[1].name.localeCompare(b[1].name, "vi"))
        .map(
          ([, d]) => `
        <tr>
          <td>${d.name}</td>
          <td style="text-align:right">${d.count}</td>
          <td style="text-align:right;color:#1565c0">${fmtVND(d.vehicleAmount)}</td>
          <td style="text-align:right;color:#2e7d32">${fmtVND(d.roAmount)}</td>
        </tr>`,
        )
        .join("")
    : "";

  const infoHtml = info
    ? `
    <div class="info-box">
      <div class="info-row">
        <span>Khoảng thời gian</span>
        <strong>${info.dateFrom} — ${info.dateTo}</strong>
      </div>
      <div class="info-row">
        <span>Mã tài liệu</span>
        <strong style="font-family:monospace;font-size:12px">${info.docId}</strong>
      </div>
      <div class="info-row">
        <span>Phạm vi bộ phận</span>
        <strong>${info.deptName}</strong>
      </div>
      <div class="info-row">
        <span>Tổng phiếu đã duyệt</span>
        <strong>${info.total} phiếu</strong>
      </div>
      <div class="info-row last">
        <span>Tổng tiền dự tính</span>
        <strong style="color:#1565c0">${fmtVND(info.totalAmount)}</strong>
      </div>
    </div>
    ${
      breakdownRows
        ? `<div class="section-title">Chi tiết theo từng bộ phận</div>
          <table class="dept-table">
            <thead>
              <tr>
                <th>Bộ phận</th>
                <th style="text-align:right">Phiếu</th>
                <th style="text-align:right">Tiền dự tính</th>
                <th style="text-align:right">Tiền thực tế</th>
              </tr>
            </thead>
            <tbody>${breakdownRows}</tbody>
          </table>`
        : ""
    }`
    : "";

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Xác thực tài liệu – HRM Toyota Bình Dương</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 24px 16px;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,.12);
      max-width: 540px;
      width: 100%;
      overflow: hidden;
    }
    .header { background: #c62828; color: white; padding: 20px 24px; text-align: center; }
    .header .logo  { font-size: 13px; opacity: .85; margin-bottom: 4px; }
    .header .brand { font-size: 18px; font-weight: 700; letter-spacing: .5px; }
    .body { padding: 28px 24px; }
    .result-icon    { font-size: 52px; text-align: center; margin-bottom: 12px; }
    .result-title   { font-size: 20px; font-weight: 700; color: ${color}; text-align: center; margin-bottom: 8px; }
    .result-message {
      background: ${bgColor};
      color: ${color};
      border: 1px solid ${color}44;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 14px;
      text-align: center;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .info-box {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      font-size: 13px;
      border-bottom: 1px solid #f0f0f0;
      gap: 12px;
    }
    .info-row.last  { border-bottom: none; }
    .info-row span  { color: #757575; white-space: nowrap; }
    .info-row strong { text-align: right; }
    .section-title  { font-size: 13px; font-weight: 600; color: #424242; margin-bottom: 8px; }
    .dept-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 4px;
    }
    .dept-table th {
      background: #c62828;
      color: white;
      padding: 8px 10px;
      font-weight: 600;
    }
    .dept-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #f0f0f0;
      color: #212121;
    }
    .dept-table tr:last-child td { border-bottom: none; }
    .dept-table tr:nth-child(even) td { background: #fafafa; }
    .footer {
      padding: 14px 24px;
      background: #fafafa;
      border-top: 1px solid #f0f0f0;
      font-size: 11px;
      color: #9e9e9e;
      text-align: center;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">Hệ Thống Quản Lý Nội Bộ</div>
      <div class="brand">TOYOTA BÌNH DƯƠNG</div>
    </div>
    <div class="body">
      <div class="result-icon">${icon}</div>
      <div class="result-title">${title}</div>
      <div class="result-message">${message}</div>
      ${infoHtml}
    </div>
    <div class="footer">
      Xác thực lúc ${new Date().toLocaleString("vi-VN")}<br/>
      HRM Toyota Bình Dương · Mọi chỉnh sửa nội dung sẽ làm mất hiệu lực mã xác thực
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: valid ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
