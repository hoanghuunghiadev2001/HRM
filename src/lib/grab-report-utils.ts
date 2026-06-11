// lib/grab-report-utils.ts
// ⚠️ KHÔNG có "use client" — dùng được ở cả server route lẫn client
import { createHmac } from "crypto";

const HMAC_SECRET =
  process.env.NEXT_PUBLIC_PDF_HMAC_SECRET ?? "toyota-binh-duong-hrm-secret";

export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://hrm.toyotabinhduong.com";

/**
 * Sinh docId dạng GR-YYYYMMDD-YYYYMMDD-XXXX
 * Ví dụ: GR-20250623-20250722-0042
 */
export function makeDocId(
  dateFrom: string, // "YYYYMMDD"
  dateTo: string, // "YYYYMMDD"
  total: number,
): string {
  const seq = String(total).padStart(4, "0");
  return `GR-${dateFrom}-${dateTo}-${seq}`;
}

/**
 * HMAC-SHA256 của nội dung báo cáo.
 * Payload: docId|dateFrom|dateTo|total|totalAmount|deptFilter
 */
export function makeDocHash(
  docId: string,
  dateFrom: string,
  dateTo: string,
  total: number,
  totalAmount: number,
  deptFilter = "ALL",
): string {
  const payload = `${docId}|${dateFrom}|${dateTo}|${total}|${Math.round(totalAmount)}|${deptFilter}`;
  return createHmac("sha256", HMAC_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 32)
    .toUpperCase();
}

/**
 * Tính khoảng ngày mặc định: từ ngày 23 tháng trước đến ngày 22 tháng này
 */
export function getDefaultDateRange(): { from: Date; to: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based

  // ngày 22 tháng này
  const to = new Date(year, month, 22, 23, 59, 59);

  // ngày 23 tháng trước
  const from = new Date(year, month - 1, 23, 0, 0, 0);

  return { from, to };
}

/** Format Date → "YYYYMMDD" để dùng trong docId */
export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/** Format Date → "DD/MM/YYYY" để hiển thị */
export function formatDateDisplay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${m}/${y}`;
}
