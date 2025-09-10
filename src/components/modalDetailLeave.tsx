/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Drawer, Form, Select, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Image from "next/image";
import { useState } from "react";
import InfoPersonal from "./infoPersonal";
import { RequestLeave } from "./api";
import { StatusLeave } from "./function";
import { useAppSelector } from "@/store/hook";


// Extend plugin
dayjs.extend(utc);
dayjs.extend(timezone);

interface UpdateLeaveRequestPayload {
  id: number;           // ID đơn nghỉ phép
  employeeId: number;   // ID nhân viên đang sửa
  leaveType: string;    // loại phép mới
}

interface ApiResponse<T> {
  message: string;
  data?: T;
}

interface ModalDetailLeaveProps {
  open: boolean;
  onClose: () => void;
  title: string;
  infoRequetLeave?: RequestLeave;
}

const leaveOptions = [
  { value: "PN", label: "PN - Phép năm" },
  { value: "NB", label: "NB - Nghỉ bù" },
  { value: "PC", label: "PC - Phép cưới" },
  { value: "Cgt", label: "CGT - Công tác" },
  { value: "PB", label: "PB - Phép bệnh" },
  { value: "TS", label: "TS - Thai sản" },
  { value: "PR", label: "PR - Phép riêng" },
];

const ModalDetailLeave = ({
  onClose,
  open,
  title,
  infoRequetLeave,
}: ModalDetailLeaveProps) => {
  const [leaveType, setLeaveType] = useState<string>(infoRequetLeave?.leaveType || "PN");
  const [loading, setLoading] = useState(false);
  const { id, employeeCode } = useAppSelector((state) => state.user);

  async function updateLeaveTypeAPI(payload: UpdateLeaveRequestPayload) {
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
      console.log("Cập nhật thành công:", result.data);
    } catch (error: any) {
      message.error(error.message || "Cập nhật thất bại");
      console.error("Lỗi khi gọi API:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = () => {
    if (!infoRequetLeave) return;
    updateLeaveTypeAPI({
      id: infoRequetLeave.id,
      employeeId: Number(id),
      leaveType,
    });
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-4 w-full justify-between">
          <p>{title}</p>
          <StatusLeave status={infoRequetLeave?.status ?? "pending"} />
        </div>
      }
      closable={{ "aria-label": "Close Button" }}
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
            onError={(e) => (e.currentTarget.src = "/storage/avt-default.webp")}
          />
        </div>
        <div className="pl-4 mt-2">
          <InfoPersonal titleValue="Họ và tên" value={infoRequetLeave?.employee.name} />
          <InfoPersonal titleValue="MSNV" value={infoRequetLeave?.employee.employeeCode} />
          <InfoPersonal
            titleValue="Bộ phận"
            value={infoRequetLeave?.employee.workInfo.department?.name}
          />
          <InfoPersonal
            titleValue="Chức vụ"
            value={infoRequetLeave?.employee.workInfo.position?.name}
          />
        </div>

        {/* Chi tiết đơn nghỉ */}
        <p className="text-xl font-bold mt-4">Chi tiết:</p>
        <div className="pl-4 mt-1">

          {employeeCode === "AD001" || employeeCode === "00898"  ? (
            <Form.Item label="Loại phép">
              <Select value={leaveType} onChange={setLeaveType} options={leaveOptions} />
            </Form.Item>
          ) : (
            <InfoPersonal
              titleValue="Loại phép"
              value={infoRequetLeave?.leaveType}
            />
          )}

          <InfoPersonal
            titleValue="Bắt đầu"
            value={dayjs.utc(infoRequetLeave?.startDate).tz("Asia/Ho_Chi_Minh")
              .format("HH:mm giờ, ngày DD/MM/YYYY")}
          />
          <InfoPersonal
            titleValue="Kết thúc"
            value={dayjs.utc(infoRequetLeave?.endDate).tz("Asia/Ho_Chi_Minh")
              .format("HH:mm giờ, ngày DD/MM/YYYY")}
          />
          <InfoPersonal
            titleValue="Tổng thời gian"
            value={`${infoRequetLeave?.totalHours} Giờ`}
          />
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
        </div>


        {employeeCode === "AD001" || employeeCode === "00898" ? (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        ):''}

      </div>
    </Drawer>
  );
};

export default ModalDetailLeave;
