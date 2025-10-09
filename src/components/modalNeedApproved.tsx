/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Drawer, Space, Table, TableProps } from "antd";
import { createStyles } from "antd-style";
import ModalApproveRequest from "./modalApproveRequest";
import ModalLoading from "./modalLoading";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { PendingApprovalItem } from "@/app/dashboard/allRequests/page";
import { useAppSelector } from "@/store/hook";

// Extend plugin
dayjs.extend(utc);
dayjs.extend(timezone);

export interface ApproveRequestPayload {
  stepId: number; // ID của step hiện tại
  approverId: number; // ID của người đang phê duyệt
  decision: "approved" | "rejected"; // trạng thái phê duyệt
  comment?: string;
}

interface ModalNeedApprovedProps {
  open: boolean;
  onClose: () => void;
  allRequestsApproved: PendingApprovalItem[];
  putApprovedRequest: (payload: ApproveRequestPayload) => Promise<void>;
}

interface DataType {
  key: string;
  id: number;
  MSNV: string;
  name: string;
  department: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  leaveType: string;
  status: string;
}

const useStyle = createStyles((utils) => {
  const { css, token } = utils;
  const antCls = (token as any).antCls || ".ant";

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
  const [requestApprove, setRequestApprove] = useState<PendingApprovalItem>();
  const [loading, setLoading] = useState<boolean>(false);
  const { styles } = useStyle();
  const { id } = useAppSelector((state) => state.user);

  const formatted: DataType[] =
    allRequestsApproved?.map((item, index) => ({
      key: (index + 1).toString(),
      id: item.leaveRequestId,
      MSNV: item.employeeCode ?? "",
      name: item.employeeName ?? "",
      department: item.department ?? "",
      startDate: dayjs
        .utc(item.startDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm"),
      endDate: dayjs
        .utc(item.endDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm"),
      totalHours: item.totalHours.toString(),
      leaveType: item.leaveType,
      status: item.status,
    })) || [];

  const columns: TableProps<DataType>["columns"] = [
    { title: "STT", dataIndex: "key", rowScope: "row", width: "60px" },
    { title: "MSNV", dataIndex: "MSNV", width: "80px" },
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
      (emp) => emp.employeeCode === msnv
    );
    setRequestApprove(requests);
    setApproveRequest(true);
  };

  const handlePutApprovedRequest = async (
    decision: "approved" | "rejected",
    comment?: string
  ) => {
    if (!requestApprove) return;

    setLoading(true);
    try {
      await putApprovedRequest({
        stepId: requestApprove.stepId,
        approverId: Number(id) ?? 0,
        decision: decision,
        comment: comment,
      });
      setApproveRequest(false);
    } catch (err) {
      console.error("Lỗi khi phê duyệt:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Drawer
        title={<p className="text-2xl">Phê duyệt</p>}
        placement="right"
        onClose={onClose}
        width={1000}
        open={open}
      >
        <ModalLoading isOpen={loading} />
        <ModalApproveRequest
          onClose={() => setApproveRequest(false)}
          open={approvedRequest}
          requestApprove={requestApprove}
          putApprovedRequest={handlePutApprovedRequest}
        />
        <Table<DataType>
          className={styles.customTable}
          columns={columns}
          dataSource={formatted}
          pagination={{ pageSize: 12 }}
          scroll={{ y: "calc(100vh - 225px)" }}
        />
      </Drawer>
    </>
  );
};

export default ModalNeedApproved;
