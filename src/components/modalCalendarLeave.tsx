import React, { useEffect, useState } from "react";
import { Calendar, Modal, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Kích hoạt plugin
dayjs.extend(utc);
dayjs.extend(timezone);

interface ModalCalendarLeaveProps {
  open: boolean;
  onClose: () => void;
}
interface LeaveCount {
  date: string;
  count: number;
}

const ModalCalendarLeave = ({ open, onClose }: ModalCalendarLeaveProps) => {
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

    return (
      <div
        className={`relative h-full flex items-end justify-end p-1 rounded-md `}
      >
        {found && (
          <div className="text-red-600 font-bold text-sm">{found.count}</div>
        )}
      </div>
    );
  };

  return (
    <>
      <Modal
        style={{ top: 20 }}
        title={
          <p className="text-2xl font-bold text-center">
            Lịch Nghỉ phép đã duyệt
          </p>
        }
        width={600}
        // loading={loading}
        open={open}
        onCancel={onClose}
        closable={{ "aria-label": "Close Button" }}
        footer={null}
      >
        {loading ? (
          <Spin size="large" className="flex justify-center mt-10" />
        ) : (
          <div className="p-4 bg-white rounded-lg shadow">
            <Calendar
              dateCellRender={dateCellRender}
              className="!p-0 antd-calendar"
            />
          </div>
        )}

        {/* <ModalLoading isOpen={loading} /> */}
      </Modal>
    </>
  );
};

export default ModalCalendarLeave;
