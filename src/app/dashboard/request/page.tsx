/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import React from "react";
import { message, Table } from "antd";
import type { TableProps } from "antd";
import { ListRequestLeave, RequestLeave } from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { StatusLeave } from "@/components/function";
import ModalDetailLeave from "@/components/modalDetailLeave";
import { Plus } from "lucide-react";
import ModalCreateNewRequest from "@/components/modalCreateNewRequest";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// Extend plugin cho dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

// Interface cho dữ liệu table
interface DataType {
  key: string;
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  leaveType: string;
  status: string;
}

// Custom scroll cho table Ant Design
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
  const isMobile = useSelector((state: RootState) => state.responsive.isMobile);
  const { styles } = useStyle();
  const [messageApi, contextHolder] = message.useMessage();

  // API lấy thông tin nghỉ
  const getRequestsLeave = async () => {
    setLoading(true);
    const res = await fetch("/api/leave/my-requests");
    if (res.ok) {
      const data = await res.json();
      setMyRequetsLeave(data);
    } else {
      console.error("Lỗi khi lấy dữ liệu:", res.statusText);
    }
    setLoading(false);
  };

  // Chuyển đổi dữ liệu cho table
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
        .utc(item.endDate) // sửa endDate (trước bị lỗi dùng startDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("HH:mm DD/MM/YYYY"),
      totalHours: item.totalHours.toString(),
      leaveType: item.leaveType,
      status: item.status,
    })) || [];

  // Cấu hình cột table
  const columns: TableProps<DataType>["columns"] = [
    { title: "STT", dataIndex: "key", width: "60px" },
    { title: "Tên", dataIndex: "name", width: "150px" },
    { title: "Ngày nghỉ", dataIndex: "startDate", width: "120px" },
    { title: "Loại phép", dataIndex: "leaveType", width: "100px" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: "120px",
      render: (status) => <StatusLeave status={status} />,
    },
    {
      width: "60px",
      title: "Chi tiết",
      render: (_, record) => (
        <a onClick={() => DetailRequetsLeave(record.id)}>Chi tiết</a>
      ),
    },
  ];

  // Xem chi tiết đơn
  const DetailRequetsLeave = (id: number) => {
    const item = myRequestsLeave?.find((item) => item.id === id);
    setInfoRequestLeave(item);
    setModalDetailLeave(true);
  };

  // Tạo đơn mới
  const CreateRequestLeave = async (
    employeeId: string,
    leaveType: string,
    startDateTime: string,
    endDateTime: string,
    reason: string,
    totalHours: string
  ) => {
    try {
      setLoading(true);
      const res = await fetch("/api/leave/create-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          leaveType,
          startDateTime,
          endDateTime,
          reason,
          totalHours,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.log(res);

        message.error(data.message || "Gửi đơn nghỉ thất bại");
        messageApi.open({
          type: "error",
          content: "Gửi đơn nghỉ thất bại",
        });
      } else {
        message.success("Gửi đơn nghỉ thành công");
        messageApi.open({
          type: "success",
          content: "Gửi đơn nghỉ thành công",
        });
        setCreateRequest(false);
        getRequestsLeave();
      }
    } catch {
      message.error("Lỗi gửi đơn nghỉ");
      messageApi.open({
        type: "success",
        content: "Lỗi gửi đơn nghỉ",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequestsLeave();
  }, []);

  return (
    <div className="w-full p-4">
      {contextHolder}
      {/* Modal */}
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

      {/* Header + Nút */}
      <div className="flex flex-col  sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <p className="font-bold text-xl text-[#4a4a6a]">Phiếu yêu cầu</p>
        <button
          className="flex gap-2 items-center  h-10 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] text-white text-sm font-semibold w-fit"
          onClick={() => setCreateRequest(true)}
        >
          <Plus size={16} />
          Tạo phiếu yêu cầu
        </button>
      </div>

      {/* Table responsive */}
      {isMobile ? (
        <div className="space-y-4">
          {formatted.map((item) => (
            <div
              key={item.id}
              className="rounded-lg p-4 shadow-sm bg-white shadow-card-request"
            >
              <div className="w-full flex justify-between">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-bold ${
                      item.status === "pending"
                        ? " text-[#1181c8]"
                        : item.status === "approved"
                        ? "text-[#0b5705] "
                        : " text-[#eb2128]"
                    }`}
                  >
                    {item.status === "pending"
                      ? "Đang chờ"
                      : item.status === "approved"
                      ? "Chấp nhận"
                      : "Từ chối"}
                  </p>

                  <div className="italic text-sm">- {item.startDate}</div>
                </div>
                <button
                  className="mt-2 text-blue-500 underline"
                  onClick={() => DetailRequetsLeave(item.id)}
                >
                  <ExclamationCircleOutlined />
                </button>
              </div>
              <div className="flex justify-between">
                <p>
                  <span className="font-semibold">Tên: </span>
                  {item.name}
                </p>
                <p>
                  <span className="font-semibold">Tổng giờ: </span>
                  {item.totalHours}
                </p>
              </div>

              <p>
                <span className="font-semibold">Loại phép: </span>
                {item.leaveType}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <Table<DataType>
            className={styles.customTable}
            columns={columns}
            dataSource={formatted}
            pagination={{ pageSize: 12 }}
            scroll={{ y: "calc(100vh - 320px)", x: "100%" }}
            size="small"
          />
        </div>
      )}
    </div>
  );
}
