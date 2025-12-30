/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import {
  DatePicker,
  Form,
  Modal,
  Select,
  Input,
  Spin,
  Upload,
  Button,
  message,
} from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import dayjs, { Dayjs } from "dayjs";
import { NumericInput } from "./function";
import { useAppSelector } from "@/store/hook";
import { CreateLeavePayload } from "@/app/dashboard/request/page";
import { UploadOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface EmployeeOption {
  label: string;
  value: string | number; // employeeId
}

interface ModalCreateNewRequestProps {
  open: boolean;
  onClose: () => void;
  createRequestLeave: (data: CreateLeavePayload) => void;
}

const leaveOptions = [
  { value: "PN", label: "PN - Phép năm" },
  { value: "NB", label: "NB - Nghỉ bù" },
  { value: "PC", label: "PC - Phép cưới" },
  { value: "Cgt", label: "CGT - Công tác" },
  { value: "PB", label: "PB - Phép bệnh" },
  { value: "TS", label: "TS - Thai sản" },
  { value: "PR", label: "PR - Phép riêng" },
  { value: "PT", label: "PT - Phép Tang" },
];

const ModalCreateNewRequest: React.FC<ModalCreateNewRequestProps> = ({
  open,
  onClose,
  createRequestLeave,
}) => {
  const { name, id, employeeCode, department, position } = useAppSelector(
    (state) => state.user
  );

  const [leaveType, setLeaveType] = useState<string>("PN");
  const [totalHours, setTotalHours] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [timeRange, setTimeRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedApprovers, setSelectedApprovers] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [approversList, setApproversList] = useState<EmployeeOption[]>([]);
  const [loadingApprovers, setLoadingApprovers] = useState<boolean>(false);

  // File upload state (chỉ 1 file)
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load danh sách người duyệt từ backend
  const fetchApprovers = async () => {
    try {
      setLoadingApprovers(true);
      const res = await fetch("/api/employees/employeeProposal");
      const data = await res.json();
      if (res.ok) {
        const options = data.map((emp: any) => ({
          label: `${emp.name} (${emp.position ?? "Chưa có chức vụ"})`,
          value: emp.id,
        }));
        setApproversList(options);
      } else {
        console.error("Error fetching approvers:", data.error);
      }
    } catch (error) {
      console.error("Error fetching approvers:", error);
    } finally {
      setLoadingApprovers(false);
    }
  };

  useEffect(() => {
    if (open) {
      setLeaveType("PN");
      setTotalHours("");
      setReason("");
      setTimeRange(null);
      setSelectedApprovers([]);
      setErrorMsg("");
      setFileList([]);
      setSelectedFile(null);
      fetchApprovers();
    }
  }, [open]);

  // Validate và chặn trước upload
  const beforeUpload = (file: RcFile) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("File phải nhỏ hơn 10MB!");
      return Upload.LIST_IGNORE;
    }
    // Có thể thêm validate loại file nếu cần (pdf/doc/png...)
    return false;
  };

  const handleUploadChange = ({
    fileList: newList,
  }: {
    fileList: UploadFile[];
  }) => {
    // giữ 1 file cuối cùng
    const last = newList.slice(-1);
    setFileList(last);
    const origin = last[0]?.originFileObj as File | undefined;
    setSelectedFile(origin ?? null);
  };

  const handleRemove = () => {
    setFileList([]);
    setSelectedFile(null);
  };

  const handleOk = () => {
    setErrorMsg("");
    if (
      !id ||
      !leaveType ||
      !totalHours ||
      !timeRange ||
      selectedApprovers.length === 0
    ) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin và chọn người duyệt.");
      return;
    }

    const payload: CreateLeavePayload = {
      employeeId: Number(id),
      leaveType,
      startDateTime: timeRange[0].toISOString(),
      endDateTime: timeRange[1].toISOString(),
      reason,
      totalHours,
      approverIds: selectedApprovers,
      handoverFile: selectedFile ?? undefined,
    };

    createRequestLeave(payload);
  };

  return (
    <Modal
      title={
        <p className="text-2xl font-bold text-center">Tạo phiếu yêu cầu</p>
      }
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Tạo mới"
      cancelText="Hủy"
      style={{ top: 20 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="font-bold text-[#242424] flex gap-2 items-center">
          <span>Họ và tên:</span>
          <span className="font-medium text-[#3a3a3a]">{name}</span>
        </div>
        <div className="font-bold text-[#242424] flex gap-2 items-center">
          <span>MSNV:</span>
          <span className="font-medium text-[#3a3a3a]">{employeeCode}</span>
        </div>
        <div className="font-bold text-[#242424] flex gap-2 items-center">
          <span>Bộ phận:</span>
          <span className="font-medium text-[#3a3a3a]">{department}</span>
        </div>
        <div className="font-bold text-[#242424] flex gap-2 items-center">
          <span>Chức vụ:</span>
          <span className="font-medium text-[#3a3a3a]">{position}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Form.Item label="Loại phép" required>
          <Select
            value={leaveType}
            onChange={setLeaveType}
            options={leaveOptions}
          />
        </Form.Item>
        <div className="flex gap-2 items-center">
          <span className="font-bold text-[#242424]">Tổng giờ:</span>
          <NumericInput
            style={{ width: 80 }}
            value={totalHours}
            onChange={setTotalHours}
            placeholder="Tổng giờ"
          />
        </div>
      </div>
      <div className="mb-4">
        <span className="font-bold text-[#242424]">Thời gian:</span>
        <RangePicker
          value={timeRange || undefined}
          showTime={{
            format: "HH:mm",
            defaultValue: [dayjs("08:00", "HH:mm"), dayjs("17:00", "HH:mm")],
          }}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1])
              setTimeRange([dates[0], dates[1]]);
            else setTimeRange(null);
          }}
          format="DD/MM/YYYY HH:mm"
          style={{ width: "100%" }}
        />
      </div>
      <div className="mb-4">
        <span className="font-bold text-[#242424]">Người duyệt:</span>
        {loadingApprovers ? (
          <Spin />
        ) : (
          <Select
            mode="multiple"
            showSearch
            optionFilterProp="label"
            value={selectedApprovers}
            onChange={(vals) =>
              setSelectedApprovers(vals.map((v: any) => Number(v)))
            }
            options={approversList}
            placeholder="Chọn người duyệt theo thứ tự"
            style={{ width: "100%" }}
          />
        )}
      </div>
      <div className="mb-2">
        <span className="font-bold text-[#242424]">Lý do:</span>
        <TextArea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do"
        />
      </div>
      <div className="mb-4">
        <span className="font-bold text-[#242424]">
          Biên bản bàn giao (tùy chọn):
        </span>
        <Upload
          beforeUpload={beforeUpload}
          onChange={handleUploadChange}
          fileList={fileList}
          onRemove={handleRemove}
          maxCount={1}
          accept=".pdf"
          multiple={false}
          showUploadList={{ showRemoveIcon: true }}
          // không dùng action để tránh upload tự động
          action={undefined}
        >
          <Button icon={<UploadOutlined />}>Chọn file</Button>
        </Upload>
        <p className="text-sm text-gray-500 mt-2">
          File tối đa 10MB. Định dạng: pdf.
        </p>
      </div>
      {errorMsg && (
        <p className="text-center text-sm text-red-600 italic">{errorMsg}</p>
      )}
    </Modal>
  );
};

export default ModalCreateNewRequest;
