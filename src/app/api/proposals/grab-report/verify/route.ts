/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeDocHash } from "@/app/dashboard/report/GSM/page";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get("id");
  const hashParam = searchParams.get("hash");

  if (!docId || !hashParam) {
    return verifyPage(false, "Thiếu tham số xác thực", null);
  }

  // ── Parse docId: GR-202506-0042 ──────────────────────────────────────────
  const match = docId.match(/^GR-(\d{4})(\d{2})-(\d+)$/);
  if (!match) {
    return verifyPage(false, "Mã tài liệu không đúng định dạng", null);
  }
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  const total = parseInt(match[3]);

  // ── Lấy tổng tiền thực tế từ DB để tính lại hash ─────────────────────────
  const from = new Date(year, month - 1, 1, 0, 0, 0);
  const to = new Date(year, month, 0, 23, 59, 59);

  const proposals = await prisma.proposal.findMany({
    where: { proposalType: "VEHICLE_GRAB", createdAt: { gte: from, lte: to } },
    select: { vehicleAmount: true, status: true, createdAt: true },
  });

  const totalAmount = proposals.reduce(
    (s, p) => s + (Number(p.vehicleAmount) || 0),
    0,
  );
  const approvedCount = proposals.filter((p) => p.status === "approved").length;
  const actualTotal = proposals.length;

  // ── Tính lại hash từ dữ liệu DB hiện tại ─────────────────────────────────
  const expectedHash = makeDocHash(
    docId,
    month,
    year,
    actualTotal,
    totalAmount,
  );

  const isValid = expectedHash === hashParam.toUpperCase();

  const info = {
    docId,
    month,
    year,
    total: actualTotal,
    approvedCount,
    totalAmount,
  };

  return verifyPage(
    isValid,
    isValid
      ? "Tài liệu hợp lệ"
      : "Hash không khớp — tài liệu có thể đã bị chỉnh sửa",
    info,
  );
}

// ── Trả về trang HTML đẹp để hiển thị kết quả xác thực ─────────────────────
function verifyPage(
  valid: boolean,
  message: string,
  info: Record<string, any> | null,
) {
  const color = valid ? "#2e7d32" : "#c62828";
  const bgColor = valid ? "#e8f5e9" : "#ffebee";
  const icon = valid ? "✅" : "❌";
  const title = valid ? "TÀI LIỆU HỢP LỆ" : "XÁC THỰC THẤT BẠI";

  const infoHtml = info
    ? `
    <div class="info-box">
      <div class="info-row"><span>Tháng báo cáo:</span><strong>${String(info.month).padStart(2, "0")}/${info.year}</strong></div>
      <div class="info-row"><span>Mã tài liệu:</span><strong>${info.docId}</strong></div>
      <div class="info-row"><span>Tổng phiếu:</span><strong>${info.total} phiếu</strong></div>
      <div class="info-row"><span>Đã duyệt:</span><strong>${info.approvedCount} phiếu</strong></div>
      <div class="info-row"><span>Tổng tiền dự tính:</span><strong>${Number(info.totalAmount).toLocaleString("vi-VN")} đ</strong></div>
    </div>
  `
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
      background: #f5f5f5; min-height: 100vh;
      display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .card {
      background: white; border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,.12);
      max-width: 440px; width: 100%; overflow: hidden;
    }
    .header {
      background: #c62828; color: white;
      padding: 20px 24px; text-align: center;
    }
    .header .logo { font-size: 13px; opacity: .85; margin-bottom: 4px; }
    .header .brand { font-size: 18px; font-weight: 700; letter-spacing: .5px; }
    .body { padding: 28px 24px; }
    .result-icon { font-size: 52px; text-align: center; margin-bottom: 12px; }
    .result-title {
      font-size: 20px; font-weight: 700;
      color: ${color}; text-align: center; margin-bottom: 8px;
    }
    .result-message {
      background: ${bgColor}; color: ${color};
      border: 1px solid ${color}33;
      border-radius: 8px; padding: 12px 16px;
      font-size: 14px; text-align: center; margin-bottom: 20px;
    }
    .info-box {
      border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;
    }
    .info-row {
      display: flex; justify-content: space-between;
      padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f0f0f0;
    }
    .info-row:last-child { border-bottom: none; }
    .info-row span { color: #757575; }
    .footer {
      padding: 14px 24px; background: #fafafa;
      border-top: 1px solid #f0f0f0;
      font-size: 11px; color: #9e9e9e; text-align: center;
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
      Xác thực lúc ${new Date().toLocaleString("vi-VN")} · HRM Toyota Bình Dương
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: valid ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
