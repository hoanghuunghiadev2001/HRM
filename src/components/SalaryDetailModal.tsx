/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  X,
  Search,
  Download,
  Users,
  DollarSign,
  Loader2,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface SalaryDetail {
  id: number;
  batchId?: number;
  employeeId: number;
  month: number;
  year: number;
  type: string;
  employeeCode: string;
  fullName: string;
  position?: string;
  grade?: string;
  insuranceLevel?: string;
  contractDate?: string;
  workingDays: number;
  notOfficial: number;
  baseSalary: number;
  efficiencySalary: number;
  salary70: number;
  phoneAllowance: number;
  seniorityAllowance: number;
  mealAllowance: number;
  maternityAllowance: number;
  houseAllowance: number;
  productivitySalary: number;
  productivityOther: number;
  productivitySCC: number;
  productivityPaint: number;
  productivityAccessory: number;
  productivityParts: number;
  bonusDay10: number;
  salaryAdjust: number;
  bonusDay25: number;
  otherWork: number;
  bonus: number;
  overtime15: number;
  overtime2: number;
  overtime3: number;
  overtime: number;
  otherIncome: number;
  salaryDeduction: number;
  insuranceDeduction: number;
  unemploymentInsu: number;
  unionFee: number;
  advancePayment: number;
  socialWorkDeduction: number;
  healthCardDeduction: number;
  insuranceArrears: number;
  taxCompensation: number;
  taxTNCN: number;
  phoneDeduction: number;
  taxRefund: number;
  salaryDeductionFinal: number;
  totalGross: number;
  totalNet: number;
  firstReceived: number;
  bonusReceived: number;
  actualReceived: number;
}

interface SalaryBatch {
  id: number;
  filename: string;
  month: number;
  year: number;
  totalRows: number;
  createdAt: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(v || 0));
const fmtShort = (v: number) => {
  if (!v) return "—";
  if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(1).replace(".0", "") + "T";
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1).replace(".0", "") + "M";
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(0) + "K";
  return fmt(v);
};

type ColDef = {
  key: keyof SalaryDetail;
  label: string;
  editable: boolean;
  type: "text" | "number";
  width: number;
};
type ColGroup = {
  label: string;
  color: string;
  textColor: string;
  cols: ColDef[];
};

const COLUMN_GROUPS: ColGroup[] = [
  {
    label: "Thông tin nhân sự",
    color: "#1e293b",
    textColor: "#fff",
    cols: [
      {
        key: "employeeCode",
        label: "Mã NV",
        width: 90,
        editable: false,
        type: "text",
      },
      {
        key: "fullName",
        label: "Họ & Tên",
        width: 180,
        editable: false,
        type: "text",
      },
      {
        key: "position",
        label: "Chức vụ",
        width: 150,
        editable: true,
        type: "text",
      },
      { key: "type", label: "Sheet", width: 90, editable: true, type: "text" },
      { key: "grade", label: "Ngạch", width: 90, editable: true, type: "text" },
      {
        key: "insuranceLevel",
        label: "Bậc BH",
        width: 80,
        editable: true,
        type: "text",
      },
      {
        key: "workingDays",
        label: "Ngày công",
        width: 90,
        editable: true,
        type: "number",
      },
      {
        key: "notOfficial",
        label: "Chưa KH",
        width: 80,
        editable: true,
        type: "number",
      },
    ],
  },
  {
    label: "Lương cố định & phụ cấp",
    color: "#1d4ed8",
    textColor: "#fff",
    cols: [
      {
        key: "baseSalary",
        label: "Lương CB",
        width: 120,
        editable: true,
        type: "number",
      },
      {
        key: "efficiencySalary",
        label: "Lương HQ",
        width: 120,
        editable: true,
        type: "number",
      },
      {
        key: "salary70",
        label: "Lương 70%",
        width: 120,
        editable: true,
        type: "number",
      },
      {
        key: "phoneAllowance",
        label: "PC Xăng/ĐT",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "seniorityAllowance",
        label: "PC Thâm niên",
        width: 120,
        editable: true,
        type: "number",
      },
      {
        key: "mealAllowance",
        label: "PC Ăn trưa",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "maternityAllowance",
        label: "PC Thai sản",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "houseAllowance",
        label: "PC Thuê nhà",
        width: 110,
        editable: true,
        type: "number",
      },
    ],
  },
  {
    label: "Năng suất",
    color: "#6d28d9",
    textColor: "#fff",
    cols: [
      {
        key: "productivitySalary",
        label: "Lương NS",
        width: 120,
        editable: true,
        type: "number",
      },
      {
        key: "productivityOther",
        label: "NS Khác",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "productivitySCC",
        label: "NS SCC",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "productivityPaint",
        label: "NS Sơn",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "productivityAccessory",
        label: "NS PT",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "productivityParts",
        label: "NS PKK",
        width: 110,
        editable: true,
        type: "number",
      },
    ],
  },
  {
    label: "Thưởng & Tăng thêm",
    color: "#065f46",
    textColor: "#fff",
    cols: [
      {
        key: "bonusDay10",
        label: "Thưởng 10",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "bonusDay25",
        label: "Thưởng 25",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "salaryAdjust",
        label: "Bù lương",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "bonus",
        label: "Thưởng khác",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "otherWork",
        label: "Công khác",
        width: 110,
        editable: true,
        type: "number",
      },
      {
        key: "overtime15",
        label: "OT 150%",
        width: 100,
        editable: true,
        type: "number",
      },
      {
        key: "overtime2",
        label: "OT 200%",
        width: 100,
        editable: true,
        type: "number",
      },
      {
        key: "overtime3",
        label: "OT 300%",
        width: 100,
        editable: true,
        type: "number",
      },
      {
        key: "overtime",
        label: "OT tổng",
        width: 100,
        editable: true,
        type: "number",
      },
      {
        key: "otherIncome",
        label: "Thu nhập khác",
        width: 120,
        editable: true,
        type: "number",
      },
    ],
  },
  {
    label: "Khấu trừ",
    color: "#9f1239",
    textColor: "#fff",
    cols: [
      {
        key: "salaryDeduction",
        label: "Trừ lương (đầu)",
        width: 130,
        editable: true,
        type: "number",
      },
      {
        key: "insuranceDeduction",
        label: "BHXH-YT 9.5%",
        width: 130,
        editable: true,
        type: "number",
      },
      {
        key: "unemploymentInsu",
        label: "BHTN 1%",
        width: 100,
        editable: true,
        type: "number",
      },
      {
        key: "unionFee",
        label: "Công đoàn",
        width: 100,
        editable: true,
        type: "number",
      },
      {
        key: "advancePayment",
        label: "Tạm ứng",
        width: 100,
        editable: true,
        type: "number",
      },
      {
        key: "socialWorkDeduction",
        label: "Trừ XH",
        width: 90,
        editable: true,
        type: "number",
      },
      {
        key: "healthCardDeduction",
        label: "Thẻ y tế",
        width: 90,
        editable: true,
        type: "number",
      },
      {
        key: "insuranceArrears",
        label: "BH nợ",
        width: 90,
        editable: true,
        type: "number",
      },
      {
        key: "taxCompensation",
        label: "Bù thuế",
        width: 90,
        editable: true,
        type: "number",
      },
      {
        key: "taxTNCN",
        label: "Thuế TNCN",
        width: 100,
        editable: true,
        type: "number",
      },
      {
        key: "phoneDeduction",
        label: "Trừ ĐT",
        width: 90,
        editable: true,
        type: "number",
      },
      {
        key: "taxRefund",
        label: "Hoàn thuế",
        width: 100,
        editable: true,
        type: "number",
      },
      {
        key: "salaryDeductionFinal",
        label: "Trừ lương (cuối)",
        width: 130,
        editable: true,
        type: "number",
      },
    ],
  },
  {
    label: "Tổng hợp & Thực nhận",
    color: "#064e3b",
    textColor: "#fff",
    cols: [
      {
        key: "totalGross",
        label: "Tổng lương (1)",
        width: 130,
        editable: true,
        type: "number",
      },
      {
        key: "totalNet",
        label: "Tổng lương (2)",
        width: 130,
        editable: true,
        type: "number",
      },
      {
        key: "firstReceived",
        label: "NHẬN ĐỢT 1",
        width: 130,
        editable: true,
        type: "number",
      },
      {
        key: "bonusReceived",
        label: "Đã nhận thưởng",
        width: 130,
        editable: true,
        type: "number",
      },
      {
        key: "actualReceived",
        label: "NHẬN ĐỢT 2",
        width: 140,
        editable: true,
        type: "number",
      },
    ],
  },
];

const FLAT_COLS = COLUMN_GROUPS.flatMap((g, gi) =>
  g.cols.map((col, ci) => ({ ...col, groupIndex: gi, colIndex: ci })),
);

const SW0 = 90,
  SW1 = 180;

// ── EditableCell: memo + fully local state ────────────────────────────────────
const EditableCell = memo(function EditableCell({
  value,
  colType,
  isBold,
  highlight,
  align,
  onSave,
}: {
  value: any;
  colType: "text" | "number";
  isBold?: boolean;
  highlight?: string;
  align?: "left" | "right";
  onSave: (v: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState("");

  const display = editing
    ? temp
    : colType === "number"
      ? value === 0 || value == null
        ? "—"
        : fmt(value)
      : (value ?? "");

  return (
    <td
      style={{
        padding: 0,
        borderRight: "0.5px solid #e2e8f0",
        borderBottom: "0.5px solid #f1f5f9",
        background: highlight || "inherit",
      }}
    >
      <input
        type="text"
        inputMode={colType === "number" ? "numeric" : "text"}
        value={display}
        onFocus={() => {
          setEditing(true);
          setTemp(String(value ?? ""));
        }}
        onChange={(e) => setTemp(e.target.value)}
        onBlur={(e) => {
          setEditing(false);
          const raw = e.target.value;
          const next =
            colType === "number"
              ? parseFloat(raw.replace(/[^0-9.-]/g, "")) || 0
              : raw;
          if (next !== value) onSave(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setEditing(false);
            setTemp(String(value ?? ""));
          }
        }}
        style={{
          display: "block",
          width: "100%",
          border: editing ? "2px solid #3b82f6" : "none",
          outline: "none",
          background: editing ? "#eff6ff" : "transparent",
          padding: "10px 12px",
          fontSize: 12,
          fontWeight: isBold ? 600 : 400,
          textAlign: align ?? (colType === "number" ? "right" : "left"),
          color:
            !editing && colType === "number" && (value === 0 || value == null)
              ? "#cbd5e1"
              : "inherit",
          boxSizing: "border-box",
          borderRadius: editing ? 4 : 0,
        }}
      />
    </td>
  );
});

// ── SalaryRow: memo — only re-renders when this row's data object changes ──────
const SalaryRow = memo(function SalaryRow({
  row,
  rowIdx,
  onSave,
}: {
  row: SalaryDetail;
  rowIdx: number;
  onSave: (id: number, field: string, value: any) => void;
}) {
  const bg = rowIdx % 2 === 0 ? "#fff" : "#f8fafc";
  return (
    <tr
      style={{ background: bg }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#eff6ff";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = bg;
      }}
    >
      {FLAT_COLS.map((col) => {
        const {
          key,
          groupIndex: gi,
          colIndex: ci,
          editable,
          type,
          width,
        } = col;
        const isS0 = gi === 0 && ci === 0,
          isS1 = gi === 0 && ci === 1;
        const val = row[key] as any;

        if (!editable || isS0 || isS1) {
          return (
            <td
              key={key}
              style={{
                padding: "10px 12px",
                borderRight: "0.5px solid #e2e8f0",
                borderBottom: "0.5px solid #f1f5f9",
                position: isS0 || isS1 ? "sticky" : undefined,
                left: isS0 ? 0 : isS1 ? SW0 : undefined,
                zIndex: isS0 || isS1 ? 10 : undefined,
                background: bg,
                fontWeight: isS1 ? 600 : 400,
                color: isS0 ? "#1d4ed8" : "#0f172a",
                fontSize: isS0 ? 11 : 12,
                fontFamily: isS0 ? "monospace" : undefined,
                whiteSpace: "nowrap",
                minWidth: width,
                width,
              }}
            >
              {type === "number"
                ? val === 0 || val == null
                  ? "—"
                  : fmt(val)
                : (val ?? "—")}
            </td>
          );
        }

        return (
          <EditableCell
            key={key}
            value={val}
            colType={type}
            isBold={key === "actualReceived"}
            highlight={
              key === "actualReceived"
                ? "#dcfce7"
                : key === "totalGross" || key === "totalNet"
                  ? "#f0f9ff"
                  : undefined
            }
            align={type === "text" ? "left" : "right"}
            onSave={(v) => onSave(row.id, key, v)}
          />
        );
      })}
    </tr>
  );
});

// ── TableHeader: memo — never re-renders ──────────────────────────────────────
const TableHeader = memo(function TableHeader() {
  return (
    <thead style={{ position: "sticky", top: 0, zIndex: 50 }}>
      <tr>
        {COLUMN_GROUPS.map((g, gi) => (
          <th
            key={g.label}
            colSpan={g.cols.length}
            style={{
              background: g.color,
              color: g.textColor,
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 11,
              textAlign: "center",
              letterSpacing: "0.05em",
              borderRight: "1px solid rgba(255,255,255,0.15)",
              position: gi === 0 ? "sticky" : undefined,
              left: gi === 0 ? 0 : undefined,
              zIndex: gi === 0 ? 60 : undefined,
            }}
          >
            {g.label}
          </th>
        ))}
      </tr>
      <tr style={{ background: "#f1f5f9" }}>
        {FLAT_COLS.map((col) => {
          const isS0 = col.groupIndex === 0 && col.colIndex === 0;
          const isS1 = col.groupIndex === 0 && col.colIndex === 1;
          return (
            <th
              key={col.key}
              style={{
                padding: "9px 12px",
                fontWeight: 600,
                fontSize: 11,
                color: "#475569",
                textAlign: col.type === "text" ? "left" : "right",
                borderRight: "0.5px solid #e2e8f0",
                borderBottom: "1px solid #cbd5e1",
                minWidth: col.width,
                width: col.width,
                position: isS0 || isS1 ? "sticky" : undefined,
                left: isS0 ? 0 : isS1 ? SW0 : undefined,
                zIndex: isS0 || isS1 ? 45 : undefined,
                background: "#f1f5f9",
              }}
            >
              {col.label}
            </th>
          );
        })}
      </tr>
    </thead>
  );
});

// ── TableFooter: memo — re-renders only when filtered list changes ─────────────
const TableFooter = memo(function TableFooter({
  rows,
}: {
  rows: SalaryDetail[];
}) {
  return (
    <tfoot>
      <tr style={{ background: "#1e293b", position: "sticky", bottom: 0 }}>
        {FLAT_COLS.map((col) => {
          const isS0 = col.groupIndex === 0 && col.colIndex === 0;
          const isS1 = col.groupIndex === 0 && col.colIndex === 1;
          const isActual = col.key === "actualReceived";
          const total =
            col.type === "number"
              ? rows.reduce((a, r) => a + ((r[col.key] as number) || 0), 0)
              : null;
          if (isS0)
            return (
              <td
                key={col.key}
                style={{
                  padding: "12px",
                  color: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 700,
                  position: "sticky",
                  left: 0,
                  background: "#1e293b",
                  zIndex: 10,
                  width: SW0,
                }}
              >
                TỔNG
              </td>
            );
          if (isS1)
            return (
              <td
                key={col.key}
                style={{
                  padding: "12px",
                  color: "#64748b",
                  fontSize: 11,
                  position: "sticky",
                  left: SW0,
                  background: "#1e293b",
                  zIndex: 10,
                  width: SW1,
                }}
              >
                {rows.length} nhân viên
              </td>
            );
          return (
            <td
              key={col.key}
              style={{
                padding: "12px",
                textAlign: "right",
                fontSize: 12,
                fontWeight: total ? 700 : 400,
                color: isActual ? "#4ade80" : total ? "#e2e8f0" : "#334155",
                borderRight: "0.5px solid rgba(255,255,255,0.08)",
              }}
            >
              {col.type === "number" && total ? fmtShort(total) : ""}
            </td>
          );
        })}
      </tr>
    </tfoot>
  );
});

// ── SummaryCard ───────────────────────────────────────────────────────────────
const SummaryCard = memo(function SummaryCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #e2e8f0",
        borderRadius: 12,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        minWidth: 0,
        flex: "1 1 190px",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#0f172a",
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
});

// ── MAIN ──────────────────────────────────────────────────────────────────────
interface Props {
  batch: SalaryBatch;
  onClose: () => void;
  onInlineEdit?: (id: number, field: string, value: any) => Promise<void>;
}

export const SalaryDetailModal: React.FC<Props> = ({
  batch,
  onClose,
  onInlineEdit,
}) => {
  const [details, setDetails] = useState<SalaryDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/salary/batch/${batch.id}/details`);
        const data = await res.json();
        if (!cancelled) setDetails(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batch.id]);

  const types = useMemo(
    () => [...new Set(details.map((d) => d.type).filter(Boolean))],
    [details],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return details.filter((s) => {
      const ms =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.employeeCode.toLowerCase().includes(q) ||
        (s.position || "").toLowerCase().includes(q);
      return ms && (!typeFilter || s.type === typeFilter);
    });
  }, [details, search, typeFilter]);

  const totals = useMemo(
    () => ({
      gross: filtered.reduce((a, s) => a + s.totalGross, 0),
      actual: filtered.reduce((a, s) => a + s.actualReceived, 0),
      deduction: filtered.reduce(
        (a, s) =>
          a +
          s.insuranceDeduction +
          s.unemploymentInsu +
          s.unionFee +
          s.taxTNCN +
          s.advancePayment,
        0,
      ),
    }),
    [filtered],
  );

  // Stable reference — won't break SalaryRow memo
  const handleSave = useCallback(
    async (id: number, field: string, value: any) => {
      setDetails((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      );
      try {
        if (onInlineEdit) await onInlineEdit(id, field, value);
        else
          await fetch(`/api/salary/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: value }),
          });
      } catch {
        console.error("Save error");
      }
    },
    [onInlineEdit],
  );

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 101,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "calc(100vh - 32px)",
            background: "#f8fafc",
            borderRadius: "20px 20px 0 0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "all",
            boxShadow: "0 -4px 40px rgba(0,0,0,0.15)",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              background: "#fff",
              borderBottom: "0.5px solid #e2e8f0",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexShrink: 0,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#1e293b",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: "#64748b",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                THÁNG
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {batch.month}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Chi tiết bảng lương tháng {batch.month}/{batch.year}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "#94a3b8",
                  marginTop: 2,
                }}
              >
                {batch.filename} · {batch.totalRows} nhân viên ·{" "}
                {new Date(batch.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 11,
                color: "#1d4ed8",
                fontWeight: 500,
              }}
            >
              <Info size={12} /> Tự động lưu khi chỉnh sửa
            </div>
            <button
              onClick={() => alert("Tính năng đang phát triển.")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                background: "#f1f5f9",
                border: "0.5px solid #e2e8f0",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              <Download size={15} /> Xuất Excel
            </button>
            <button
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                border: "0.5px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
                flexShrink: 0,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* SUMMARY */}
          <div
            style={{
              padding: "12px 24px",
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              background: "#f8fafc",
              borderBottom: "0.5px solid #e2e8f0",
              flexShrink: 0,
            }}
          >
            <SummaryCard
              label="Nhân sự"
              value={filtered.length.toString()}
              sub={`/ ${details.length} tổng`}
              color="#f1f5f9"
              icon={<Users size={18} style={{ color: "#475569" }} />}
            />
            <SummaryCard
              label="Tổng gross"
              value={fmtShort(totals.gross) + " ₫"}
              sub={fmt(totals.gross) + " VNĐ"}
              color="#eff6ff"
              icon={<TrendingUp size={18} style={{ color: "#1d4ed8" }} />}
            />
            <SummaryCard
              label="Tổng khấu trừ"
              value={fmtShort(totals.deduction) + " ₫"}
              sub={fmt(totals.deduction) + " VNĐ"}
              color="#fff1f2"
              icon={<TrendingDown size={18} style={{ color: "#e11d48" }} />}
            />
            <SummaryCard
              label="Tổng thực nhận"
              value={fmtShort(totals.actual) + " ₫"}
              sub={fmt(totals.actual) + " VNĐ"}
              color="#f0fdf4"
              icon={<DollarSign size={18} style={{ color: "#16a34a" }} />}
            />
          </div>

          {/* FILTER */}
          <div
            style={{
              padding: "12px 24px",
              background: "#fff",
              borderBottom: "0.5px solid #e2e8f0",
              flexShrink: 0,
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Tìm tên, mã nhân viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: 32,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  border: "0.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                  background: "#f8fafc",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Tất cả", ...types].map((t) => {
                const active =
                  t === "Tất cả" ? typeFilter === "" : typeFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t === "Tất cả" ? "" : t)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 8,
                      border: active
                        ? "1px solid #3b82f6"
                        : "0.5px solid #e2e8f0",
                      background: active ? "#eff6ff" : "#fff",
                      color: active ? "#1d4ed8" : "#64748b",
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TABLE */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {loading ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  color: "#94a3b8",
                }}
              >
                <Loader2
                  size={32}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <p style={{ fontSize: 13, fontWeight: 500 }}>
                  Đang tải dữ liệu...
                </p>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  color: "#94a3b8",
                }}
              >
                <Search size={36} style={{ opacity: 0.4 }} />
                <p style={{ fontSize: 14, fontWeight: 500 }}>
                  Không tìm thấy nhân viên phù hợp
                </p>
              </div>
            ) : (
              <table
                style={{
                  borderCollapse: "collapse",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  tableLayout: "fixed",
                  width: "max-content",
                }}
              >
                <TableHeader />
                <tbody>
                  {filtered.map((row, idx) => (
                    <SalaryRow
                      key={row.id}
                      row={row}
                      rowIdx={idx}
                      onSave={handleSave}
                    />
                  ))}
                </tbody>
                <TableFooter rows={filtered} />
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SalaryDetailModal;
