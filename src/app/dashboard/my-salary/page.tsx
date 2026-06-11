/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  X,
  ShieldCheck,
  ArrowUpRight,
  AlertCircle,
  Printer,
  ChevronRight,
  Eye,
  ChevronDown,
  BadgeCheck,
  Calendar,
  User,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DatePicker, Tag } from "antd";
import dayjs from "dayjs";

// ─── Format ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v ?? 0);

const short = (v: number) => {
  if (!v) return "0";
  if (Math.abs(v) >= 1_000_000_000)
    return (v / 1_000_000_000).toFixed(1) + " tỷ";
  if (Math.abs(v) >= 1_000_000) return Math.round(v / 1_000_000) + " tr";
  return Math.round(v / 1_000) + "k";
};

// ─── Schema sections ─────────────────────────────────────────────────────────
const SALARY_SECTIONS = [
  {
    key: "fixed",
    label: "Lương cố định",
    color: "indigo",
    fields: [
      { key: "baseSalary", label: "Lương cơ bản (BHXH + PC)" },
      { key: "efficiencySalary", label: "Lương hiệu quả" },
      { key: "salary70", label: "Lương 70%" },
    ],
  },
  {
    key: "allowance",
    label: "Phụ cấp",
    color: "violet",
    fields: [
      { key: "phoneAllowance", label: "Phụ cấp điện thoại" },
      { key: "seniorityAllowance", label: "Phụ cấp thâm niên" },
      { key: "mealAllowance", label: "Phụ cấp ăn ca" },
      { key: "maternityAllowance", label: "Phụ cấp thai sản" },
      { key: "houseAllowance", label: "Phụ cấp thuê nhà" },
    ],
  },
  {
    key: "productivity",
    label: "Năng suất",
    color: "sky",
    fields: [
      { key: "productivitySalary", label: "Lương năng suất" },
      { key: "productivityOther", label: "Năng suất khác" },
      { key: "productivitySCC", label: "Năng suất SCC" },
      { key: "productivityPaint", label: "Năng suất sơn" },
      { key: "productivityAccessory", label: "Năng suất phụ kiện" },
      { key: "productivityParts", label: "Năng suất phụ tùng" },
    ],
  },
  {
    key: "bonus",
    label: "Thưởng & Cộng thêm",
    color: "emerald",
    fields: [
      { key: "bonusDay10", label: "Thưởng ngày 10" },
      { key: "bonusDay25", label: "Thưởng ngày 25" },
      { key: "bonus", label: "Thưởng" },
      { key: "otherWork", label: "Công việc khác" },
      { key: "salaryAdjust", label: "Điều chỉnh lương" },
      { key: "otherIncome", label: "Thu nhập khác" },
    ],
  },
  {
    key: "overtime", // Đổi tên key thống nhất đại diện cho mục tăng ca
    label: "Tăng ca",
    color: "amber", // Đồng bộ màu amber (vàng cam) tương ứng bảng màu COLOR
    fields: [
      { key: "overtime15", label: "Giờ tăng ca x1.5" },
      { key: "overtime2", label: "Giờ tăng ca x2" },
      { key: "overtime3", label: "Giờ tăng ca x3" },
      { key: "overtime", label: "Tiền tăng ca (tổng)" },
    ],
  },
  {
    key: "deduction",
    label: "Khấu trừ",
    color: "rose",
    negative: true, // Chỉ giữ negative cho khoản khấu trừ lương
    fields: [
      { key: "salaryDeduction", label: "Trừ lương đầu kỳ" },
      { key: "insuranceDeduction", label: "BHXH-YT (9.5%)" },
      { key: "unemploymentInsu", label: "BHTN (1%)" },
      { key: "unionFee", label: "Công đoàn phí" },
      { key: "advancePayment", label: "Tạm ứng" },
      { key: "socialWorkDeduction", label: "KT bảo hiểm xã hội" },
      { key: "healthCardDeduction", label: "Thẻ sức khỏe" },
      { key: "insuranceArrears", label: "Nợ BHXH" },
      { key: "taxCompensation", label: "Bù thuế" },
      { key: "taxTNCN", label: "Thuế TNCN" },
      { key: "phoneDeduction", label: "Khấu trừ điện thoại" },
      { key: "taxRefund", label: "Hoàn thuế" },
      { key: "salaryDeductionFinal", label: "Trừ lương cuối kỳ" },
    ],
  },
  {
    key: "payment",
    label: "Thanh toán",
    color: "blue",
    fields: [
      { key: "totalGross", label: "Tổng lương Gross (1)" },
      { key: "totalNet", label: "Tổng lương Net (2)" },
      { key: "firstReceived", label: "Đã nhận lần 1" },
      { key: "actualReceived", label: "Nhận lần 2" },
      { key: "bonusReceived", label: "Đã nhận thưởng" },
    ],
  },
];

// ─── Color map ────────────────────────────────────────────────────────────────
const COLOR: Record<
  string,
  { bg: string; text: string; dot: string; badge: string }
> = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-400",
    badge: "bg-indigo-100 text-indigo-700",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-400",
    badge: "bg-violet-100 text-violet-700",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-400",
    badge: "bg-sky-100 text-sky-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    dot: "bg-rose-400",
    badge: "bg-rose-100 text-rose-600",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
};

// ─── SectionBlock ─────────────────────────────────────────────────────────────
function SectionBlock({
  section,
  salary,
}: {
  section: (typeof SALARY_SECTIONS)[0];
  salary: any;
}) {
  const [open, setOpen] = useState(true);
  const c = COLOR[section.color] ?? COLOR.indigo;

  // Hàm helper lấy giá trị linh hoạt (chấp nhận cả viết hoa, viết thường từ API)
  const getValue = (key: string): number => {
    if (salary[key] !== undefined) return Number(salary[key] || 0);

    // Nếu không tìm thấy key viết thường, thử tìm bản viết hoa chữ cái đầu (ví dụ: overtime15 -> Overtime15)
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    if (salary[capitalizedKey] !== undefined)
      return Number(salary[capitalizedKey] || 0);

    // Thử tìm bản viết hoa toàn bộ (ví dụ: overtime -> OVERTIME)
    const upperKey = key.toUpperCase();
    if (salary[upperKey] !== undefined) return Number(salary[upperKey] || 0);

    return 0;
  };

  // Kiểm tra xem trong section này có trường nào có dữ liệu > 0 không
  const hasAny = section.fields.some((f) => getValue(f.key) !== 0);

  if (!hasAny && section.key !== "payment" && section.key !== "overtime")
    return null;

  // Tính tổng của section
  const totalSection = section.fields.reduce((acc, f) => {
    const v = getValue(f.key);
    const isNeg = (section as any).negative && f.key !== "taxRefund";
    return acc + (isNeg ? -v : v);
  }, 0);

  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${c.dot}`} />
          <span className="text-sm font-semibold text-slate-700">
            {section.label}
          </span>
          {totalSection !== 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}
            >
              {(section as any).negative && totalSection < 0 ? "−" : ""}
              {short(Math.abs(totalSection))}
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`px-5 pb-4 pt-1 ${c.bg}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {section.fields.map((f) => {
                  const v = getValue(f.key);
                  const isNeg =
                    (section as any).negative && f.key !== "taxRefund";
                  const isRefund = f.key === "taxRefund";
                  const textCls =
                    isNeg && v > 0
                      ? "text-rose-600 font-semibold"
                      : isRefund && v > 0
                        ? "text-emerald-600 font-semibold"
                        : v > 0
                          ? `${c.text} font-semibold`
                          : "text-slate-300";

                  return (
                    <div
                      key={f.key}
                      className="bg-white rounded-xl px-4 py-3 flex items-center justify-between gap-2 border border-slate-100"
                    >
                      <span className="text-xs text-slate-500 leading-tight">
                        {f.label}
                      </span>
                      <span
                        className={`text-sm whitespace-nowrap ml-2 ${textCls}`}
                      >
                        {isNeg && v > 0 ? "−" : isRefund && v > 0 ? "+" : ""}
                        {fmt(Math.abs(v))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ─── Drawer ───────────────────────────────────────────────────────────────────
function SalaryDetailDrawer({
  salary,
  onClose,
}: {
  salary: any;
  onClose: () => void;
}) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  const totalMonthlyNet =
    (salary.firstReceived ?? 0) + (salary.actualReceived ?? 0);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        backgroundColor: "#fff",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        w,
        (canvas.height * w) / canvas.width,
      );
      pdf.save(`PhieuLuong-T${salary.month}-${salary.year}.pdf`);
    } catch {
      alert("Lỗi xuất PDF!");
    }
  };

  const handleReviewRequest = async () => {
    const reason = window.prompt("Lý do yêu cầu rà soát:");
    if (!reason) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/my-salary/request-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: salary.month,
          year: salary.year,
          reason,
        }),
      });
      alert(res.ok ? "✅ Gửi yêu cầu thành công!" : "❌ Gửi thất bại.");
    } catch {
      alert("❌ Lỗi kết nối.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-white w-full max-w-2xl h-[95vh] md:h-[92vh] rounded-t-3xl md:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div
          ref={pdfRef}
          className="flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          }}
        >
          <div className="px-6 pt-5 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                  <BadgeCheck size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Phiếu lương</p>
                  <h2 className="font-bold text-white text-lg leading-tight">
                    Tháng {salary.month}/{salary.year}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={15} className="text-white" />
              </button>
            </div>

            {/* Employee info row */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <User size={12} />, val: salary.fullName },
                { icon: <Briefcase size={12} />, val: salary.position ?? "—" },
                {
                  icon: <Calendar size={12} />,
                  val: `${salary.workingDays ?? 0} ngày công`,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1"
                >
                  <span className="text-white/60">{item.icon}</span>
                  <span className="text-white text-xs">{item.val}</span>
                </div>
              ))}
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  salary.type === "MANAGER"
                    ? "bg-violet-400/30 text-violet-100"
                    : "bg-slate-400/30 text-slate-100"
                }`}
              >
                {salary.type}
              </span>
            </div>

            {/* Net banner inside header */}
            <div className="mt-5 bg-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs mb-1">Thực nhận cả tháng</p>
                <p className="text-white text-2xl font-bold">
                  {fmt(totalMonthlyNet)}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Lần 1: {fmt(salary.firstReceived ?? 0)}
                  &nbsp;·&nbsp; Còn lại: {fmt(salary.actualReceived ?? 0)}
                  {(salary.bonusReceived ?? 0) > 0 && (
                    <span className="text-emerald-300">
                      &nbsp;·&nbsp;Thưởng: +{fmt(salary.bonusReceived)}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right space-y-2">
                <div>
                  <p className="text-white/40 text-[10px]">Tổng Gross</p>
                  <p className="text-white/80 text-sm font-semibold">
                    {fmt(salary.totalGross)}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px]">Tổng khấu trừ</p>
                  <p className="text-rose-300 text-sm font-semibold">
                    −{fmt(salary.totalDeductions ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-5 space-y-3">
            {/* Thông tin nhân viên */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Thông tin nhân viên
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                {[
                  { label: "Mã nhân viên", value: salary.employeeCode },
                  { label: "Ngạch", value: salary.grade ?? "—" },
                  { label: "Bậc BHXH", value: salary.insuranceLevel ?? "—" },
                  { label: "Loại hợp đồng", value: salary.contractType ?? "—" },
                  {
                    label: "Ngày ký HĐ",
                    value: salary.contractDate
                      ? new Date(salary.contractDate).toLocaleDateString(
                          "vi-VN",
                        )
                      : "—",
                  },
                  {
                    label: "Ngày chưa chính thức",
                    value: `${salary.notOfficial ?? 0} ngày`,
                  },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[11px] text-slate-400">{f.label}</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary sections */}
            {SALARY_SECTIONS.map((section) => (
              <SectionBlock
                key={section.key}
                section={section}
                salary={salary}
              />
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3 bg-white flex-shrink-0">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all"
          >
            <Printer size={15} /> Tải PDF
          </button>
          <button
            onClick={handleReviewRequest}
            disabled={isSending}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-2xl text-sm font-semibold hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all disabled:opacity-60"
          >
            <AlertCircle size={15} />
            {isSending ? "Đang gửi..." : "Yêu cầu rà soát"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl text-sm">
      <p className="text-slate-400 text-xs mb-1">
        Tháng {payload[0]?.payload?.month}
      </p>
      <p className="font-bold">{fmt(payload[0]?.value)}</p>
      {payload[1] && (
        <p className="text-rose-300 text-xs mt-0.5">
          −{fmt(payload[1]?.value)}
        </p>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SalaryDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedSalary, setSelectedSalary] = useState<any>(null);
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/my-salary/report?year=${selectedYear}`);
        const json = await res.json();

        // 👉 THÊM DÒNG NÀY ĐỂ KIỂM TRA DỮ LIỆU TRÊN TRÌNH DUYỆT
        console.log("Dữ liệu lương thô từ API:", json);

        setData(json.sort((a: any, b: any) => a.month - b.month));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  const stats = useMemo(() => {
    if (!data.length)
      return {
        total: 0,
        avg: 0,
        deductions: 0,
        maxMonth: "N/A",
        minMonth: "N/A",
      };
    const total = data.reduce((s, d) => s + (d.totalMonthlyNet ?? 0), 0);
    const deductions = data.reduce((s, d) => s + (d.totalDeductions ?? 0), 0);
    const maxVal = Math.max(...data.map((d) => d.totalMonthlyNet ?? 0));
    const minVal = Math.min(...data.map((d) => d.totalMonthlyNet ?? 0));
    const maxObj = data.find((d) => d.totalMonthlyNet === maxVal);
    const minObj = data.find((d) => d.totalMonthlyNet === minVal);
    return {
      total,
      avg: total / data.length,
      deductions,
      maxMonth: maxObj ? `Tháng ${maxObj.month}` : "N/A",
      minMonth: minObj ? `Tháng ${minObj.month}` : "N/A",
    };
  }, [data]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">
            Đang tải dữ liệu {selectedYear}...
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lương của tôi</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Báo cáo thu nhập năm {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DatePicker
            picker="year"
            placeholder="Chọn năm"
            value={dayjs(`${selectedYear}-01-01`)}
            allowClear={false}
            onChange={(date) => {
              if (date) setSelectedYear(date.year());
            }}
            className="rounded-xl border border-slate-200 bg-white shadow-none text-sm"
          />
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Tổng thực nhận",
            value: fmt(stats.total),
            icon: <Wallet size={16} />,
            iconCls: "bg-indigo-50 text-indigo-600",
          },
          {
            label: "Bình quân / tháng",
            value: fmt(stats.avg),
            icon: <TrendingUp size={16} />,
            iconCls: "bg-blue-50 text-blue-600",
          },
          {
            label: "Tổng khấu trừ",
            value: fmt(stats.deductions),
            icon: <ShieldCheck size={16} />,
            iconCls: "bg-rose-50 text-rose-600",
          },
          {
            label: "Tháng cao nhất",
            value: stats.maxMonth,
            icon: <ArrowUpRight size={16} />,
            iconCls: "bg-emerald-50 text-emerald-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-sm transition-shadow"
          >
            <div
              className={`w-8 h-8 rounded-xl ${s.iconCls} flex items-center justify-center mb-3`}
            >
              {s.icon}
            </div>
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-slate-700">
            Biến động thu nhập {selectedYear}
          </p>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(["area", "bar"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  chartType === t
                    ? "bg-white shadow text-slate-700"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t === "area" ? "Đường" : "Cột"}
              </button>
            ))}
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(v) => `T${v}`}
                  dy={8}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="totalGross"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  fill="url(#gradGross)"
                  strokeDasharray="4 2"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="totalMonthlyNet"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#gradNet)"
                  dot={{ fill: "#4f46e5", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#4f46e5" }}
                />
              </AreaChart>
            ) : (
              <BarChart data={data} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(v) => `T${v}`}
                  dy={8}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="totalMonthlyNet" radius={[6, 6, 0, 0]}>
                  {data.map((entry, i) => {
                    const max = Math.max(
                      ...data.map((d) => d.totalMonthlyNet ?? 0),
                    );
                    return (
                      <Cell
                        key={i}
                        fill={
                          entry.totalMonthlyNet === max ? "#4f46e5" : "#c7d2fe"
                        }
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        {chartType === "area" && (
          <div className="flex gap-4 mt-3 justify-end">
            {[
              { color: "#4f46e5", label: "Thực nhận" },
              { color: "#06b6d4", label: "Tổng Gross", dash: true },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  className="w-5 h-0.5"
                  style={{
                    background: l.color,
                    borderTop: l.dash
                      ? `2px dashed ${l.color}`
                      : `2px solid ${l.color}`,
                  }}
                />
                <span className="text-xs text-slate-400">{l.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <p className="font-semibold text-slate-800">Lịch sử kỳ lương</p>
          <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
            {data.length} kỳ
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-50">
                <th className="px-6 py-3 text-left font-medium">Kỳ lương</th>
                <th className="px-6 py-3 text-left font-medium">Loại</th>
                <th className="px-6 py-3 text-right font-medium">Ngày công</th>
                <th className="px-6 py-3 text-right font-medium">Tổng Gross</th>
                <th className="px-6 py-3 text-right font-medium">Khấu trừ</th>
                <th className="px-6 py-3 text-right font-medium">Nhận lần 1</th>
                <th className="px-6 py-3 text-right font-medium">Còn lại</th>
                <th className="px-6 py-3 text-right font-medium text-indigo-600">
                  Thực nhận
                </th>
                <th className="px-6 py-3 text-center font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={`${item.month}-${item.type}`}
                  onClick={() => setSelectedSalary(item)}
                  className="border-b border-slate-50 hover:bg-indigo-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    Tháng {item.month}/{item.year}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        item.type === "MANAGER"
                          ? "bg-violet-50 text-violet-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {item.workingDays ?? 0}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {fmt(item.totalGross)}
                  </td>
                  <td className="px-6 py-4 text-right text-rose-500">
                    −{fmt(item.totalDeductions)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    {fmt(item.firstReceived)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    {fmt(item.actualReceived)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-indigo-600">
                    {fmt(item.totalMonthlyNet)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
                      <Eye size={13} /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))}

              {/* Summary row */}
              {data.length > 0 && (
                <tr className="bg-indigo-50 font-semibold text-sm border-t-2 border-indigo-200">
                  <td className="px-6 py-3 text-indigo-700" colSpan={3}>
                    Tổng {data.length} kỳ
                  </td>
                  <td className="px-6 py-3 text-right text-slate-600">
                    {fmt(data.reduce((s, d) => s + (d.totalGross ?? 0), 0))}
                  </td>
                  <td className="px-6 py-3 text-right text-rose-500">
                    −
                    {fmt(
                      data.reduce((s, d) => s + (d.totalDeductions ?? 0), 0),
                    )}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-500">
                    {fmt(data.reduce((s, d) => s + (d.firstReceived ?? 0), 0))}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-500">
                    {fmt(data.reduce((s, d) => s + (d.actualReceived ?? 0), 0))}
                  </td>
                  <td className="px-6 py-3 text-right text-indigo-700">
                    {fmt(
                      data.reduce((s, d) => s + (d.totalMonthlyNet ?? 0), 0),
                    )}
                  </td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-slate-50">
          {data.map((item) => (
            <div
              key={`${item.month}-${item.type}`}
              onClick={() => setSelectedSalary(item)}
              className="p-4 flex items-center justify-between active:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  T{item.month}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Tháng {item.month}/{item.year}
                  </p>
                  <p className="text-xs text-slate-400">
                    Gross: {fmt(item.totalGross)} · Trừ:{" "}
                    {fmt(item.totalDeductions)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-indigo-600">
                  {fmt(item.totalMonthlyNet)}
                </p>
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">
              Không có dữ liệu lương năm {selectedYear}
            </p>
          </div>
        )}
      </div>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {selectedSalary && (
          <SalaryDetailDrawer
            salary={selectedSalary}
            onClose={() => setSelectedSalary(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
