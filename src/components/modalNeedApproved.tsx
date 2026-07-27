/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Avatar, Drawer, Empty, Space, Table, Tag, TableProps } from "antd";
import { createStyles } from "antd-style";
import ModalApproveRequest from "./modalApproveRequest";
import ModalLoading from "./modalLoading";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { PendingApprovalItem } from "@/app/dashboard/allRequests/page";
import { useAppSelector } from "@/store/hook";

dayjs.extend(utc);
dayjs.extend(timezone);

const LEAVE_TYPE_LABELS: Record<string, string> = {
  PN: "Phép năm",
  NB: "Nghỉ bù",
  PC: "Phép cưới",
  Cgt: "Công tác",
  PB: "Phép bệnh",
  TS: "Thai sản",
  PR: "Phép riêng",
  PT: "Phép tang",
};

export interface ApproveRequestPayload {
  stepId: number;
  approverId: number;
  decision: "approved" | "rejected";
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
  leaveRequestId: number;
}

const useStyle = createStyles((utils) => {
  const { css, token } = utils;
  const antCls = (token as any).antCls || ".ant";

  return {
    customTable: css`
      ${antCls}-table {
        border-radius: 12px;
        overflow: hidden;
        ${antCls}-table-thead > tr > th {
          background: #f7f8fa;
          font-weight: 700;
          color: #4a4a6a;
        }
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
      leaveRequestId: item.leaveRequestId,
    })) || [];

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Nhân viên",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (text, record) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            size={36}
            style={{
              background: "linear-gradient(135deg, #4c809e 0%, #001935 100%)",
              flexShrink: 0,
            }}
          >
            {text?.charAt(0) ?? "?"}
          </Avatar>
          <div className="min-w-0">
            <p
              className="cursor-pointer truncate font-semibold text-[#242424] hover:text-[#4c809e]"
              onClick={() => handleOpenRequest(record.leaveRequestId)}
            >
              {text}
            </p>
            <p className="truncate text-xs text-gray-400">{record.MSNV}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: 130,
      responsive: ["md"],
    },
    {
      title: "Ngày nghỉ",
      dataIndex: "startDate",
      key: "startDate",
      width: 170,
    },
    {
      title: "Loại phép",
      dataIndex: "leaveType",
      key: "leaveType",
      width: 120,
      render: (type: string) => (
        <Tag color="blue" className="!rounded-full">
          {LEAVE_TYPE_LABELS[type] ?? type}
        </Tag>
      ),
    },
    {
      title: "",
      key: "action",
      width: 90,
      render: (_, record) => (
        <Space
          size="middle"
          className="cursor-pointer font-semibold text-[#4c809e]"
          onClick={() => handleOpenRequest(record.leaveRequestId)}
        >
          Chi tiết
        </Space>
      ),
    },
  ];

  const handleOpenRequest = (id: number) => {
    const requests = allRequestsApproved.find(
      (emp) => emp.leaveRequestId === id,
    );
    setRequestApprove(requests);
    setApproveRequest(true);
  };

  const handlePutApprovedRequest = async (
    decision: "approved" | "rejected",
    comment?: string,
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
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold text-[#242424]">
            Phiếu chờ phê duyệt
          </p>
          <Tag color="volcano" className="!rounded-full">
            {allRequestsApproved.length}
          </Tag>
        </div>
      }
      placement="right"
      onClose={onClose}
      width={900}
      styles={{ body: { background: "#f7f8fa" } }}
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
        scroll={{ x: 700, y: "calc(100vh - 225px)" }}
        locale={{
          emptyText: <Empty description="Không có phiếu nào cần phê duyệt" />,
        }}
      />
    </Drawer>
  );
};

export default ModalNeedApproved;
