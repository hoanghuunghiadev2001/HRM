/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
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
  Search,
  X,
  Info,
  DollarSign,
  Download,
  Filter,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

// --- HELPERS ---
const formatVND = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value || 0));
};

// --- COMPONENTS ---
const EditableCell = ({
  value,
  onSave,
  type = "number",
  className = "",
}: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  return (
    <td className={`p-3 border-r border-slate-100 transition-all ${className}`}>
      <input
        type={isEditing ? type : "text"}
        className="w-full bg-transparent px-2 py-1.5 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none rounded-lg border border-transparent hover:border-slate-200 text-right transition-all"
        value={
          isEditing ? tempValue : type === "number" ? formatVND(value) : value
        }
        onFocus={() => {
          setIsEditing(true);
          setTempValue(value);
        }}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={(e) => {
          setIsEditing(false);
          const newVal =
            type === "number"
              ? Number(e.target.value.replace(/[^0-9.-]+/g, ""))
              : e.target.value;
          if (newVal !== value) onSave(newVal);
        }}
      />
    </td>
  );
};

// Component thẻ nhân sự cho Mobile thay vì Table
const EmployeeMobileCard = ({ s, handleInlineEdit }: any) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4 space-y-3">
    <div className="flex justify-between items-start">
      <div>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          {s.employeeCode}
        </span>
        <h4 className="font-bold text-slate-800 mt-1">{s.fullName}</h4>
        <p className="text-xs text-slate-500">{s.position}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-slate-400 uppercase font-bold">
          Thực nhận
        </p>
        <p className="text-sm font-black text-emerald-600">
          {formatVND(s.actualReceived)}
        </p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-slate-100">
      <div>
        <p className="text-[10px] text-slate-400">Lương CB</p>
        <p className="text-xs font-semibold">{formatVND(s.baseSalary)}</p>
      </div>
      <div>
        <p className="text-[10px] text-slate-400">Năng suất</p>
        <p className="text-xs font-semibold">
          {formatVND(s.productivitySalary)}
        </p>
      </div>
    </div>
  </div>
);

export default function AdminSalaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/salary/batch");
      const data = await res.json();
      setBatches(data);
    } catch (err) {
      console.error("Lỗi tải danh sách");
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleDeleteBatch = async (batchId: number) => {
    // Hiển thị confirm để tránh xóa nhầm
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
        alert("✅ Đã xóa đợt lương thành công!");
        // Cập nhật lại danh sách ngay lập tức để UI biến mất item đó
        setBatches((prev) => prev.filter((b: any) => b.id !== batchId));
      } else {
        const errorData = await res.json();
        alert(`❌ Lỗi: ${errorData.error || "Không thể xóa"}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Lỗi kết nối máy chủ");
    }
  };

  const handleViewDetails = async (batch: any) => {
    setSelectedBatch(batch);
    setIsViewModalOpen(true);
    setIsViewLoading(true);
    try {
      const res = await fetch(`/api/salary/batch/${batch.id}/details`);
      const data = await res.json();
      setDetails(data);
    } catch (err) {
      alert("❌ Lỗi tải dữ liệu");
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleInlineEdit = async (
    salaryId: number,
    field: string,
    value: any,
  ) => {
    setDetails((prev) =>
      prev.map((item) =>
        item.id === salaryId ? { ...item, [field]: value } : item,
      ),
    );
    try {
      await fetch(`/api/salary/${salaryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (err) {
      console.error("Update error");
    }
  };

  const filteredDetails = useMemo(() => {
    return details.filter(
      (s) =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employeeCode.includes(searchTerm),
    );
  }, [details, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans pb-10">
      {/* --- HERO SECTION --- */}
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

      {/* --- MAIN CONTENT --- */}
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <History className="text-blue-600" /> Nhật ký bảng lương
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {batches.map((b: any) => (
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
                        <CalendarDays size={12} className="text-blue-500" />{" "}
                        {new Date(b.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(b)}
                      className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(b.id)} // <--- Thêm dòng này
                      className="h-10 w-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- GIANT MODAL WITH MOBILE VIEW --- */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setIsViewModalOpen(false)}
          />
          <div className="relative bg-[#F8FAFC] w-full h-[95vh] sm:h-[94vh] sm:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
                  T{selectedBatch?.month}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase leading-none">
                    Chi tiết lương {selectedBatch?.month}/{selectedBatch?.year}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                    <Info size={12} /> TỰ ĐỘNG LƯU KHI CHỈNH SỬA
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Tìm tên, mã NV..."
                    className="pl-11 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold w-full md:w-64 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="h-11 w-11 flex items-center justify-center bg-slate-100 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body - Desktop Table / Mobile Cards */}
            <div className="flex-1 overflow-auto p-4 sm:p-0">
              {isViewLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                  <p className="font-black text-[10px] uppercase tracking-[0.3em]">
                    Đang xử lý dữ liệu
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <table className="w-full text-left border-collapse min-w-[4000px]">
                      <thead className="sticky top-0 z-50 shadow-sm">
                        <tr className="bg-slate-900 text-white text-[10px] uppercase font-black">
                          <th
                            colSpan={5}
                            className="p-4 text-center border-r border-slate-800 sticky left-0 z-50 bg-slate-900"
                          >
                            Thông tin nhân sự
                          </th>
                          <th
                            colSpan={8}
                            className="p-4 text-center border-r border-slate-800 bg-blue-800"
                          >
                            Thu nhập & Phụ cấp
                          </th>
                          <th
                            colSpan={5}
                            className="p-4 text-center border-r border-slate-800 bg-indigo-800"
                          >
                            Năng suất
                          </th>
                          <th
                            colSpan={7}
                            className="p-4 text-center border-r border-slate-800 bg-red-800"
                          >
                            Khấu trừ
                          </th>
                          <th
                            colSpan={4}
                            className="p-4 text-center bg-emerald-800"
                          >
                            Thanh toán cuối
                          </th>
                        </tr>
                        <tr className="bg-slate-50 text-slate-500 text-[9px] font-black border-b border-slate-200 uppercase">
                          <th className="p-4 sticky left-0 bg-slate-50 z-40 border-r w-24">
                            Mã NV
                          </th>
                          <th className="p-4 sticky left-24 bg-slate-50 z-40 border-r w-56">
                            Họ Tên
                          </th>
                          <th className="p-4 w-40 border-r">Vị trí</th>
                          <th className="p-4 w-24 text-center border-r">
                            Ngày công
                          </th>
                          <th className="p-4 w-24 text-center border-r">
                            Sheet
                          </th>
                          {/* Dùng loop hoặc render các cột tương tự code cũ nhưng style padding p-4 */}
                          <th className="p-4 w-32 text-right">Lương CB</th>
                          <th className="p-4 w-32 text-right">Lương HQ</th>
                          <th className="p-4 w-32 text-right">Lương 70%</th>
                          <th className="p-4 w-32 text-right">Xăng/ĐT</th>
                          <th className="p-4 w-32 text-right">Thâm niên</th>
                          <th className="p-4 w-32 text-right">Ăn trưa</th>
                          <th className="p-4 w-32 text-right">Thai sản</th>
                          <th className="p-4 w-36 text-right bg-blue-50/50 text-blue-700">
                            Lương NS
                          </th>
                          {/* ... Tiếp tục render các cột ... */}
                          <th className="p-4 w-40 text-center bg-emerald-600 text-white">
                            Thực nhận
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {filteredDetails.map((s) => (
                          <tr
                            key={s.id}
                            className="hover:bg-blue-50/30 transition-colors group"
                          >
                            <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50 font-mono text-blue-600 font-bold z-20 transition-colors">
                              {s.employeeCode}
                            </td>
                            <td className="p-4 sticky left-24 bg-white group-hover:bg-slate-50 font-black text-slate-700 z-20 border-r transition-colors truncate">
                              {s.fullName}
                            </td>
                            <EditableCell
                              value={s.position}
                              type="text"
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "position", v)
                              }
                            />
                            <EditableCell
                              value={s.workingDays}
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "workingDays", v)
                              }
                              className="text-center"
                            />
                            <EditableCell
                              value={s.type}
                              type="text"
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "type", v)
                              }
                              className="text-center"
                            />
                            <EditableCell
                              value={s.baseSalary}
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "baseSalary", v)
                              }
                            />
                            <EditableCell
                              value={s.efficiencySalary}
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "efficiencySalary", v)
                              }
                            />
                            <EditableCell
                              value={s.salary70}
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "salary70", v)
                              }
                            />
                            <EditableCell
                              value={s.phoneAllowance}
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "phoneAllowance", v)
                              }
                            />
                            <EditableCell
                              value={s.seniorityAllowance}
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "seniorityAllowance", v)
                              }
                            />
                            <EditableCell
                              value={s.mealAllowance}
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "mealAllowance", v)
                              }
                            />
                            <EditableCell
                              value={s.maternityAllowance}
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "maternityAllowance", v)
                              }
                            />
                            <EditableCell
                              value={s.productivitySalary}
                              className="bg-blue-50/30 font-bold"
                              onSave={(v: any) =>
                                handleInlineEdit(s.id, "productivitySalary", v)
                              }
                            />
                            {/* ... Rút gọn các cột khác để ví dụ ... */}
                            <td className="p-4 text-center font-black text-white bg-emerald-600 shadow-inner">
                              {formatVND(s.actualReceived)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden p-4">
                    {filteredDetails.map((s) => (
                      <EmployeeMobileCard
                        key={s.id}
                        s={s}
                        handleInlineEdit={handleInlineEdit}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-950 text-white flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-blue-400" /> TỔNG NHÂN SỰ:{" "}
                  {filteredDetails.length}
                </span>
                <span className="flex items-center gap-2 text-emerald-400">
                  <DollarSign size={16} /> TỔNG THỰC CHI:{" "}
                  {formatVND(
                    filteredDetails.reduce(
                      (acc, curr) => acc + curr.actualReceived,
                      0,
                    ),
                  )}{" "}
                  VNĐ
                </span>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-white/10 text-xs">
                  <Download size={16} /> XUẤT FILE
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1 md:flex-none px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-blue-900/20"
                >
                  XÁC NHẬN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
