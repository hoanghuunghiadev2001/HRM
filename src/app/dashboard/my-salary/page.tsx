/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// SalaryDashboard.tsx — Phiên bản đầy đủ tất cả trường DB
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  X,
  ShieldCheck,
  ArrowUpRight,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs"; // Đảm bảo đã import dayjs

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v ?? 0);

// ─── Nhóm các trường hiển thị theo schema ───────────────────────────────────
const SALARY_SECTIONS = [
  {
    key: "fixed",
    label: "Lương cố định",
    fields: [
      { key: "baseSalary", label: "Lương cơ bản (BHXH + PC)" },
      { key: "efficiencySalary", label: "Lương hiệu quả" },
      { key: "salary70", label: "Lương 70%" },
    ],
  },
  {
    key: "allowance",
    label: "Phụ cấp",
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
    label: "Thưởng & cộng thêm",
    fields: [
      { key: "bonusDay10", label: "Thưởng ngày 10" },
      { key: "bonusDay25", label: "Thưởng ngày 25" },
      { key: "overtime", label: "Tăng ca (OT)" },
      { key: "bonus", label: "Thưởng" },
      { key: "salaryAdjust", label: "Điều chỉnh lương" },
      { key: "otherWork", label: "Công việc khác" },
      { key: "otherIncome", label: "Thu nhập khác" },
    ],
  },
  {
    key: "deduction",
    label: "Khấu trừ",
    negative: true,
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
    fields: [
      { key: "totalGross", label: "Tổng lương Gross (1)" },
      { key: "totalNet", label: "Tổng lương Net (2)" },
      { key: "firstReceived", label: "Đã nhận lần 1" },
      { key: "bonusReceived", label: "Đã nhận thưởng" },
    ],
  },
];

// ─── Component chính ─────────────────────────────────────────────────────────
export default function SalaryDashboard() {
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSalary, setSelectedSalary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/my-salary/report?year=${selectedYear}`);
        const json = await res.json();
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
      return { total: 0, avg: 0, deductions: 0, maxMonth: "N/A" };
    const total = data.reduce((s, d) => s + (d.totalMonthlyNet ?? 0), 0);
    const deductions = data.reduce((s, d) => s + (d.totalDeductions ?? 0), 0);
    const maxVal = Math.max(...data.map((d) => d.totalMonthlyNet ?? 0));
    const maxObj = data.find((d) => d.totalMonthlyNet === maxVal);
    return {
      total,
      avg: total / data.length,
      deductions,
      maxMonth: maxObj ? `Tháng ${maxObj.month}` : "N/A",
    };
  }, [data]);

  const onChange = (date: any, dateString: any) => {
    setSelectedYear(dateString);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">
            Đang tải dữ liệu {selectedYear}...
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lương của tôi</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Báo cáo thu nhập năm {selectedYear}
          </p>
        </div>
        <div className="flex gap-2 bg-white border border-slate-200 p-1 rounded-xl">
          <DatePicker
            picker="year"
            placeholder="Chọn năm"
            // Chuyển số 2026 thành object dayjs để hiển thị
            value={selectedYear ? dayjs(`${selectedYear}-01-01`) : null}
            allowClear={false}
            onChange={(date) => {
              if (date) {
                // Chỉ lấy con số năm (vd: 2026) để lưu vào state
                setSelectedYear(date.year());
              }
            }}
            // Tailwind để đồng bộ giao diện cũ
            className="rounded-xl border-none shadow-none hover:bg-slate-50 transition-all font-medium text-sm"
            suffixIcon={null} // Ẩn icon lịch nếu muốn giống nút bấm cũ
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Tổng thực nhận",
            value: fmt(stats.total),
            icon: <Wallet size={16} />,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Trung bình/tháng",
            value: fmt(stats.avg),
            icon: <TrendingUp size={16} />,
            color: "text-indigo-600 bg-indigo-50",
          },
          {
            label: "Tổng khấu trừ",
            value: fmt(stats.deductions),
            icon: <ShieldCheck size={16} />,
            color: "text-rose-600 bg-rose-50",
          },
          {
            label: "Tháng cao nhất",
            value: stats.maxMonth,
            icon: <ArrowUpRight size={16} />,
            color: "text-emerald-600 bg-emerald-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 p-4"
          >
            <div
              className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}
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

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <p className="text-sm font-semibold text-slate-700 mb-4">
          Biến động thu nhập
        </p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
                dy={8}
              />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-sm">
                      <p className="text-slate-400 text-xs mb-0.5">
                        Tháng {payload[0]?.payload?.month}
                      </p>
                      <p className="font-bold">
                        {fmt(payload[0]?.value as number)}
                      </p>
                    </div>
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="totalMonthlyNet"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#grad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <p className="font-semibold text-slate-800">Lịch sử kỳ lương</p>
          <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
            {data.length} kỳ
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-50">
                <th className="px-6 py-3 text-left font-medium">Kỳ lương</th>
                <th className="px-6 py-3 text-left font-medium">Loại</th>
                <th className="px-6 py-3 text-right font-medium">Tổng gross</th>
                <th className="px-6 py-3 text-right font-medium">Khấu trừ</th>
                <th className="px-6 py-3 text-right font-medium">Lần 1</th>
                <th className="px-6 py-3 text-right font-medium">Thực nhận</th>
                <th className="px-6 py-3 text-center font-medium">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={`${item.month}-${item.type}`}
                  onClick={() => setSelectedSalary(item)}
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Tháng {item.month}/{item.year}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        item.type === "MANAGER"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {fmt(item.totalGross)}
                  </td>
                  <td className="px-6 py-4 text-right text-rose-500">
                    -{fmt(item.totalDeductions)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {fmt(item.firstReceived)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">
                    {fmt(item.totalMonthlyNet)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors">
                      <Eye size={14} /> Xem
                    </button>
                  </td>
                </tr>
              ))}
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
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  T{item.month}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Tháng {item.month}/{item.year}
                  </p>
                  <p className="text-xs text-slate-400">
                    Gross: {fmt(item.totalGross)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-blue-600">
                  {fmt(item.totalMonthlyNet)}
                </p>
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

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

// ─── Drawer chi tiết ─────────────────────────────────────────────────────────
function SalaryDetailDrawer({
  salary,
  onClose,
}: {
  salary: any;
  onClose: () => void;
}) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

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
      pdf.save(`Phieu-Luong-${salary.month}-${salary.year}.pdf`);
    } catch (e) {
      alert("Lỗi xuất PDF!");
    }
  };

  const handleReviewRequest = async () => {
    const reason = window.prompt("Lý do rà soát:");
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

  const totalMonthlyNet =
    (salary.firstReceived ?? 0) + (salary.actualReceived ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28 }}
        className="bg-white w-full max-w-2xl h-[93vh] md:h-[88vh] rounded-t-3xl md:rounded-3xl flex flex-col overflow-hidden"
      >
        {/* Drawer header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="font-bold text-lg">
              Phiếu lương tháng {salary.month}/{salary.year}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {salary.fullName} · {salary.position ?? "—"} · {salary.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div ref={pdfRef} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Thông tin nhân viên */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl">
              {[
                { label: "Mã nhân viên", value: salary.employeeCode },
                { label: "Họ tên", value: salary.fullName },
                { label: "Chức vụ", value: salary.position ?? "—" },
                { label: "Ngạch", value: salary.grade ?? "—" },
                { label: "Bậc BHXH", value: salary.insuranceLevel ?? "—" },
                { label: "Loại HĐ", value: salary.contractType ?? "—" },
                {
                  label: "Ngày ký HĐ",
                  value: salary.contractDate
                    ? new Date(salary.contractDate).toLocaleDateString("vi-VN")
                    : "—",
                },
                {
                  label: "Ngày công",
                  value: `${salary.workingDays ?? 0} ngày`,
                },
                {
                  label: "Chưa chính thức",
                  value: `${salary.notOfficial ?? 0} ngày`,
                },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-slate-400">{f.label}</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">
                    {f.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Các nhóm lương */}
            {SALARY_SECTIONS.map((section) => {
              const hasValue = section.fields.some(
                (f) => (salary[f.key] ?? 0) !== 0,
              );
              return (
                <div key={section.key}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block ${
                        section.key === "deduction"
                          ? "bg-rose-400"
                          : section.key === "payment"
                            ? "bg-blue-500"
                            : "bg-slate-300"
                      }`}
                    />
                    {section.label}
                  </p>
                  <div
                    className={`grid grid-cols-2 gap-2 ${
                      section.key === "deduction"
                        ? "bg-rose-50/40"
                        : section.key === "payment"
                          ? "bg-blue-50/40"
                          : ""
                    } rounded-2xl ${section.key !== "fixed" && "p-0"}`}
                  >
                    {section.fields.map((f) => {
                      const v: number = salary[f.key] ?? 0;
                      const isNeg = section.negative && f.key !== "taxRefund";
                      const isPos = f.key === "taxRefund";
                      return (
                        <div
                          key={f.key}
                          className="bg-white rounded-xl border border-slate-100 px-3.5 py-3"
                        >
                          <p className="text-xs text-slate-400 mb-1">
                            {f.label}
                          </p>
                          <p
                            className={`text-sm font-semibold truncate ${
                              isNeg && v > 0
                                ? "text-rose-600"
                                : isPos && v > 0
                                  ? "text-emerald-600"
                                  : v > 0
                                    ? "text-slate-800"
                                    : "text-slate-300"
                            }`}
                          >
                            {isNeg && v > 0 ? "-" : ""}
                            {fmt(Math.abs(v))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Net banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">
                  Thực nhận cả tháng (lần 1 + còn lại)
                </p>
                <p className="text-2xl font-bold">{fmt(totalMonthlyNet)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs">
                  Lần 1: {fmt(salary.firstReceived ?? 0)}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Còn lại: {fmt(salary.actualReceived ?? 0)}
                </p>
                {(salary.bonusReceived ?? 0) > 0 && (
                  <p className="text-emerald-400 text-xs mt-1">
                    Thưởng: +{fmt(salary.bonusReceived)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Printer size={15} /> Tải PDF
          </button>
          <button
            onClick={handleReviewRequest}
            disabled={isSending}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <AlertCircle size={15} />{" "}
            {isSending ? "Đang gửi..." : "Yêu cầu rà soát"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
