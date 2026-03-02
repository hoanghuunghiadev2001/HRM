/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Eye,
  TrendingUp,
  Wallet,
  X,
  Calculator,
  ShieldCheck,
  ArrowUpRight,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
        const sortedData = json.sort((a: any, b: any) => a.month - b.month);
        setData(sortedData);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const stats = useMemo(() => {
    if (data.length === 0) return { total: 0, avg: 0, tax: 0, maxMonth: "N/A" };
    const total = data.reduce((acc, curr) => acc + curr.totalMonthlyNet, 0);
    const tax = data.reduce(
      (acc, curr) => acc + (curr.totalDeductions || 0),
      0,
    );
    const maxVal = Math.max(...data.map((d) => d.totalMonthlyNet));
    const maxMonthObj = data.find((d) => d.totalMonthlyNet === maxVal);
    return {
      total,
      avg: total / data.length,
      tax,
      maxMonth: maxMonthObj ? `Tháng ${maxMonthObj.month}` : "N/A",
    };
  }, [data]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-black text-[10px] tracking-widest uppercase">
            Đang tải dữ liệu {selectedYear}...
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-10 bg-[#fdfdfd] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic">
            MY SALARY.
          </h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold mt-1 uppercase tracking-widest">
            Báo cáo thu nhập năm {selectedYear}
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
          {[currentYear, currentYear - 1].map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`flex-1 md:flex-none px-6 md:px-10 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${selectedYear === y ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}
            >
              NĂM {y}
            </button>
          ))}
        </div>
      </div>

      {/* STATS - Mobile 2 cột */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Tổng lĩnh"
          value={formatVND(stats.total)}
          icon={<Wallet size={18} />}
          color="blue"
        />
        <StatCard
          title="Trung bình"
          value={formatVND(stats.avg)}
          icon={<TrendingUp size={18} />}
          color="indigo"
        />
        <StatCard
          title="Khấu trừ"
          value={formatVND(stats.tax)}
          icon={<ShieldCheck size={18} />}
          color="rose"
        />
        <StatCard
          title="Cao nhất"
          value={stats.maxMonth}
          icon={<ArrowUpRight size={18} />}
          color="emerald"
        />
      </div>

      {/* CHART - Ẩn trên mobile cực nhỏ nếu cần, hoặc scale lại */}
      <div className="bg-white p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 mb-6 tracking-tight">
          Biến động thu nhập
        </h3>
        <div className="h-[250px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
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
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) =>
                  active &&
                  payload && (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border-none">
                      <p className="text-[9px] text-slate-400 font-black mb-1 uppercase tracking-widest">
                        Tháng {payload[0]?.payload?.month}
                      </p>
                      <p className="text-sm font-black">
                        {formatVND(payload[0].value as number)}
                      </p>
                    </div>
                  )
                }
              />
              <Area
                type="monotone"
                dataKey="totalMonthlyNet"
                stroke="#2563eb"
                strokeWidth={3}
                fill="url(#colorNet)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE/LIST - Chuyển sang Card trên Mobile */}
      <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-black text-slate-800">
            Lịch sử kỳ lương
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">
            {data.length} Kỳ
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto px-8 pb-8">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6">Kỳ lương</th>
                <th className="px-6 text-right">Tổng Gross</th>
                <th className="px-6 text-right">Thực nhận</th>
                <th className="px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedSalary(item)}
                  className="group bg-white hover:bg-slate-50 transition-all cursor-pointer border-y border-slate-50"
                >
                  <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-50 font-bold text-slate-700">
                    Tháng {item.month}
                  </td>
                  <td className="px-6 py-5 border-y border-slate-50 text-right font-bold text-slate-400">
                    {formatVND(item.totalGross)}
                  </td>
                  <td className="px-6 py-5 border-y border-slate-50 text-right font-black text-blue-600">
                    {formatVND(item.totalMonthlyNet)}
                  </td>
                  <td className="px-6 py-5 border-y border-r border-slate-50 rounded-r-2xl text-center">
                    <div className="inline-flex p-2 bg-slate-50 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <Eye size={16} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-slate-50">
          {data.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedSalary(item)}
              className="p-5 flex justify-between items-center active:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                  M{item.month}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 italic">
                    Tháng {item.month} / {item.year}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Gross: {formatVND(item.totalGross)}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <p className="text-sm font-black text-blue-600">
                  {formatVND(item.totalMonthlyNet)}
                </p>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedSalary && (
          <SalaryDetailModal
            salary={selectedSalary}
            onClose={() => setSelectedSalary(null)}
            formatVND={formatVND}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }: any) => {
  const themes: any = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div
        className={`w-10 h-10 md:w-12 md:h-12 ${themes[color]} rounded-xl md:rounded-2xl flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {title}
      </p>
      <p className="text-sm md:text-lg font-black text-slate-900 truncate">
        {value}
      </p>
    </div>
  );
};

const SalaryDetailModal = ({ salary, onClose, formatVND }: any) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  // FIX TẢI PDF TRÊN MOBILE
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff", // Ép nền trắng rõ ràng
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Phieu-Luong-${salary.month}-${salary.year}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Lỗi render PDF. Hãy thử lại!");
    }
  };

  const handleReviewRequest = async (salary: any) => {
    const reason = window.prompt(
      "Lý do rà soát (Ví dụ: Sai ngày công, thiếu tiền OT...):",
    );
    if (!reason) return;
    setIsSending(true);
    try {
      const response = await fetch("/api/my-salary/request-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName: salary.fullName || "Nhân viên hệ thống",
          month: salary.month,
          year: salary.year,
          reason: reason,
          totalGross: salary.totalGross,
          totalMonthlyNet: salary.totalMonthlyNet,
        }),
      });
      if (response.ok) alert("✅ Đã gửi yêu cầu thành công!");
      else alert("❌ Lỗi gửi yêu cầu.");
    } catch (error) {
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
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white w-full max-w-2xl h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-[32px] md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="overflow-y-auto flex-1 scrollbar-hide">
          <div ref={pdfRef} className="bg-white">
            {/* Header Modal */}
            <div className="p-8 md:p-10 bg-slate-900 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">
                    Salary Slip.
                  </h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                    Kỳ lương: {salary.month}/{salary.year}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-10 space-y-8">
              <section>
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-2 italic">
                  <Calculator size={14} className="text-blue-600" /> Thu nhập
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow
                    label="Cơ bản"
                    value={formatVND(salary.baseSalary)}
                  />
                  <DetailRow
                    label="Tăng ca"
                    value={formatVND(salary.overtime)}
                    highlight
                  />
                  <DetailRow
                    label="Phụ cấp"
                    value={formatVND(salary.mealAllowance)}
                  />
                  <DetailRow
                    label="Lương hiệu quả"
                    value={formatVND(salary.efficiencySalary || 0)}
                  />
                  <DetailRow
                    label="Tổng lương"
                    value={formatVND(salary.totalGross || 0)}
                  />
                  <DetailRow
                    label="Khác"
                    value={formatVND(salary.otherAllowances || 0)}
                  />
                </div>
              </section>

              <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2 italic">
                  <ShieldCheck size={14} className="text-rose-600" /> Khấu trừ
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow
                    label="BHXH/BHYT"
                    value={`-${formatVND(salary.insuranceDeduction)}`}
                    subColor="text-rose-500"
                  />
                  <DetailRow
                    label="Thuế TNCN"
                    value={`-${formatVND(salary.taxTNCN)}`}
                    subColor="text-rose-500"
                  />
                </div>
              </section>

              <div className="bg-blue-600 p-6 md:p-8 rounded-[32px] text-white flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-60 mb-1">
                    Thực nhận (Net)
                  </p>
                  <p className="text-2xl md:text-4xl font-black">
                    {formatVND(salary.totalMonthlyNet)}
                  </p>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <FileText size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-white flex flex-col md:flex-row gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest"
          >
            <Printer size={16} /> Tải PDF
          </button>
          <button
            onClick={() => handleReviewRequest(salary)}
            disabled={isSending}
            className="flex-1 py-4 bg-slate-100 text-slate-700 font-black rounded-2xl flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest active:bg-rose-50 active:text-rose-600 transition-colors"
          >
            <AlertCircle size={16} /> Rà soát
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DetailRow = ({
  label,
  value,
  highlight = false,
  subColor = "text-slate-800",
}: any) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
      {label}
    </span>
    <span
      className={`text-[13px] md:text-[14px] truncate ${highlight ? "font-black text-blue-600" : "font-bold"} ${subColor}`}
    >
      {value}
    </span>
  </div>
);
