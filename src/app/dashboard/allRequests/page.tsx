"use client";
import { useEffect, useState } from "react";

import React from "react";
import { message, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import {
  AllRequests,
  fetchLeaveRequests,
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
import ModalNeedApproved from "@/components/modalNeedApproved";

interface DataType {
  key: string;
  id: number;
  MSNV: string;
  name: string;
  startDate: string;
  endDate: string;
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
export default function request() {
  const [allRequestsApproved, setAllRequestsApproved] = useState<AllRequests>();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalDetailLeave, setModalDetailLeave] = useState<boolean>(false);
  const [infoRequetLeave, setInfoRequestLeave] = useState<RequestLeave>();
  const [modalNeedApproved, setModalNeedApproved] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState(0);
  const [page, setPage] = useState(0);
  const [requests, setRequests] = useState<RequestLeave[]>([]);

  const getApiAllRequestsApproved = async () => {
    try {
      const data = await fetchLeaveRequests({
        page: page,
        pageSize: pageSize,
        name: "",
        employeeCode: "",
        department: "",
        status: "",
      });
      console.log("Kết quả:", data);
      setAllRequestsApproved(data);
    } catch (err) {
      console.error("Lỗi:", err);
    }
  };

  const getApiAllRequestsNeed = async () => {
    async function fetchPendingRequests() {
      setLoading(true);
      try {
        const res = await fetch("/api/leave/all-requests-need-approve"); // URL API của bạn
        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data = await res.json();
        setRequests(data);
      } catch (err: any) {
        console.log(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchPendingRequests();
  };

  const { styles } = useStyle();

  //format và đưa dữ liệu ra table
  const formatted: DataType[] =
    allRequestsApproved?.data?.map((item, index) => ({
      key: (index + 1).toString(),
      id: item.id,
      MSNV: item.employee.employeeCode,
      name: item.employee.name,
      startDate: formatDateTime(item.startDate),
      endDate: formatDateTime(item.endDate),
      totalHours: item.totalHours.toString(),
      leaveType: item.leaveType,
      status: item.status,
    })) || [];

  console.log(allRequestsApproved?.data);

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "STT",
      dataIndex: "key",
      rowScope: "row",
      width: "60px",
    },
    {
      title: "MSNV",
      dataIndex: "MSNV",
      width: "80px",
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
    const item = allRequestsApproved?.data?.find((item) => item.id === id);
    setInfoRequestLeave(item);
    setModalDetailLeave(true);
  };

  useEffect(() => {
    getApiAllRequestsApproved();
    getApiAllRequestsNeed();
  }, []);

  //style table scroll

  return (
    <div>
      <ModalNeedApproved
        onClose={() => setModalNeedApproved(false)}
        open={modalNeedApproved}
      />
      <ModalDetailLeave
        infoRequetLeave={infoRequetLeave}
        onClose={() => setModalDetailLeave(false)}
        open={modalDetailLeave}
        title="Chi Tiết Đơn Xin Phép"
      />
      <ModalLoading isOpen={loading} />

      <div className="w-full">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          Danh sách phiếu yêu cầu:
        </p>
      </div>
      <div className="w-full">
        <div className="flex justify-end mb-3 relative">
          <button
            className="flex mt-4  gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold"
            onClick={() => {
              setModalNeedApproved(true);
            }}
          >
            Phê duyệt
          </button>
          <div className="h-8 right-[-10px] top-[-8px] flex justify-center items-center w-8 rounded-[50%] bg-red-600 text-white font-semibold absolute">
            {requests.length > 99 ? "99+" : requests.length}
          </div>
        </div>
        <Table<DataType>
          className={styles.customTable}
          columns={columns}
          dataSource={formatted ?? []}
          pagination={{ pageSize: 6 }}
          scroll={{ y: "calc(100vh - 305px)" }}
        />
      </div>
    </div>
  );
}
