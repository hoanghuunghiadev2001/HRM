/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Spin,
  Tooltip,
  DatePicker,
  Space,
  Button,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ColumnsType } from "antd/es/table";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const TZ = "Asia/Ho_Chi_Minh";

interface Vehicle {
  id: number;
  name: string;
  plateNumber: string;
}

interface Proposal {
  id: number;
  vehicleId: number;
  startAt: string;
  endAt: string;
  name: string;
  proposerName: string;
  title: string;
  description: string;
  proposer: {
    name: string;
  };
}

export default function VehicleReportPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableHeight, setTableHeight] = useState(600);

  // selectedDate lưu Dayjs (đã set timezone khi cần)
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() =>
    dayjs().tz(TZ).startOf("day")
  );

  useEffect(() => {
    // set height once
    const height = window.innerHeight - 250;
    setTableHeight(height > 200 ? height : 400); // tối thiểu 400px
  }, []);

  // mỗi khi selectedDate thay đổi => fetch lại
  useEffect(() => {
    fetchReportForDate(selectedDate);
  }, [selectedDate]);

  const fetchReportForDate = async (date: Dayjs) => {
    setLoading(true);
    try {
      // format ngày gửi lên backend: YYYY-MM-DD (theo timezone VN)
      const dateStr = date.tz(TZ).format("YYYY-MM-DD");
      const res = await fetch(`/api/report/vehicles?date=${dateStr}`);
      const data = await res.json();
      setVehicles(data.vehicles || []);
      setProposals(data.proposals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Quick set ngày: -1, 0, +1
  const chooseQuickDate = (offset: number) => {
    const d = dayjs().tz(TZ).add(offset, "day").startOf("day");
    setSelectedDate(d);
  };

  // DatePicker onChange
  const onDateChange = (value: Dayjs | null) => {
    if (!value) return;
    // ensure we interpret selected value as VN timezone date (startOf day)
    const d = value.tz
      ? value.tz(TZ).startOf("day")
      : dayjs(value).tz(TZ).startOf("day");
    setSelectedDate(d);
  };

  // Tạo khung giờ trong ngày (08:00-20:00, mỗi 30 phút) dựa trên selectedDate
  const generateTimeSlots = () => {
    const slots: string[] = [];
    // base là selectedDate tại múi giờ VN
    let start = selectedDate.clone().hour(8).minute(0).second(0);
    const end = selectedDate.clone().hour(20).minute(0).second(0);

    while (start.isBefore(end)) {
      const slotStart = start.format("HH:mm");
      const slotEnd = start.add(30, "minute").format("HH:mm");
      slots.push(`${slotStart}-${slotEnd}`);
      start = start.add(30, "minute");
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Dữ liệu bảng: hàng = khung giờ
  const tableData = timeSlots.map((slot) => {
    const [slotStartStr, slotEndStr] = slot.split("-");
    const row: any = { key: slot, time: slot };

    const slotStartHour = parseInt(slotStartStr.split(":")[0]);
    const slotStartMinute = parseInt(slotStartStr.split(":")[1]);
    const slotEndHour = parseInt(slotEndStr.split(":")[0]);
    const slotEndMinute = parseInt(slotEndStr.split(":")[1]);

    vehicles.forEach((v) => {
      const proposal = proposals.find((p) => {
        // parse proposal times as VN timezone
        const start = dayjs(p.startAt).tz(TZ);
        const end = dayjs(p.endAt).tz(TZ);

        // Tạo slotStart/slotEnd cùng ngày với proposal's start (đã parse VN)
        const slotStart = start
          .clone()
          .hour(slotStartHour)
          .minute(slotStartMinute)
          .second(0);
        const slotEnd = start
          .clone()
          .hour(slotEndHour)
          .minute(slotEndMinute)
          .second(0);

        // Kiểm tra overlap: slotStart < proposalEnd && slotEnd > proposalStart
        return (
          p.vehicleId === v.id &&
          slotStart.isBefore(end) &&
          slotEnd.isAfter(start)
        );
      });
      row[v.id] = proposal || null;
    });

    return row;
  });

  const columns: ColumnsType<any> = [
    {
      title: "Khung giờ",
      dataIndex: "time",
      key: "time",
      fixed: "left",
      width: 120,
    },
    ...vehicles.map((v) => ({
      title: (
        <div style={{ textAlign: "center", lineHeight: 1.2 }}>
          <div>{v.name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{v.plateNumber}</div>
        </div>
      ),
      dataIndex: v.id,
      key: v.id,
      width: 150,
      render: (proposal: Proposal) =>
        proposal ? (
          <Tooltip
            title={`${proposal.proposer?.name || ""} - ${
              proposal.description || proposal.title || ""
            }`}
          >
            <div
              style={{
                backgroundColor: "#fadb14",
                textAlign: "center",
                borderRadius: 4,
                padding: 4,
                fontSize: 12,
              }}
            >
              Đã chọn
            </div>
          </Tooltip>
        ) : null,
    })),
  ];

  // helper: hiển thị ngày đang chọn
  const selectedDateLabel = selectedDate.tz(TZ).format("DD/MM/YYYY");

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>Báo cáo sử dụng xe</Typography.Title>

      {/* Controls */}
      <Space style={{ marginBottom: 16, alignItems: "center" }}>
        <div>
          <Button
            onClick={() => chooseQuickDate(-1)}
            type={
              selectedDate.isSame(dayjs().tz(TZ).add(-1, "day"), "day")
                ? "primary"
                : "default"
            }
          >
            Hôm qua
          </Button>
          <Button
            onClick={() => chooseQuickDate(0)}
            style={{ marginLeft: 8 }}
            type={
              selectedDate.isSame(dayjs().tz(TZ), "day") ? "primary" : "default"
            }
          >
            Hôm nay
          </Button>
          <Button
            onClick={() => chooseQuickDate(1)}
            style={{ marginLeft: 8 }}
            type={
              selectedDate.isSame(dayjs().tz(TZ).add(1, "day"), "day")
                ? "primary"
                : "default"
            }
          >
            Ngày mai
          </Button>
        </div>

        <div style={{ marginLeft: 12 }}>
          <DatePicker
            value={selectedDate}
            onChange={onDateChange}
            format="DD/MM/YYYY"
            allowClear={false}
            // đặt pickerProps để người dùng dễ chọn
          />
        </div>

        <div style={{ marginLeft: 12, color: "#666" }}>
          Đang xem: {selectedDateLabel}
        </div>
      </Space>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={tableData}
          columns={columns}
          scroll={{ x: "max-content", y: tableHeight }}
          bordered
          size="small"
          pagination={false}
        />
      )}
    </div>
  );
}
