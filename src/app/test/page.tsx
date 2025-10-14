/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Button,
  DatePicker,
  Input,
  Card,
  Space,
  Typography,
  message,
} from "antd";
import { Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";

const { Text, Title } = Typography;

export default function ZKTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [employeeCode, setEmployeeCode] = useState("");

  const fetchLogs = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Kết nối thất bại!");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    await fetchLogs(`/api/test?date=${date.format("YYYY-MM-DD")}`);
  };

  const handleSyncAttendance = async () => {
    await fetchLogs(`/api/attendance/sync?date=${date.format("YYYY-MM-DD")}`);
  };

  const handleDelete = async () => {
    if (!date) {
      message.warning("Vui lòng chọn ngày!");
      return;
    }

    if (
      !confirm(
        `Bạn có chắc muốn xóa chấm công ngày ${date.format("YYYY-MM-DD")}${
          employeeCode ? ` của ${employeeCode}` : ""
        }?`
      )
    )
      return;

    setLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams({ date: date.format("YYYY-MM-DD") });
      if (employeeCode.trim())
        params.append("employeeCode", employeeCode.trim());

      const res = await fetch(`/api/attendance/delete?${params.toString()}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Xóa thất bại!");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center gap-8">
      {/* Xóa chấm công */}
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <Title level={4} className="flex items-center gap-2 mb-4">
          <Trash2 className="text-red-500" /> Xóa chấm công
        </Title>
        <Space direction="vertical" size="middle" className="w-full">
          <div>
            <Text>Ngày</Text>
            <DatePicker
              value={date}
              onChange={(d) => d && setDate(d)}
              className="w-full"
              format="YYYY-MM-DD"
            />
          </div>
          <div>
            <Text>Mã nhân viên (tùy chọn)</Text>
            <Input
              placeholder="VD: NV0123"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
            />
          </div>
          <Button
            danger
            type="primary"
            block
            loading={loading}
            onClick={handleDelete}
          >
            Xóa chấm công
          </Button>
          {result && (
            <div
              className={`mt-2 p-3 rounded-md flex items-start gap-2 ${
                result.success
                  ? "bg-green-50 text-green-700 border border-green-300"
                  : "bg-red-50 text-red-700 border border-red-300"
              }`}
            >
              {result.success ? <CheckCircle /> : <AlertTriangle />}
              <Text>Tổng số: {result.totalLogs}</Text>
            </div>
          )}
          {error && (
            <div className="mt-2 p-3 rounded-md bg-red-50 border border-red-300 text-red-700">
              ❌ {error}
            </div>
          )}
        </Space>
      </Card>

      {/* Kiểm tra máy chấm công */}
      <Card className="w-full max-w-2xl shadow-lg border border-gray-200">
        <Title level={3} className="text-center text-blue-600 mb-4">
          🕒 Kiểm tra máy chấm công ZKTeco
        </Title>
        <Space className="w-full justify-center gap-4 mb-4">
          <Button
            type="primary"
            onClick={handleTestConnection}
            loading={loading}
          >
            Kiểm tra kết nối
          </Button>
          <Button
            type="default"
            onClick={handleSyncAttendance}
            loading={loading}
          >
            Đồng bộ chấm công
          </Button>
        </Space>
        {result && result.logs && result.logs.length > 0 && (
          <div className="mt-4 border border-gray-200 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-2 text-sm">
              {result.logs.map((log: any, idx: number) => {
                const vnTime = new Date(log.recordTime).toLocaleString(
                  "vi-VN",
                  { timeZone: "Asia/Ho_Chi_Minh", hour12: false }
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
        )}
      </Card>
    </div>
  );
}
