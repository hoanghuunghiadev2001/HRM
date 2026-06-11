// lib/grab-report-utils.ts
// ⚠️ KHÔNG có "use client" — dùng được ở cả server route lẫn client
import { createHmac } from "crypto";

const HMAC_SECRET =
  process.env.NEXT_PUBLIC_PDF_HMAC_SECRET ?? "toyota-binh-duong-hrm-secret";

export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://hrm.toyotabinhduong.com";

/** Sinh docId dạng GR-YYYYMM-XXXX */
export function makeDocId(month: number, year: number, total: number): string {
  const seq = String(total).padStart(4, "0");
  return `GR-${year}${String(month).padStart(2, "0")}-${seq}`;
}

/**
 * HMAC-SHA256 của nội dung báo cáo.
 * Payload: docId|MM/YYYY|total|totalAmount|deptFilter
 * deptFilter = "ALL" hoặc departmentId (string) — đảm bảo hash khác nhau giữa các bộ phận
 */
export function makeDocHash(
  docId: string,
  month: number,
  year: number,
  total: number,
  totalAmount: number,
  deptFilter = "ALL",
): string {
  const payload = `${docId}|${String(month).padStart(2, "0")}/${year}|${total}|${Math.round(totalAmount)}|${deptFilter}`;
  return createHmac("sha256", HMAC_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 32)
    .toUpperCase();
}
