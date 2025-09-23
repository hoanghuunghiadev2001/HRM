/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DatePicker, Drawer, Form, Select, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Image from "next/image";
import { Key, useEffect, useState } from "react";
import InfoPersonal from "./infoPersonal";
// import { RequestLeave } from "./api";
import { StatusLeave } from "./function";
import { useAppSelector } from "@/store/hook";

// Extend plugin
dayjs.extend(utc);
dayjs.extend(timezone);

interface UpdateLeaveRequestPayload {
  id: number;           // ID đơn nghỉ phép
  leaveType?: string;   // loại phép mới (tùy chọn)
  startDate?: string;   // ngày bắt đầu mới (ISO)
  endDate?: string;     // ngày kết thúc mới (ISO)
}

interface ApiResponse<T> {
  message: string;
  data?: T;
}

interface ModalDetailLeaveProps {
  open: boolean;
  onClose: () => void;
  title: string;
  infoRequetLeave?: any;
}

// Bản đồ trạng thái sang tiếng Việt
const statusMap: Record<string, string> = {
  approved: "Đã duyệt",
  rejected: "Từ chối",
  pending: "Đang chờ",
};

const leaveOptions = [
  { value: "PN", label: "PN - Phép năm" },
  { value: "NB", label: "NB - Nghỉ bù" },
  { value: "PC", label: "PC - Phép cưới" },
  { value: "Cgt", label: "CGT - Công tác" },
  { value: "PB", label: "PB - Phép bệnh" },
  { value: "TS", label: "TS - Thai sản" },
  { value: "PR", label: "PR - Phép riêng" },
];

const ModalDetailLeave = ({ onClose, open, title, infoRequetLeave }: ModalDetailLeaveProps) => {
  const { employeeCode } = useAppSelector((state) => state.user);
  const [leaveType, setLeaveType] = useState<string>(infoRequetLeave?.leaveType || "PN");
  const [startDate, setStartDate] = useState<Dayjs | null>(
    infoRequetLeave ? dayjs.utc(infoRequetLeave.startDate).tz("Asia/Ho_Chi_Minh") : null
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    infoRequetLeave ? dayjs.utc(infoRequetLeave.endDate).tz("Asia/Ho_Chi_Minh") : null
  );
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (infoRequetLeave) {
      setLeaveType(infoRequetLeave.leaveType || "PN");
      setStartDate(dayjs.utc(infoRequetLeave.startDate).tz("Asia/Ho_Chi_Minh"));
      setEndDate(dayjs.utc(infoRequetLeave.endDate).tz("Asia/Ho_Chi_Minh"));
    }
  }, [infoRequetLeave]);

  // API cập nhật đơn (ADMIN)
  async function updateLeaveRequest(payload: UpdateLeaveRequestPayload) {
    try {
      setLoading(true);
      const response = await fetch("/api/leave/all-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: ApiResponse<any> = await response.json();
      if (!response.ok) throw new Error(result.message || "Cập nhật thất bại");
      message.success(result.message);
      onClose();
    } catch (error: any) {
      message.error(error.message || "Cập nhật thất bại");
      console.error("Lỗi khi cập nhật:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = () => {
    if (!infoRequetLeave) return;
    if (startDate && endDate && startDate.isAfter(endDate)) {
      message.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }
    updateLeaveRequest({
      id: infoRequetLeave.id,
      leaveType,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });
  };

  // --- API rút đơn ---
  async function handleRevoke() {
    if (!infoRequetLeave) return;
    try {
      setLoading(true);
      const response = await fetch("/api/leave/my-requests/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveRequestId: infoRequetLeave.id }),
      });
      const result: ApiResponse<any> = await response.json();
      if (!response.ok) throw new Error(result.message || "Rút đơn thất bại");
      message.success(result.message);
      onClose();
    } catch (error: any) {
      message.error(error.message || "Rút đơn thất bại");
      console.error("Lỗi khi rút đơn:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // --- API xóa đơn ---
  async function handleDelete() {
    if (!infoRequetLeave) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/leave/all-requests?id=${infoRequetLeave.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const result: ApiResponse<any> = await response.json();
      if (!response.ok) throw new Error(result.message || "Xóa đơn thất bại");
      message.success(result.message);
      onClose();
    } catch (error: any) {
      message.error(error.message || "Xóa đơn thất bại");
      console.error("Lỗi khi xóa đơn:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Kiểm tra điều kiện hiển thị nút rút đơn
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const start = infoRequetLeave ? dayjs.utc(infoRequetLeave.startDate).tz("Asia/Ho_Chi_Minh") : null;
  const canRevoke =
    infoRequetLeave?.status === "approved" &&
    start &&
    start.isAfter(now);

  return (
    <Drawer
      title={
        <div className="flex items-center gap-4 w-full justify-between">
          <p>{title}</p>
          <StatusLeave status={infoRequetLeave?.status ?? "pending"} />
        </div>
      }
      closable
      onClose={onClose}
      open={open}
      width={600}
    >
      <div>
        {/* Thông tin nhân viên */}
        <p className="text-xl font-bold">Thông tin:</p>
        <div className="flex justify-center mt-2">
          <Image
            loading="lazy"
            width={100}
            height={100}
            quality={70}
            src={infoRequetLeave?.employee.avatar || "/storage/avt-default.webp"}
            alt="avatar"
            className="h-[100px] w-[100px] rounded-[50%] object-cover"
          />
        </div>
        <div className="pl-4 mt-2">
          <InfoPersonal titleValue="Họ và tên" value={infoRequetLeave?.employee.name} />
          <InfoPersonal titleValue="MSNV" value={infoRequetLeave?.employee.employeeCode} />
          <InfoPersonal titleValue="Bộ phận" value={infoRequetLeave?.employee.workInfo.department?.name} />
          <InfoPersonal titleValue="Chức vụ" value={infoRequetLeave?.employee.workInfo.position?.name} />
        </div>

        {/* Chi tiết đơn nghỉ */}
        <p className="text-xl font-bold mt-4">Chi tiết:</p>
        <div className="pl-4 mt-1">
          {(employeeCode === "01375" || employeeCode === "00898") ? (
            <>
              <Form.Item label="Loại phép">
                <Select value={leaveType} onChange={setLeaveType} options={leaveOptions} />
              </Form.Item>
              <Form.Item label="Bắt đầu">
                <DatePicker
                  showTime
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
              <Form.Item label="Kết thúc">
                <DatePicker
                  showTime
                  value={endDate}
                  onChange={(val) => setEndDate(val)}
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </>
          ) : (
            <>
              <InfoPersonal titleValue="Loại phép" value={infoRequetLeave?.leaveType} />
              <InfoPersonal
                titleValue="Bắt đầu"
                value={dayjs.utc(infoRequetLeave?.startDate).tz("Asia/Ho_Chi_Minh").format("HH:mm giờ, ngày DD/MM/YYYY")}
              />
              <InfoPersonal
                titleValue="Kết thúc"
                value={dayjs.utc(infoRequetLeave?.endDate).tz("Asia/Ho_Chi_Minh").format("HH:mm giờ, ngày DD/MM/YYYY")}
              />
            </>
          )}
          <InfoPersonal titleValue="Tổng thời gian" value={`${infoRequetLeave?.totalHours} Giờ`} />
          <div>
            <p className="font-bold text-[#242424] flex gap-2 items-center">Lý do:</p>
            <TextArea disabled rows={4} value={infoRequetLeave?.reason} />
          </div>
        </div>

        {/* Kết quả */}
        <p className="text-xl font-bold mt-4">Kết quả:</p>
        <div className="px-4">
          <div className="flex gap-2 mt-2 mb-2 items-center">
            <p className="font-bold text-[#242424] flex gap-2 items-center">Trạng thái</p>
            <StatusLeave status={infoRequetLeave?.status ?? "pending"} />
          </div>
          {infoRequetLeave?.approvedBy && (
            <InfoPersonal titleValue="Người phê duyệt" value={infoRequetLeave?.approvedBy} />
          )}

          {/* --- Lịch sử phê duyệt --- */}
       {infoRequetLeave?.approvalHistory?.length > 0 && (
  <div className="mt-4">
    <p className="font-bold text-xl">Lịch sử phê duyệt:</p>
    <ul className="pl-4 mt-2 space-y-2">
      {infoRequetLeave.approvalHistory.map(
        (step: {
          approverId: Key | null | undefined;
          name: any;
          employeeCode: any;
          level: any;
          status: string;
          approvedAt?: string | null;
        }) => {
          const time =
            step.approvedAt &&
            dayjs
              .utc(step.approvedAt)
              .tz("Asia/Ho_Chi_Minh")
              .format("DD/MM/YYYY HH:mm");
          return (
            <li
              key={step.approverId}
              className="flex justify-between items-center"
            >
              <div className="flex flex-col">
                <span>{`${step.name} (${step.employeeCode}) - Cấp ${step.level}`}</span>
                {time && (
                  <span className="text-sm text-gray-500">
                    {`Thời gian: ${time}`}
                  </span>
                )}
              </div>
              <span
                className={`font-semibold ${
                  step.status === "approved"
                    ? "text-green-600"
                    : step.status === "rejected"
                    ? "text-red-600"
                    : "text-orange-500"
                }`}
              >
                {statusMap[step.status]}
              </span>
            </li>
          );
        }
      )}
    </ul>
  </div>
)}

        </div>

        {/* Nút cập nhật và rút/xóa đơn */}
        {(employeeCode === "01375" || employeeCode === "00898") && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
            {canRevoke && (
              <button
                onClick={handleRevoke}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {loading ? "Đang rút đơn..." : "Rút đơn"}
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              {loading ? "Đang xóa..." : "Xóa đơn"}
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default ModalDetailLeave;
