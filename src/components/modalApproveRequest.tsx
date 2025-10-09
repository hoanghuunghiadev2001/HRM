import React, { useEffect, useState } from "react";
import { Button, Calendar, DatePicker, Drawer, Form, Select, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { NumericInput } from "./function";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { PendingApprovalItem } from "@/app/dashboard/allRequests/page";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Kích hoạt plugin
dayjs.extend(utc);
dayjs.extend(timezone);

interface ModalApproveRequestProps {
  open: boolean;
  onClose: () => void;
  requestApprove?: PendingApprovalItem;
  putApprovedRequest: (
    decision: "approved" | "rejected",
    comment?: string
  ) => void;
}
interface LeaveCount {
  date: string;
  count: number;
}

const ModalApproveRequest = ({
  open,
  requestApprove,
  putApprovedRequest,
  onClose,
}: ModalApproveRequestProps) => {
  const { RangePicker } = DatePicker;
  const [rejectedReason, setRejectedReason] = useState("");

  const disabledDate = (currentDate: dayjs.Dayjs) => {
    // Không cho chọn ngày trước hôm nay (chỉ chọn hôm nay trở đi)
    return currentDate && currentDate.isBefore(dayjs().startOf("day"));
  };

  const rangeValue: [dayjs.Dayjs, dayjs.Dayjs] = [
    dayjs.utc(requestApprove?.startDate).tz("Asia/Ho_Chi_Minh"),
    dayjs.utc(requestApprove?.endDate).tz("Asia/Ho_Chi_Minh"),
  ];

  const [data, setData] = useState<LeaveCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const res = await fetch("/api/leave/calendar", {
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok) setData(json);
        else console.error(json.error);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, [open]);

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format("YYYY-MM-DD");
    const found = data.find((item) => item.date === dateStr);

    // Kiểm tra ngày trong khoảng rangeValue
    const inRange =
      rangeValue &&
      value.isSameOrAfter(rangeValue[0].startOf("day")) &&
      value.isSameOrBefore(rangeValue[1].endOf("day"));

    return (
      <div
        className={`relative h-full flex items-end justify-end p-1 rounded-md ${
          inRange ? "bg-yellow-500" : ""
        }`}
      >
        {found && (
          <div className="text-red-600 font-bold text-sm">{found.count}</div>
        )}
      </div>
    );
  };

  return (
    <>
      <Drawer
        style={{ top: 20 }}
        title={
          <p className="text-2xl font-bold text-center">
            Phê duyệt phiếu yêu cầu
          </p>
        }
        width={600}
        // loading={loading}
        open={open}
        onClose={onClose}
        closable={{ "aria-label": "Close Button" }}
        footer={
          <div className="flex gap-6 justify-end">
            <Button
              key="reject"
              type="dashed"
              color="danger"
              className="!bg-red-500 !text-white"
              onClick={() => putApprovedRequest("rejected", rejectedReason)}
            >
              Từ chối
            </Button>
            <Button
              key="approve"
              type="primary"
              onClick={() => putApprovedRequest("approved")}
            >
              Chấp nhận
            </Button>
          </div>
        }
      >
        {loading ? (
          <Spin size="large" className="flex justify-center mt-10" />
        ) : (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              📅 Lịch nghỉ phép đã duyệt
            </h2>
            <Calendar
              dateCellRender={dateCellRender}
              className="!p-0 antd-calendar"
            />
          </div>
        )}

        {/* <ModalLoading isOpen={loading} /> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-4 sm:mt-2">
          <div className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            <p className="shrink-0">Họ và tên:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {requestApprove?.employeeName}
            </p>
          </div>
          <div className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            <p className="shrink-0">MSNV:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {requestApprove?.employeeCode}
            </p>
          </div>
          <div className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            <p className="shrink-0">Bộ phận:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {requestApprove?.department}
            </p>
          </div>
          <div className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            <p className="shrink-0">Chức vụ:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {requestApprove?.position}
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
        <div className="flex gap-2 items-center mt-3 flex-wrap">
          <p className="font-bold text-[#242424] shrink-0">Thời gian</p>
          <RangePicker
            disabledDate={disabledDate}
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            showTime={{
              hideDisabledOptions: true,
              defaultValue: [dayjs("00:00", "HH:mm"), dayjs("00:00", "HH:mm")],
            }}
            format="DD/MM/YYYY HH:mm"
            value={rangeValue}
            disabled
          />
        </div>
        <div>
          <p className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            Lý do:
          </p>
          <div className="pl-4">{requestApprove?.reason ?? ""}</div>
          <p className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
            Lý do từ chối:
          </p>
          <TextArea
            rows={4}
            placeholder="Nhập lý do"
            value={rejectedReason}
            onChange={(e) => setRejectedReason(e.target.value)}
          />
        </div>
        <div>
          <p className="font-bold text-[#242424] flex shrink-0 gap-2 items-center mt-3">
            Nhũng người phê duyệt trước:{" "}
          </p>
          <div className="font-medium text-[#242424] px-4 ">
            {requestApprove?.approversWhoApproved?.map((item, index) => (
              <div className="" key={index}>
                - {item.name}({item.positionName})
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ModalApproveRequest;
