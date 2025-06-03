import React from "react";
import { Button, DatePicker, Form, Modal, Select } from "antd";
import { RequestLeave } from "./api";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { NumericInput } from "./function";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Kích hoạt plugin
dayjs.extend(utc);
dayjs.extend(timezone);

interface ModalApproveRequestProps {
  open: boolean;
  onClose: () => void;
  requestApprove?: RequestLeave;
  putApprovedRequest: (id: number | string, statusRequest: string) => void;
}
const ModalApproveRequest = ({
  onClose,
  open,
  requestApprove,
  putApprovedRequest,
}: ModalApproveRequestProps) => {
  const { RangePicker } = DatePicker;

  const disabledDate = (currentDate: dayjs.Dayjs) => {
    // Không cho chọn ngày trước hôm nay (chỉ chọn hôm nay trở đi)
    return currentDate && currentDate.isBefore(dayjs().startOf("day"));
  };

  const rangeValue: [dayjs.Dayjs, dayjs.Dayjs] = [
    dayjs.utc(requestApprove?.startDate).tz("Asia/Ho_Chi_Minh"),
    dayjs.utc(requestApprove?.endDate).tz("Asia/Ho_Chi_Minh"),
  ];

  return (
    <>
      <Modal
        style={{ top: 20 }}
        title={
          <p className="text-2xl font-bold text-center">
            Phê duyệt phiếu yêu cầu
          </p>
        }
        // loading={loading}
        open={open}
        closable={{ "aria-label": "Close Button" }}
        onClose={onClose}
        onCancel={onClose}
        footer={[
          <Button
            key="reject"
            onClick={() =>
              putApprovedRequest(requestApprove?.id ?? "", "rejected")
            }
          >
            Từ chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() =>
              putApprovedRequest(requestApprove?.id ?? "", "approved")
            }
          >
            Chấp nhận
          </Button>,
        ]}
      >
        {/* <ModalLoading isOpen={loading} /> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-4 sm:mt-2">
          <div className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            <p className="shrink-0">Họ và tên:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {requestApprove?.employee.name}
            </p>
          </div>
          <div className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            <p className="shrink-0">MSNV:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {requestApprove?.employee?.employeeCode}
            </p>
          </div>
          <div className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            <p className="shrink-0">Bộ phận:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {requestApprove?.employee?.workInfo.department?.name}
            </p>
          </div>
          <div className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            <p className="shrink-0">Chức vụ:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {requestApprove?.employee?.workInfo.position?.name}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            label={<p className="font-bold text-[#242424]">Loại Phép</p>}
            rules={[{ required: true, message: "Vui lòng chọn loại phép" }]}
          >
            <Select
              value={requestApprove?.leaveType}
              disabled
              options={[
                { value: "PN", label: "PN-Phép năm" },
                { value: "NB", label: "NB-Nghỉ bù" },
                { value: "PC", label: "PC-Phép cưới" },
                { value: "Cgt", label: "CGT-Công tác" },
                { value: "PB", label: "PB-Phép bệnh" },
                { value: "TS", label: "TS-Thai sản" },
                { value: "PR", label: "PR-Phép riêng" },
              ]}
            />
          </Form.Item>
          <div className="flex gap-2 items-center">
            <p className="font-bold text-[#242424]">Tổng giờ:</p>
            <NumericInput
              style={{ width: 60 }}
              value={String(requestApprove?.totalHours)}
              onChange={() => {}}
              disable
            />
          </div>
        </div>
        <div className="flex gap-2 items-center mt-3">
          <p className="font-bold text-[#242424] shrink-0">Thời gian</p>
          <RangePicker
            disabledDate={disabledDate}
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            showTime={{
              hideDisabledOptions: true,
              defaultValue: [
                dayjs("00:00:00", "HH:mm:ss"),
                dayjs("00:00:00", "HH:mm:ss"),
              ],
            }}
            format="DD/MM/YYYY HH:mm:ss"
            value={rangeValue}
            disabled
          />
        </div>
        <div>
          <p className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            Lý do:
          </p>
          <TextArea
            rows={4}
            placeholder="Nhập lý do"
            value={requestApprove?.reason}
            disabled={true}
          />
        </div>
      </Modal>
    </>
  );
};

export default ModalApproveRequest;
