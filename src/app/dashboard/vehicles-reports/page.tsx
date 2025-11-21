/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Table, Typography, Spin, Tooltip } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ColumnsType } from "antd/es/table";

dayjs.extend(utc);
dayjs.extend(timezone);

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

  useEffect(() => {
    fetchReport();
    // Tính chiều cao bảng = 100vh - 200px
    const height = window.innerHeight - 200;
    setTableHeight(height > 200 ? height : 400); // tối thiểu 400px
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report/vehicles");
      const data = await res.json();
      setVehicles(data.vehicles);
      setProposals(data.proposals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tạo khung giờ trong ngày (08:00-20:00, mỗi 30 phút)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    let start = dayjs().hour(8).minute(0).second(0);
    const end = dayjs().hour(20).minute(0).second(0);

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
        const start = dayjs(p.startAt).tz("Asia/Ho_Chi_Minh");
        const end = dayjs(p.endAt).tz("Asia/Ho_Chi_Minh");

        // Tạo slotStart/slotEnd cùng ngày với proposal
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
            title={`${proposal.proposer.name} - ${proposal.description}`}
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

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>Báo cáo sử dụng xe</Typography.Title>
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
          pagination={false} // <-- thêm dòng này
        />
      )}
    </div>
  );
}
