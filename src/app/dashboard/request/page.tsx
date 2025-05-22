"use client";
import { useEffect, useState } from "react";

import React from "react";
import { message, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import {
  getUserFromLocalStorage,
  ListRequestLeave,
  RequestLeave,
} from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { formatDateTime, StatusLeave } from "@/components/function";
import ModalDetailLeave from "@/components/modalDetailLeave";
import { Plus } from "lucide-react";
import ModalCreateNewRequest from "@/components/modalCreateNewRequest";
import { createStyles, FullToken } from "antd-style";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend plugin
dayjs.extend(utc);
dayjs.extend(timezone);

interface DataType {
  key: string;
  id: number;
  name: string;
  startDate: any;
  endDate: any;
  totalHours: string;
  leaveType: string;
  status: string;
}

const useStyle = createStyles((utils) => {
  const { css, token } = utils;
  const antCls = (token as any).antCls || ".ant"; // fallback nếu token.antCls không tồn tại

  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});
export default function RequestPage() {
  const [myRequestsLeave, setMyRequetsLeave] = useState<ListRequestLeave>();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalDetailLeave, setModalDetailLeave] = useState<boolean>(false);
  const [infoRequetLeave, setInfoRequestLeave] = useState<RequestLeave>();
  const [createRequest, setCreateRequest] = useState<boolean>(false);

  const { styles } = useStyle();

  //api lấy thông tin nghỉ
  const getRequestsLeave = async () => {
    setLoading(true);
    const res = await fetch("/api/leave/my-requests");
    if (res.ok) {
      const data = await res.json(); // Lấy JSON data từ response
      setMyRequetsLeave(data);
      setLoading(false);
    } else {
      // xử lý lỗi nếu cần
      console.error("Lỗi khi lấy dữ liệu:", res.statusText);
      setLoading(false);
    }
  };

  //format và đưa dữ liệu ra table
  const formatted: DataType[] =
    myRequestsLeave?.map((item, index) => ({
      key: (index + 1).toString(),
      id: item.id,
      name: item.employee.name,
      startDate: dayjs
        .utc(item.startDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("HH:mm DD/MM/YYYY"),
      endDate: dayjs
        .utc(item.startDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("HH:mm DD/MM/YYYY"),
      totalHours: item.totalHours.toString(),
      leaveType: item.leaveType,
      status: item.status,
    })) || [];

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "STT",
      dataIndex: "key",
      rowScope: "row",
      width: "60px",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Ngày nghỉ",
      dataIndex: "startDate",
      key: "age",
    },
    {
      title: "Loại phép",
      dataIndex: "leaveType",
      key: "leaveType",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusLeave status={status} />,
    },
    {
      title: "Chi tiết",
      key: "action",
      width: "80px",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => DetailRequetsLeave(record.id)}>chi tiết</a>
        </Space>
      ),
    },
  ];

  //xem chi tiết đơn xin nghỉ
  const DetailRequetsLeave = (id: number) => {
    const item = myRequestsLeave?.find((item) => item.id === id);
    setInfoRequestLeave(item);
    setModalDetailLeave(true);
  };

  //Tạo đơn mới

  const CreateRequestLeave = async (
    employeeId: string,
    leaveType: string,
    startDateTime: string,
    endDateTime: string,
    reason: string,
    totalHours: string
  ) => {
    const payload = {
      employeeId,
      leaveType,
      startDateTime,
      endDateTime,
      reason,
      totalHours,
    };
    try {
      setLoading(true);
      const res = await fetch("/api/leave/create-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.message || "Gửi đơn nghỉ thất bại");
        setLoading(false);
      } else {
        message.success("Gửi đơn nghỉ thành công");
        setCreateRequest(false);
        getRequestsLeave();
        setLoading(false);
      }
    } catch (error) {
      console.error("Lỗi gửi đơn:", error);
      message.error("Lỗi gửi đơn nghỉ");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequestsLeave();
  }, []);

  //style table scroll

  return (
    <div>
      <ModalCreateNewRequest
        onClose={() => setCreateRequest(false)}
        open={createRequest}
        createRequestLeave={CreateRequestLeave}
      />
      <ModalDetailLeave
        infoRequetLeave={infoRequetLeave}
        onClose={() => setModalDetailLeave(false)}
        open={modalDetailLeave}
        title="Chi Tiết Đơn Xin Phép"
      />
      <ModalLoading isOpen={loading} />

      <div className="w-full">
        <p className="font-bold  text-2xl text-[#4a4a6a]">Phiếu yêu cầu:</p>
      </div>
      <div className="w-full">
        <div className="flex justify-end mb-3">
          <button
            className="flex mt-4  gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold"
            onClick={() => setCreateRequest(true)}
          >
            <Plus />
            Tạo phiếu yêu cầu
          </button>
        </div>
        <Table<DataType>
          className={styles.customTable}
          columns={columns}
          dataSource={formatted ?? []}
          pagination={{ pageSize: 12 }}
          scroll={{ y: "calc(100vh - 305px)" }}
        />
      </div>
    </div>
  );
}
