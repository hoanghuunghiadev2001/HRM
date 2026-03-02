/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  Eye,
  TrendingUp,
  Wallet,
  ReceiptText,
  ChevronRight,
} from "lucide-react";

const SalaryReport = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API đã viết ở bước trước
    fetch("/api/my-salary/report?year=2024")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu lương...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* 1. Header & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng thực nhận năm</p>
            <p className="text-xl font-bold text-gray-800">
              {formatVND(
                data.reduce((acc, curr) => acc + curr.actualReceived, 0),
              )}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tháng cao nhất</p>
            <p className="text-xl font-bold text-gray-800">
              {formatVND(Math.max(...data.map((d) => d.actualReceived)))}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <ReceiptText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng khấu trừ/thuế</p>
            <p className="text-xl font-bold text-gray-800">
              {formatVND(
                data.reduce((acc, curr) => acc + curr.totalDeductions, 0),
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Biểu đồ đường (Line Chart) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" /> Biến động thu nhập
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="displayMonth"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value / 1000000}M`}
              />
              <Tooltip
                formatter={(value: number) => formatVND(value)}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                name="Thực nhận"
                type="monotone"
                dataKey="actualReceived"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorNet)"
              />
              <Area
                name="Tổng thu nhập"
                type="monotone"
                dataKey="totalGross"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Bảng chi tiết lương tháng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Bảng kê chi tiết từng tháng</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                <th className="px-6 py-4 font-medium">Tháng</th>
                <th className="px-6 py-4 font-medium">Công làm</th>
                <th className="px-6 py-4 font-medium text-right">
                  Tổng thu nhập
                </th>
                <th className="px-6 py-4 font-medium text-right text-red-500">
                  Khấu trừ
                </th>
                <th className="px-6 py-4 font-medium text-right text-blue-600">
                  Thực nhận
                </th>
                <th className="px-6 py-4 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-6 py-4 font-semibold text-gray-700">
                    {item.displayMonth}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.workingDays} ngày
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatVND(item.totalGross)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 italic">
                    -{formatVND(item.totalDeductions)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">
                    {formatVND(item.actualReceived)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="p-2 hover:bg-white rounded-full shadow-sm border border-transparent hover:border-gray-200 transition-all"
                      title="Xem phiếu lương"
                    >
                      <Eye
                        size={18}
                        className="text-gray-400 group-hover:text-blue-500"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalaryReport;
