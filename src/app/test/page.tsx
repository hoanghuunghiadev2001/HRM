/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Card, Input, Button } from "antd";
import { Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";

import dayjs from "dayjs";

export default function ZKTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/test");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Kết nối thất bại!");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection2 = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      await fetch("/api/attendance/sync");
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [employeeCode, setEmployeeCode] = useState("");

  const handleDelete = async () => {
    if (!date) {
      alert("Vui lòng chọn ngày!");
      return;
    }

    if (
      !confirm(
        `Bạn có chắc muốn xóa chấm công ngày ${date}${
          employeeCode ? ` của ${employeeCode}` : ""
        }?`
      )
    )
      return;

    setLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams({ date });
      if (employeeCode.trim())
        params.append("employeeCode", employeeCode.trim());

      const res = await fetch(`/api/attendance/delete?${params.toString()}`, {
        method: "DELETE",
      });
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <Card className="max-w-md w-full shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trash2 className="text-red-500" /> Xóa chấm công theo ngày
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ngày</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mã nhân viên (tùy chọn)
              </label>
              <Input
                placeholder="VD: NV0123"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
              />
            </div>

            <Button
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Đang xóa..." : "Xóa chấm công"}
            </Button>

            {result && (
              <div
                className={`mt-3 p-3 rounded-md flex items-start gap-2 ${
                  result.success
                    ? "bg-green-50 text-green-700 border border-green-300"
                    : "bg-red-50 text-red-700 border border-red-300"
                }`}
              >
                {result.success ? (
                  <CheckCircle className="mt-0.5" />
                ) : (
                  <AlertTriangle className="mt-0.5" />
                )}
                <span className="text-sm">{result.message}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">
          🕒 Kiểm tra kết nối máy chấm công ZKTeco
        </h1>

        <button
          onClick={handleTestConnection}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-medium text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
        </button>

        <button
          onClick={handleTestConnection2}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-medium text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang kiểm tra..." : "Kiểm tra kết nối 2"}
        </button>

        {error && (
          <div className="mt-4 text-red-600 font-medium border border-red-300 bg-red-50 p-3 rounded-lg">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-3">
            <div className="border border-gray-200 bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2 text-sm">
                {result.logs.map((log: any, idx: number) => {
                  const vnTime = new Date(log.recordTime).toLocaleString(
                    "vi-VN",
                    {
                      timeZone: "Asia/Ho_Chi_Minh",
                      hour12: false,
                    }
                  );
                  return (
                    <li
                      key={idx}
                      className="border-b border-gray-200 pb-1 text-gray-700"
                    >
                      👤 <strong>{log.deviceUserId}</strong> – {vnTime} –{" "}
                      {log.type === 0 ? "Vào" : "Ra"}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
