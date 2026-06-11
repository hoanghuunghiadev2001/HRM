/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import {
  Trash2,
  FileSpreadsheet,
  History,
  CheckCircle2,
  Loader2,
  FileUp,
  Users,
  ShieldCheck,
  ChevronRight,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import SalaryDetailModal from "@/components/SalaryDetailModal";

// ── Import component modal vừa tạo ──────────────────────────────────────────
// Hoặc nếu để cùng thư mục: import { SalaryDetailModal } from "./SalaryDetailModal";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface SalaryBatch {
  id: number;
  filename: string;
  month: number;
  year: number;
  totalRows: number;
  createdAt: string;
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function AdminSalaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<SalaryBatch[]>([]);

  // ── State cho modal ─────────────────────────────────────────────────────────
  const [selectedBatch, setSelectedBatch] = useState<SalaryBatch | null>(null);

  // ─── API CALLS ───────────────────────────────────────────────────────────────

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/salary/batch");
      const data = await res.json();
      setBatches(data);
    } catch {
      console.error("Lỗi tải danh sách");
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("month", month.toString());
    formData.append("year", year.toString());
    try {
      const res = await fetch("/api/salary/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("✅ Tải lên bảng lương thành công!");
        setFile(null);
        fetchBatches();
      } else {
        const err = await res.json();
        alert(`❌ Lỗi: ${err.error || "Không thể tải lên"}`);
      }
    } catch {
      alert("❌ Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (batchId: number) => {
    if (
      !confirm(
        "⚠️ Bạn có chắc chắn muốn xóa toàn bộ đợt lương này? Hành động này không thể hoàn tác!",
      )
    )
      return;
    try {
      const res = await fetch(`/api/salary/batch/${batchId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBatches((prev) => prev.filter((b) => b.id !== batchId));
      } else {
        const err = await res.json();
        alert(`❌ Lỗi: ${err.error || "Không thể xóa"}`);
      }
    } catch {
      alert("❌ Lỗi kết nối máy chủ");
    }
  };

  // ── Handler inline edit — truyền xuống SalaryDetailModal ────────────────────
  const handleInlineEdit = async (
    salaryId: number,
    field: string,
    value: any,
  ) => {
    await fetch(`/api/salary/${salaryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans pb-10">
      {/* HERO */}
      <div className="bg-slate-950 pt-10 pb-28 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -mr-20 -mt-20 blur-[100px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  Hệ thống quản trị nội bộ
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Quản lý <span className="text-blue-500">Bảng lương</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">
                  Tổng đợt lương
                </p>
                <p className="text-2xl font-black text-white">
                  {batches.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: UPLOAD FORM */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-[2.5rem] shadow-xl p-6 sm:p-8 border border-white sticky top-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <FileUp className="text-blue-600" /> Tải dữ liệu mới
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase px-1">
                      Kỳ lương
                    </label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Tháng {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase px-1">
                      Năm
                    </label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className={`border-2 border-dashed rounded-[2rem] p-8 text-center transition-all ${file ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50 group-hover:border-blue-400"}`}
                  >
                    <div
                      className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${file ? "bg-blue-600 text-white" : "bg-white text-slate-400 shadow-sm"}`}
                    >
                      <FileSpreadsheet size={28} />
                    </div>
                    <p className="text-xs font-bold text-slate-600 break-all px-2">
                      {file ? file.name : "Chọn file Excel (.xlsx)"}
                    </p>
                  </div>
                </div>

                <button
                  disabled={loading || !file}
                  type="button"
                  onClick={handleUpload}
                  className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                  TẢI LÊN HỆ THỐNG
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: HISTORY LIST */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <History className="text-blue-600" /> Nhật ký bảng lương
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {batches.map((b) => (
                <div
                  key={b.id}
                  className="group bg-white p-5 rounded-[2rem] border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-5"
                >
                  <div className="h-16 w-16 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center shrink-0 shadow-lg">
                    <span className="text-[10px] font-black opacity-50 uppercase">
                      T{b.month}
                    </span>
                    <span className="text-xl font-black">
                      {b.year.toString().slice(-2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-800 text-base truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                      {b.filename}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                        <Users size={12} className="text-blue-500" />{" "}
                        {b.totalRows} NV
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                        <CalendarDays size={12} className="text-blue-500" />
                        {new Date(b.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* ── Mở modal bằng setSelectedBatch ── */}
                    <button
                      onClick={() => setSelectedBatch(b)}
                      className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(b.id)}
                      className="h-10 w-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {batches.length === 0 && (
                <div className="col-span-2 text-center py-20 text-slate-400">
                  <FileSpreadsheet
                    size={40}
                    className="mx-auto mb-3 opacity-30"
                  />
                  <p className="font-bold text-sm">
                    Chưa có dữ liệu bảng lương
                  </p>
                  <p className="text-xs mt-1">Tải file Excel lên để bắt đầu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: render khi selectedBatch != null ─────────────────────────── */}
      {selectedBatch && (
        <SalaryDetailModal
          batch={selectedBatch}
          onClose={() => setSelectedBatch(null)}
          onInlineEdit={handleInlineEdit}
        />
      )}
    </div>
  );
}
