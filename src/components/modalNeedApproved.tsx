import React, { useState } from "react";
import { Drawer, Space, Table, TableProps } from "antd";
import { createStyles } from "antd-style";
import ModalApproveRequest from "./modalApproveRequest";
import ModalLoading from "./modalLoading";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { dataNeedApprove } from "@/app/dashboard/allRequests/page";

// Extend plugin
dayjs.extend(utc);
dayjs.extend(timezone);

interface ModalNeedApprovedProps {
  open: boolean;
  onClose: () => void;
  allRequestsApproved: dataNeedApprove[];
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const [requestApprove, setRequestApprove] = useState<dataNeedApprove>();
  const [loading, setLoading] = useState<boolean>(false);
  const { styles } = useStyle();

  const formatted: DataType[] =
    allRequestsApproved?.map((item, index) => ({
      key: (index + 1).toString(),
      id: item.leaveRequest.id,
      MSNV: item.leaveRequest.employee.employeeCode,
      name: item.leaveRequest.employee.name,
      department: item.leaveRequest.employee.workInfo.department,
      startDate: dayjs
        .utc(item?.leaveRequest.startDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm"),
      endDate: dayjs
        .utc(item?.leaveRequest.endDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm"),
      totalHours: item.leaveRequest.totalHours.toString(),
      leaveType: item.leaveRequest.leaveType,
      status: item.leaveRequest.status,
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
      width: "170px",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: "80px",
    },
    {
      title: "Ngày nghỉ",
      dataIndex: "startDate",
      key: "startDate",
      width: "170px",
    },
    {
      title: "Loại phép",
      dataIndex: "leaveType",
      key: "leaveType",
      width: "80px",
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
      (emp) => emp.leaveRequest.employee.employeeCode === msnv
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
