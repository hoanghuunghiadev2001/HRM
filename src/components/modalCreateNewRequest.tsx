import React, { useEffect, useState } from "react";
import { DatePicker, Form, Modal, Select } from "antd";
import { getUserFromLocalStorage, RequestLeave } from "./api";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { NumericInput } from "./function";
import ModalLoading from "./modalLoading";

interface ModalCreateNewRequestProps {
  open: boolean;
  onClose: () => void;
  createRequestLeave: (
    employeeId: string,
    leaveType: string,
    startDateTime: string,
    endDateTime: string,
    reason: string,
    totalHours: string
  ) => void;
}
const ModalCreateNewRequest = ({
  onClose,
  open,
  createRequestLeave,
}: ModalCreateNewRequestProps) => {
  const localUser = getUserFromLocalStorage();

  const { RangePicker } = DatePicker;

  // state push api
  const [totalHours, setTotalHours] = useState("");
  const [typeLeave, setTypeLeave] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [reason, setReason] = useState("");
  const [messErr, setMessErr] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [timeStartObj, setTimeStartObj] = useState<dayjs.Dayjs | null>(null);
  const [timeEndObj, setTimeEndObj] = useState<dayjs.Dayjs | null>(null);

  const onChange = (value: any, dateString: any) => {
    if (dateString) {
      setTimeStartObj(dateString[0]);
      setTimeEndObj(dateString[1]);
      setTimeStart(dateString[0].format("DD/MM/YYYY HH:mm:ss")); // để hiển thị
      setTimeEnd(dateString[1].format("DD/MM/YYYY HH:mm:ss")); // để hiển thị
    }
  };

  // const onChange = (value: any, dateString: any) => {
  //   setTimeStart(dateString[0]);
  //   setTimeEnd(dateString[1]);
  // };

  const disabledDate = (currentDate: dayjs.Dayjs) => {
    // Không cho chọn ngày trước hôm nay (chỉ chọn hôm nay trở đi)
    return currentDate && currentDate.isBefore(dayjs().startOf("day"));
  };

  const handleCreateNewRequest = () => {
    setLoading(true);
    if (
      !localUser?.id ||
      !typeLeave ||
      !timeStartObj ||
      !timeEndObj ||
      !totalHours ||
      !reason
    ) {
      setLoading(false);
      setMessErr("Vui lòng điền đầy đủ thông tin");
      return;
    }
    createRequestLeave(
      localUser?.id,
      typeLeave,
      timeStartObj!.toISOString(), // dấu "!" nói với TS là: tôi chắc chắn biến này không null
      timeEndObj!.toISOString(),
      reason,
      totalHours
    );
  };

  useEffect(() => {
    setLoading(false);
  }, [open]);

  return (
    <>
      <Modal
        style={{ top: 20 }}
        title={
          <p className="text-2xl font-bold text-center">Tạo phiếu yêu cầu</p>
        }
        // loading={loading}
        open={open}
        onCancel={onClose}
        cancelText={"Hủy"}
        okText="Tạo mới"
        onOk={handleCreateNewRequest}
      >
        {/* <ModalLoading isOpen={loading} /> */}
        <div className="grid grid-cols-2 mt-2 gap-4">
          <div className="font-bold text-[#242424] flex flex-shrink-0 gap-2 items-center">
            <p className="flex-shrink-0">Họ và tên:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {localUser?.name}
            </p>
          </div>
          <div className="font-bold text-[#242424] flex flex-shrink-0 gap-2 items-center">
            <p className="flex-shrink-0">MSNV:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {localUser?.employeeCode}
            </p>
          </div>
          <div className="font-bold text-[#242424] flex flex-shrink-0 gap-2 items-center">
            <p className="flex-shrink-0">Bộ phận:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {localUser?.workInfo.department}
            </p>
          </div>
          <div className="font-bold text-[#242424] flex flex-shrink-0 gap-2 items-center">
            <p className="flex-shrink-0">Chức vụ:</p>
            <p className="inline font-medium text-[#3a3a3a]">
              {localUser?.workInfo.position}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
          <Form.Item
            label={<p className="font-bold text-[#242424]">Loại Phép</p>}
            rules={[{ required: true, message: "Vui lòng chọn loại phép" }]}
          >
            <Select
              onChange={(e) => setTypeLeave(e)}
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
              value={totalHours}
              onChange={setTotalHours}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center mt-3">
          <p className="font-bold text-[#242424] flex-shrink-0">Thời gian</p>
          <RangePicker
            disabledDate={disabledDate}
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            showTime={{
              hideDisabledOptions: true,
              defaultValue: [
                dayjs("00:00:00", "HH:mm:ss"),
                dayjs("11:59:59", "HH:mm:ss"),
              ],
            }}
            format="DD/MM/YYYY HH:mm:ss"
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setTimeStartObj(dates[0]);
                setTimeEndObj(dates[1]);
              } else {
                setTimeStartObj(null);
                setTimeEndObj(null);
              }
            }}
          />
        </div>
        <div>
          <p className="font-bold text-[#242424] flex flex-shrink-0 gap-2 items-center">
            Lý do:
          </p>
          <TextArea
            rows={4}
            placeholder="Nhập lý do"
            onChange={(e) => {
              setReason(e.target.value);
            }}
            value={reason}
          />
        </div>
        <p className="text-center text-sm italic text-red-600">{messErr}</p>
      </Modal>
    </>
  );
};

export default ModalCreateNewRequest;
