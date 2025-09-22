"use client";
import { Button } from "antd";
import dayjs from "dayjs";

export default function ExportLeaveRequests() {
  const handleExport = async () => {
    try {
      // Lấy tháng hiện tại (YYYY-MM)
      const month = dayjs().format("YYYY-MM");

      const res = await fetch(`/api/leave/export?month=${month}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Xuất file thất bại");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Tạo link download
      const a = document.createElement("a");
      a.href = url;
      a.download = `DonNghi_${month}.xlsx`;
      document.body.appendChild(a);
      a.click();

      // cleanup
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải file");
    }
  };

  return <Button onClick={handleExport}>Xuất đơn tháng</Button>;
}
