import React, { useEffect, useState } from "react";
import { Drawer, Space, Table, TableProps } from "antd";
import { createStyles, FullToken } from "antd-style";
import { formatDateTime, StatusLeave } from "./function";
import { RequestLeave } from "./api";
import ModalApproveRequest from "./modalApproveRequest";
import ModalLoading from "./modalLoading";

interface ModalNeedApprovedProps {
  open: boolean;
  onClose: () => void;
  allRequestsApproved: RequestLeave[];
  putApprovedRequest: (id: number | string, statusRequest: string) => void;
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
  putApprovedRequest,
}: ModalNeedApprovedProps) => {
  const [approvedRequest, setApproveRequest] = useState(false);
  const [requestApprove, setRequestApprove] = useState<RequestLeave>();
  const [loading, setLoading] = useState<boolean>(false);
  const { styles } = useStyle();

  const formatted: DataType[] =
    allRequestsApproved?.map((item, index) => ({
      key: (index + 1).toString(),
      id: item.id,
      MSNV: item.employee.employeeCode,
      name: item.employee.name,
      department: item.employee.workInfo.department,
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
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Ngày nghỉ",
      dataIndex: "startDate",
      key: "startDate",
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
        <Space size="middle" onClick={() => handleOpenRequest(record.MSNV)}>
          <a>Phê duyệt</a>
        </Space>
      ),
    },
  ];

  const handleOpenRequest = (msnv: string) => {
    const requests = allRequestsApproved.find(
      (emp) => emp.employee.employeeCode === msnv
    );
    setRequestApprove(requests);
    setApproveRequest(true);
  };

  const handlePutApprovedRequest = (
    id: number | string,
    stautsRequest: string
  ) => {
    setLoading(true);
    try {
      putApprovedRequest(id, stautsRequest);
      setApproveRequest(false);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi:", err);
      setLoading(false);
    }
  };

  return (
    <>
      <Drawer
        title={<p className="text-2xl">Phê duyệt</p>}
        placement="right"
        // size={"large"}
        onClose={onClose}
        width={1000}
        open={open}
      >
        <ModalLoading isOpen={loading} />
        <ModalApproveRequest
          onClose={() => {
            setApproveRequest(false);
          }}
          open={approvedRequest}
          requestApprove={requestApprove}
          putApprovedRequest={handlePutApprovedRequest}
        />
        <Table<DataType>
          className={styles.customTable}
          columns={columns}
          dataSource={formatted ?? []}
          pagination={{ pageSize: 12 }}
          scroll={{ y: "calc(100vh - 225px)" }}
        />
      </Drawer>
    </>
  );
};

export default ModalNeedApproved;
