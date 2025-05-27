/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Table } from "antd";
import { createStyles } from "antd-style";
import { useMemo } from "react";
import { StatusLeave } from "./function";

// Định nghĩa kiểu dữ liệu
interface LeaveRequest {
  id: number;
  employee?: {
    name: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface DataType {
  key: number; // Bổ sung key để Table hoạt động tốt hơn
  name: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: string;
}

// Bổ sung props có kiểu rõ ràng
interface RecentLeaveRequestsProps {
  leaveRequests?: LeaveRequest[];
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

export function RecentLeaveRequests({
  leaveRequests = [],
}: RecentLeaveRequestsProps) {
  const { styles } = useStyle();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleDateString("vi-VN");
  };

  const formattedData: DataType[] = useMemo(
    () =>
      leaveRequests.map((item) => ({
        key: item.id, // thêm key
        name: item.employee?.name || "N/A",
        startDate: formatDate(item.startDate),
        endDate: formatDate(item.endDate),
        leaveType: item.leaveType,
        status: item.status,
      })),
    [leaveRequests]
  );

  return (
    <Table<DataType>
      dataSource={formattedData}
      columns={[
        {
          title: "Tên nhân viên",
          dataIndex: "name",
          key: "name",
          render: (text) => <strong>{text}</strong>,
          width: "150px",
        },
        {
          title: "Loại phép",
          dataIndex: "leaveType",
          key: "leaveType",
          width: "80px",
        },
        {
          title: "Từ ngày",
          dataIndex: "startDate",
          key: "startDate",
          width: "120px",
        },
        {
          title: "Đến ngày",
          dataIndex: "endDate",
          key: "endDate",
          width: "120px",
        },
        {
          title: "Trạng thái",
          dataIndex: "status",
          key: "status",
          width: "120px",
          render: (_, record) => <StatusLeave status={record.status} />,
        },
      ]}
      pagination={{ pageSize: 10 }}
      locale={{
        emptyText: "Không có dữ liệu",
      }}
      className={styles.customTable}
      scroll={{ y: "calc(100vh - 305px)", x: "100%" }}
    />
  );
}
