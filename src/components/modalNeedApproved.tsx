import React, { useEffect, useState } from "react";
import { Drawer, Space, Table, TableProps } from "antd";
import { createStyles, FullToken } from "antd-style";
import { formatDateTime, StatusLeave } from "./function";
import { RequestLeave } from "./api";

interface ModalNeedApprovedProps {
  open: boolean;
  onClose: () => void;
  allRequestsApproved: RequestLeave[];
}
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
const ModalNeedApproved = ({
  onClose,
  open,
  allRequestsApproved,
}: ModalNeedApprovedProps) => {
  const { styles } = useStyle();

  const formatted: DataType[] =
    allRequestsApproved?.map((item, index) => ({
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
      title: "Tên NV",
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
      title: "",
      key: "action",
      width: "100px",
      render: (_, record) => (
        <Space size="middle">
          <a>Phê duyệt</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={<p>Phê duyệ</p>}
        placement="right"
        size={"large"}
        onClose={onClose}
        open={open}
      >
        <Table<DataType>
          className={styles.customTable}
          columns={columns}
          dataSource={formatted ?? []}
          pagination={{ pageSize: 6 }}
          scroll={{ y: "calc(100vh - 225px)" }}
        />
      </Drawer>
    </>
  );
};

export default ModalNeedApproved;
