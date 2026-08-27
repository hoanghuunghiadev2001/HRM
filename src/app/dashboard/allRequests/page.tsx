/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";

import React from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Pagination,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import type { TableProps, TreeSelectProps } from "antd";
import {
  CalendarOutlined,
  CheckCircleFilled,
  EyeOutlined,
  FilterOutlined,
  IdcardOutlined,
  ReloadOutlined,
  ScheduleOutlined,
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  AllRequests,
  fetchLeaveRequests,
  RequestLeave,
} from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { StatusLeave } from "@/components/function";
import ModalDetailLeave from "@/components/modalDetailLeave";
import { createStyles } from "antd-style";
import ModalNeedApproved from "@/components/modalNeedApproved";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TreeSelect } from "antd/lib";
import { Department } from "@/lib/interface";
import { useAppSelector } from "@/store/hook";
import ExportLeaveRequests from "@/components/exportLeave";
import { DatePicker } from "antd";
import ModalCalendarLeave from "@/components/modalCalendarLeave";

// Extend plugin
dayjs.extend(utc);
dayjs.extend(timezone);

export interface ApproverInfo {
  name: string | null;
  employeeCode: string | null;
  departmentName: string | null;
  positionName: string | null;
  stepLevel: number;
  approvedAt: string | null; // ISO string
}

// 🆕 Một người duyệt trong 1 cấp (kèm trạng thái pending/approved/rejected/revoked)
export interface ApprovalChainApprover {
  name: string | null;
  employeeCode: string | null;
  departmentName: string | null;
  positionName: string | null;
  status: "pending" | "approved" | "rejected" | "revoked";
  approvedAt: string | null;
}

// 🆕 Một cấp duyệt (level) trong chuỗi phê duyệt, gồm nhiều người duyệt song song
export interface ApprovalChainStep {
  stepId: number;
  level: number;
  status: "pending" | "approved" | "rejected" | "revoked";
  approvedAt: string | null;
  approvers: ApprovalChainApprover[];
}

export interface PendingApprovalItem {
  stepId: number; // ID của step hiện tại
  leaveRequestId: number; // ID đơn nghỉ phép
  employeeId: number; // ID nhân viên gửi đơn
  employeeName: string | null; // Tên nhân viên
  employeeCode: string | null; // Mã nhân viên
  leaveType: string; // Loại phép
  startDate: string; // ISO string
  endDate: string; // ISO string
  totalHours: number;
  reason: string | null;
  status: string; // Trạng thái step hiện tại
  department: string | null; // Tên phòng ban
  position: string | null; // Tên chức vụ
  currentStepLevel: number; // Level step hiện tại
  handoverFileId: string | null;
  approversWhoApproved?: ApproverInfo[]; // (giữ lại để tương thích ngược)
  approvalChain?: ApprovalChainStep[]; // 🆕 toàn bộ chuỗi phê duyệt, mọi cấp
}

export interface dataNeedApprove {
  leaveRequest: LeaveRequestNeedApprove;
  approversWhoApproved: ApproversWhoApproved[];
}
export interface ApproversWhoApproved {
  name: string;
  employeeCode: string;
  approvedAt: string;
  stepLevel: number;
  departmentName: string;
  positionName: string;
}

export interface LeaveRequestNeedApprove {
  id: number;
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  reason: string;
  status: string;
  approvedBy: any;
  approvedAt: any;
  createdAt: string;
  approvalSteps: ApprovalStepNeedApprove[];
  employee: EmployeeNeedApprove;
}

export interface ApprovalStepNeedApprove {
  id: number;
  leaveRequestId: number;
  level: number;
  status: string;
  approvedAt: any;
  approvers: any[];
}

export interface EmployeeNeedApprove {
  id: number;
  name: string;
  employeeCode: string;
  workInfo: WorkInfoNeedApprove;
}

export interface WorkInfoNeedApprove {
  department: Department;
  position: PositionNeedApprove;
}

export interface DepartmentNeedApprove {
  id: number;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
  headId: any;
  directorId: any;
}

export interface PositionNeedApprove {
  id: number;
  name: string;
  level: number;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
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
  approvers: string;
}

const useStyle = createStyles((utils) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { css, token } = utils as { css: any; token: { antCls?: string } };
  const antCls = token.antCls || ".ant";
  return {
    customTable: css`
      ${antCls}-table {
        border-radius: 0 !important;

        ${antCls}-table-thead > tr > th {
          background: #f8fafc !important;
          color: #475569;
          font-weight: 600;
          font-size: 13px;
          border-bottom: 1px solid #eef0f3 !important;
        }

        ${antCls}-table-thead
        > tr
          > th:not(:last-child):not(${antCls}-table-selection-column)::before {
          display: none;
        }

        ${antCls}-table-tbody > tr > td {
          font-size: 13.5px;
          color: #1f2937;
        }

        ${antCls}-table-tbody > tr:hover > td {
          background: #f6f9fc !important;
        }

        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #d9dee5 transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
    filterCard: css`
      ${antCls}-card-body {
        padding: 20px 24px;
      }
      ${antCls}-form-item-label > label {
        font-weight: 600;
        color: #374151;
        font-size: 13px;
      }
    `,
  };
});

export interface ApproveRequestPayload {
  stepId: number; // ID của step hiện tại
  approverId: number; // ID của người đang phê duyệt
  decision: "approved" | "rejected"; // trạng thái phê duyệt
  comment?: string;
}

// 🆕 Danh sách chi nhánh — khớp enum BrandType trong schema.prisma
const BRAND_OPTIONS = [
  { value: "TBD", label: "TBD — Bình Dương" },
  { value: "TMP", label: "TMP — Mỹ Phước" },
];

const BRAND_GRADIENT = "linear-gradient(135deg, #4c809e 0%, #001935 100%)";

export default function AllRequestPage() {
  const [allRequestsApproved, setAllRequestsApproved] = useState<AllRequests>();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalDetailLeave, setModalDetailLeave] = useState<boolean>(false);
  const [infoRequetLeave, setInfoRequestLeave] = useState<RequestLeave>();
  const [modalNeedApproved, setModalNeedApproved] = useState<boolean>(false);
  const [modalCalendarLeave, setModalCalendarLeave] = useState<boolean>(false);

  const [pageSize, setPageSize] = useState(10);
  const [pageTable, setPageTable] = useState(1);
  const [totalTable, setTotalTable] = useState();
  const [requestsNeedApprove, setRequestsNeedApprove] = useState<
    PendingApprovalItem[]
  >([]);
  const { role, id, department, departmentID } = useAppSelector(
    (state) => state.user,
  );

  const [departments, setDepartments] = useState<Department[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setDepartment] = useState<string>();
  const [filterBrand, setFilterBrand] = useState<string>(""); // 🆕 chi nhánh
  const [filterDate, setFilterDate] = useState<string>("");
  const [datePickerKey, setDatePickerKey] = useState(0); // reset DatePicker visually

  const onChangeSelectDepartment = (newValue: string) => {
    setDepartment(newValue);
  };

  const onChangeSelectBrand = (newValue: string) => {
    setFilterBrand(newValue ?? "");
  };

  const getPendingApprovals = async (
    userId: number,
  ): Promise<PendingApprovalItem[]> => {
    try {
      const res = await fetch(`/api/leave/all-requests-need-approve`);
      if (!res.ok) {
        throw new Error("Lấy danh sách cần phê duyệt thất bại");
      }
      const data: PendingApprovalItem[] = await res.json();
      setRequestsNeedApprove(data);
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const treeData = departments.map((dept) => ({
    value: dept.id.toString(),
    title: dept.name.toString(),
    key: dept.id,
    children: dept.positions.map((pos: any) => ({
      value: `${dept.id}-${pos.id}`,
      title: ` ${pos.name}`,
      key: `${dept.id}-${pos.id}`,
    })),
  }));

  const onPopupScroll: TreeSelectProps["onPopupScroll"] = (e) => {};

  const getApiAllRequestsApproved = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const res = await fetchLeaveRequests({
        page: page,
        pageSize: pageSize,
        role: role,
        department:
          role === "ADMIN" ? filterDepartment : (String(departmentID) ?? ""),
        employeeCode: filterMSNV,
        name: filterName,
        status: "",
        startDate: filterDate,
        endDate: filterDate,
        brand: filterBrand, // 🆕
      });
      setAllRequestsApproved(res);
      setTotalTable(res.total);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Lỗi:", err);
    }
  };

  const { styles } = useStyle();

  //format và đưa dữ liệu ra table
  const formatted: DataType[] =
    allRequestsApproved?.data?.map((item, index) => ({
      key: (index + 1).toString(),
      id: item.id,
      MSNV: item.employee.employeeCode,
      name: item.employee.name,
      startDate: dayjs
        .utc(item?.startDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm"),
      endDate: dayjs
        .utc(item?.endDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm"),
      totalHours: item.totalHours.toString(),
      leaveType: item.leaveType,
      status: item.status,
      approvedBy: item.approversSummary,
      approvers: item.approversSummary ?? "",
    })) || [];

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "STT",
      dataIndex: "key",
      rowScope: "row",
      width: "56px",
      align: "center",
      render: (_) => <span className="text-[#94a3b8]">{_}</span>,
    },
    {
      title: "MSNV",
      dataIndex: "MSNV",
      width: "90px",
      render: (text, record) => (
        <span className="font-medium">
          {text} - ({record.id})
        </span>
      ),
    },
    {
      title: "Tên NV",
      dataIndex: "name",
      key: "name",
      width: "170px",
      render: (text) => (
        <a className="font-medium text-[#1e4f6e] hover:text-[#4c809e]">
          {text}
        </a>
      ),
    },
    {
      title: "Ngày nghỉ",
      dataIndex: "startDate",
      key: "age",
      width: "170px",
    },
    {
      title: "Loại phép",
      dataIndex: "leaveType",
      key: "leaveType",
      width: "100px",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "120px",
      render: (status) => <StatusLeave status={status} />,
    },
    {
      title: "Người phê duyệt",
      dataIndex: "approvedBy",
      key: "approvedBy",
      width: "170px",
      render: (text) => <span className="text-[#6b7280]">{text || "—"}</span>,
    },
    {
      title: "Chi tiết",
      key: "action",
      width: "90px",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            className="!text-[#4c809e] hover:!text-[#001935] hover:!bg-[#eef4f8]"
            onClick={() => DetailRequetsLeave(record.id)}
          >
            Chi tiết
          </Button>
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

  // chức năng phê duyệt đơn xin nghỉ
  const putApprovedRequest = async (payload: ApproveRequestPayload) => {
    try {
      const res = await fetch("/api/leave/create-requests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Phê duyệt thất bại");
      } else {
        getPendingApprovals(Number(id) ?? 0);
      }

      return await res.json();
    } catch (error) {
      console.error("Lỗi khi phê duyệt đơn:", error);
      throw error;
    }
  };

  const onPageChange = (page: number, pageSizeEnter?: number) => {
    if (pageSizeEnter) {
      setPageSize(pageSizeEnter);
      getApiAllRequestsApproved(page, pageSizeEnter);
    } else {
      setPageTable(page);
      getApiAllRequestsApproved(page, pageSize);
    }
  };

  // lấy danh sách bộ phận
  const listDepartment = async () => {
    const res = await fetch("/api/departments");
    if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
    const departmentsData = await res.json(); //
    setDepartments(departmentsData);
  };

  // 🆕 Xóa toàn bộ điều kiện lọc và tìm lại
  const handleResetFilters = () => {
    setFilterMSNV("");
    setFilterName("");
    setDepartment(undefined);
    setFilterBrand("");
    setFilterDate("");
    setDatePickerKey((k) => k + 1);
    setPageTable(1);
    // Gọi API ngay với state đã reset ở lần render tiếp theo
    setTimeout(() => getApiAllRequestsApproved(1, pageSize), 0);
  };

  useEffect(() => {
    getPendingApprovals(Number(id) ?? 0);
    getApiAllRequestsApproved(pageTable, pageSize);
    listDepartment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasActiveFilters =
    !!filterMSNV ||
    !!filterName ||
    !!filterDepartment ||
    !!filterBrand ||
    !!filterDate;

  return (
    <div className="min-h-full bg-[#f7f8fa] -m-4 p-4 md:-m-6 md:p-6">
      <ModalNeedApproved
        onClose={() => {
          getPendingApprovals(Number(id) ?? 0);
          setModalNeedApproved(false);
          getApiAllRequestsApproved(pageTable, pageSize);
        }}
        open={modalNeedApproved}
        allRequestsApproved={requestsNeedApprove}
        putApprovedRequest={putApprovedRequest}
      />
      <ModalCalendarLeave
        onClose={() => {
          setModalCalendarLeave(false);
        }}
        open={modalCalendarLeave}
      />
      <ModalDetailLeave
        infoRequetLeave={infoRequetLeave}
        onClose={() => {
          setModalDetailLeave(false);
          getApiAllRequestsApproved(pageTable, pageSize);
        }}
        open={modalDetailLeave}
        title="Chi Tiết Đơn Xin Phép"
      />
      <ModalLoading isOpen={loading} />
      {contextHolder}

      {/* ===== Page header ===== */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
        <div>
          <span className="inline-block text-[11px] font-bold tracking-wider text-[#4c809e] uppercase mb-1">
            Quản lý nghỉ phép
          </span>
          <h1 className="text-[22px] leading-tight font-bold text-[#1f2937] m-0">
            Danh sách phiếu yêu cầu
          </h1>
        </div>

        <Badge
          count={requestsNeedApprove.length}
          overflowCount={99}
          offset={[-4, 4]}
          color="#dc2626"
        >
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleFilled />}
            className="!border-none !font-semibold !shadow-[0_4px_10px_rgba(0,25,53,0.25)] !h-10 !px-5 !rounded-lg"
            style={{ background: BRAND_GRADIENT }}
            onClick={() => setModalNeedApproved(true)}
          >
            Phê duyệt
          </Button>
        </Badge>
      </div>

      {/* ===== Filter bar ===== */}
      <Card
        bordered={false}
        className={`!mb-5 !rounded-2xl !shadow-[0_1px_2px_rgba(16,24,40,0.06)] !border !border-[#e8eaee] ${styles.filterCard}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <FilterOutlined className="text-[#4c809e] text-[15px]" />
          <span className="font-semibold text-[#1f2937] text-[15px]">
            Bộ lọc tìm kiếm
          </span>
          {hasActiveFilters && (
            <span className="ml-1 text-[11px] font-medium text-white bg-[#4c809e] rounded-full px-2 py-[1px]">
              đang áp dụng
            </span>
          )}
        </div>

        <Row gutter={[16, 12]} align="bottom">
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="MSNV" className="!mb-0">
              <Input
                prefix={<IdcardOutlined className="text-[#9aa4b2]" />}
                placeholder="Mã số NV"
                allowClear
                value={filterMSNV}
                onChange={(e) => setFilterMSNV(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    getApiAllRequestsApproved(pageTable, pageSize);
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={5}>
            <Form.Item label="Tên NV" className="!mb-0">
              <Input
                prefix={<UserOutlined className="text-[#9aa4b2]" />}
                placeholder="Tên nhân viên"
                allowClear
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    getApiAllRequestsApproved(pageTable, pageSize);
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Ngày nghỉ" className="!mb-0">
              <DatePicker
                key={datePickerKey}
                className="!w-full"
                placeholder="Chọn ngày"
                suffixIcon={<CalendarOutlined className="text-[#9aa4b2]" />}
                onChange={(date) => {
                  if (date) setFilterDate(dayjs(date).format("YYYY-MM-DD"));
                  else setFilterDate("");
                }}
              />
            </Form.Item>
          </Col>

          {/* 🆕 Lọc theo chi nhánh */}
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Chi nhánh" className="!mb-0">
              <Select
                className="!w-full"
                placeholder="Tất cả"
                allowClear
                suffixIcon={<ShopOutlined className="text-[#9aa4b2]" />}
                value={filterBrand || undefined}
                onChange={onChangeSelectBrand}
                options={BRAND_OPTIONS}
              />
            </Form.Item>
          </Col>

          {role === "ADMIN" && (
            <Col xs={24} sm={12} md={5}>
              <Form.Item label="Bộ phận" className="!mb-0">
                <TreeSelect
                  showSearch
                  className="!w-full"
                  value={filterDepartment}
                  styles={{
                    popup: { root: { maxHeight: 400, overflow: "auto" } },
                  }}
                  placeholder="Phòng ban"
                  allowClear
                  listItemScrollOffset={200}
                  treeDefaultExpandAll={false}
                  onChange={onChangeSelectDepartment}
                  showCheckedStrategy="SHOW_ALL"
                  treeData={treeData}
                  onPopupScroll={onPopupScroll}
                />
              </Form.Item>
            </Col>
          )}

          <Col
            xs={24}
            md={role === "ADMIN" ? 24 : 6}
            className={role === "ADMIN" ? "flex justify-end" : ""}
          >
            <Form.Item className="!mb-0 w-full">
              <Space wrap className="w-full flex justify-end">
                <Button
                  icon={<ReloadOutlined />}
                  disabled={!hasActiveFilters}
                  onClick={handleResetFilters}
                >
                  Xóa lọc
                </Button>

                {role === "MANAGER" && (
                  <Button
                    icon={<ScheduleOutlined />}
                    onClick={() => setModalCalendarLeave(true)}
                    loading={loading}
                  >
                    Xem DS nghỉ
                  </Button>
                )}
                {role === "ADMIN" && (
                  <>
                    <ExportLeaveRequests />
                    <Button
                      icon={<ScheduleOutlined />}
                      onClick={() => setModalCalendarLeave(true)}
                      loading={loading}
                    >
                      Xem DS nghỉ
                    </Button>
                  </>
                )}
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  className="!border-none !font-semibold !shadow-[0_2px_6px_rgba(0,25,53,0.2)]"
                  style={{ background: BRAND_GRADIENT }}
                  onClick={() => getApiAllRequestsApproved(pageTable, pageSize)}
                >
                  Tìm kiếm
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ===== Data table ===== */}
      <Card
        bordered={false}
        className="!rounded-2xl !shadow-[0_1px_2px_rgba(16,24,40,0.06)] !border !border-[#e8eaee] !overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#eef0f3] bg-white">
          <span className="text-[13px] text-[#6b7280]">
            Tổng cộng{" "}
            <span className="font-semibold text-[#1f2937]">
              {totalTable ?? 0}
            </span>{" "}
            phiếu yêu cầu
          </span>
        </div>

        <Table<DataType>
          className={styles.customTable}
          columns={columns}
          dataSource={formatted ?? []}
          scroll={{ y: "calc(100vh - 400px)", x: "100%" }}
          pagination={false}
          size="small"
        />

        <div className="px-5 py-3 border-t border-[#eef0f3] bg-white">
          <Pagination
            align="end"
            pageSize={pageSize}
            total={totalTable}
            onChange={onPageChange}
            showSizeChanger
            onShowSizeChange={onPageChange}
          />
        </div>
      </Card>
    </div>
  );
}
