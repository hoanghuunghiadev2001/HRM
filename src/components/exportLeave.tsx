"use client";
import { Button, DatePicker, message } from "antd";
import { useState } from "react";
import dayjs from "dayjs";

export default function ExportLeaveRequests() {
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs | null>(dayjs());
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleExport = async () => {
    if (!selectedMonth) {
      messageApi.error("Vui lòng chọn tháng để xuất file");
      return;
    }

    const month = selectedMonth.format("YYYY-MM");

    try {
      setLoading(true);
      const res = await fetch(`/api/leave/export?month=${month}`, {
        method: "GET",
      });

      if (!res.ok) throw new Error("Xuất file thất bại");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `DonNghi_${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      messageApi.success(`Đã xuất file tháng ${month}`);
    } catch (err) {
      console.error(err);
      messageApi.error("Lỗi khi tải file");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center gap-2">
      {contextHolder}
      <DatePicker
        picker="month"
        value={selectedMonth}
        onChange={(date) => setSelectedMonth(date)}
        format="MM/YYYY"
        placeholder="Chọn tháng/năm"
      />
      <Button type="primary" onClick={handleExport} loading={loading}>
        Xuất file
      </Button>
    </div>
  );
}
