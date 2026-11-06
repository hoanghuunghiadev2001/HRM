/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Grid,
  Input,
  message,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  TreeSelect,
} from "antd";
import type { TableProps } from "antd";
import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  IdcardOutlined,
  ReloadOutlined,
  ScheduleOutlined,
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import {
  AllRequests,
  fetchLeaveRequests,
  RequestLeave,
} from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { StatusLeave } from "@/components/function";
import ModalDetailLeave from "@/components/modalDetailLeave";
import ModalNeedApproved, {
  ApproveRequestPayload,
} from "@/components/modalNeedApproved";
import ModalCalendarLeave from "@/components/modalCalendarLeave";
import ExportLeaveRequests from "@/components/exportLeave";
import { Department } from "@/lib/interface";
import { useAppSelector } from "@/store/hook";

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
/* ------------------------------ Constants ------------------------------ */

const TZ = "Asia/Ho_Chi_Minh";
const API_DATE_FORMAT = "YYYY-MM-DD";
const DISPLAY_FORMAT = "DD/MM/YYYY HH:mm";

const BRAND_OPTIONS = [
  { value: "TBD", label: "TBD — Bình Dương" },
  { value: "TMP", label: "TMP — Mỹ Phước" },
];

const BRAND_GRADIENT = "linear-gradient(135deg, #4c809e 0%, #001935 100%)";

interface Filters {
  msnv: string;
  name: string;
  department?: string;
  brand?: string;
  month: Dayjs | null;
}

const EMPTY_FILTERS: Filters = {
  msnv: "",
  name: "",
  department: undefined,
  brand: undefined,
  month: null,
};

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

/* -------------------------------- Styles -------------------------------- */

const useStyle = createStyles(({ css, token }) => {
  const antCls = (token as { antCls?: string }).antCls || ".ant";
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-thead > tr > th {
          background: #f8fafc !important;
          color: #475569;
          font-weight: 600;
          font-size: 13px;
          border-bottom: 1px solid #eef0f3 !important;
          white-space: nowrap;
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
        ${antCls}-table-body {
          scrollbar-width: thin;
          scrollbar-color: #d9dee5 transparent;
        }
      }
    `,
    filterCard: css`
      ${antCls}-form-item-label > label,
      .filter-label {
        font-weight: 600;
        color: #374151;
        font-size: 13px;
      }
    `,
  };
});

/* ----------------------------- Small components ----------------------------- */

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="filter-label">{label}</label>
      {children}
    </div>
  );
}

function MobileRequestCard({
  item,
  onDetail,
}: {
  item: DataType;
  onDetail: (id: number) => void;
}) {
  return (
    <div
      className="rounded-xl border border-[#e8eaee] bg-white p-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] active:bg-[#f6f9fc]"
      onClick={() => onDetail(item.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-semibold text-[#1e4f6e]">
            {item.name}
          </div>
          <div className="text-xs text-[#94a3b8]">
            {item.MSNV} · #{item.id}
          </div>
        </div>
        <StatusLeave status={item.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
        <div className="col-span-2 flex items-center gap-2 text-[#1f2937]">
          <CalendarOutlined className="text-[#4c809e]" />
          <span>
            {item.startDate} → {item.endDate}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#475569]">
          <ScheduleOutlined className="text-[#4c809e]" />
          <span>{item.leaveType}</span>
        </div>
        <div className="flex items-center gap-2 text-[#475569]">
          <ClockCircleOutlined className="text-[#4c809e]" />
          <span>{item.totalHours} giờ</span>
        </div>
        <div className="col-span-2 flex items-center gap-2 text-[#6b7280]">
          <UserOutlined className="text-[#4c809e]" />
          <span className="truncate">{item.approvers || "—"}</span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function AllRequestPage() {
  const { styles } = useStyle();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const { role, id, departmentID } = useAppSelector((state) => state.user);
  const [messageApi, contextHolder] = message.useMessage();

  // data
  const [data, setData] = useState<AllRequests>();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [requestsNeedApprove, setRequestsNeedApprove] = useState<
    PendingApprovalItem[]
  >([]);

  // paging
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // filters: `filters` = giá trị đang nhập, `appliedRef` = giá trị đã áp dụng
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const appliedRef = useRef<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false); // chỉ dùng cho mobile

  // modals
  const [modalDetailLeave, setModalDetailLeave] = useState(false);
  const [modalNeedApproved, setModalNeedApproved] = useState(false);
  const [modalCalendarLeave, setModalCalendarLeave] = useState(false);
  const [infoRequestLeave, setInfoRequestLeave] = useState<RequestLeave>();

  const patchFilters = (patch: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  /* ------------------------------- API calls ------------------------------- */

  const fetchData = useCallback(
    async (nextPage: number, nextSize: number, f: Filters) => {
      setLoading(true);
      try {
        const res = await fetchLeaveRequests({
          page: nextPage,
          pageSize: nextSize,
          role,
          department:
            role === "ADMIN" ? f.department : String(departmentID ?? ""),
          employeeCode: f.msnv.trim(),
          name: f.name.trim(),
          status: "",
          // Lọc theo tháng: từ ngày đầu đến ngày cuối của tháng
          startDate: f.month
            ? f.month.startOf("month").format(API_DATE_FORMAT)
            : "",
          endDate: f.month
            ? f.month.endOf("month").format(API_DATE_FORMAT)
            : "",
          brand: f.brand ?? "",
        });
        setData(res);
        setTotal(res.total ?? 0);
        setPage(nextPage);
        setPageSize(nextSize);
      } catch (err) {
        console.error("Lỗi tải danh sách phiếu:", err);
        messageApi.error("Không thể tải danh sách phiếu yêu cầu");
      } finally {
        setLoading(false);
      }
    },
    [role, departmentID, messageApi],
  );

  const getPendingApprovals = useCallback(async () => {
    try {
      const res = await fetch("/api/leave/all-requests-need-approve");
      if (!res.ok) throw new Error("Lấy danh sách cần phê duyệt thất bại");
      setRequestsNeedApprove(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
      setDepartments(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  const putApprovedRequest = async (payload: ApproveRequestPayload) => {
    const res = await fetch("/api/leave/create-requests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.error || "Phê duyệt thất bại");
    }
    getPendingApprovals();
    return res.json();
  };

  /* -------------------------------- Handlers -------------------------------- */

  const handleSearch = () => {
    appliedRef.current = filters;
    setShowFilters(false);
    fetchData(1, pageSize, filters);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    appliedRef.current = EMPTY_FILTERS;
    fetchData(1, pageSize, EMPTY_FILTERS);
  };

  const handlePageChange = (nextPage: number, nextSize: number) => {
    // đổi pageSize thì quay về trang 1
    const targetPage = nextSize !== pageSize ? 1 : nextPage;
    fetchData(targetPage, nextSize, appliedRef.current);
  };

  const handleOpenDetail = (requestId: number) => {
    setInfoRequestLeave(data?.data?.find((item) => item.id === requestId));
    setModalDetailLeave(true);
  };

  const refreshCurrent = () => fetchData(page, pageSize, appliedRef.current);

  useEffect(() => {
    getPendingApprovals();
    loadDepartments();
    fetchData(1, 10, EMPTY_FILTERS);
  }, [getPendingApprovals, loadDepartments, fetchData]);

  /* ------------------------------ Derived data ------------------------------ */

  const activeFilterCount = useMemo(
    () =>
      [
        filters.msnv,
        filters.name,
        filters.department,
        filters.brand,
        filters.month,
      ].filter(Boolean).length,
    [filters],
  );

  const treeData = useMemo(
    () =>
      departments.map((dept) => ({
        value: dept.id.toString(),
        title: dept.name.toString(),
        key: dept.id,
        children: dept.positions.map((pos: any) => ({
          value: `${dept.id}-${pos.id}`,
          title: pos.name,
          key: `${dept.id}-${pos.id}`,
        })),
      })),
    [departments],
  );

  const rows: DataType[] = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        key: String((page - 1) * pageSize + index + 1),
        id: item.id,
        MSNV: item.employee.employeeCode,
        name: item.employee.name,
        startDate: dayjs.utc(item.startDate).tz(TZ).format(DISPLAY_FORMAT),
        endDate: dayjs.utc(item.endDate).tz(TZ).format(DISPLAY_FORMAT),
        totalHours: String(item.totalHours),
        leaveType: item.leaveType,
        status: item.status,
        approvers: item.approversSummary ?? "",
      })) ?? [],
    [data, page, pageSize],
  );

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "STT",
      dataIndex: "key",
      width: 56,
      align: "center",
      render: (v) => <span className="text-[#94a3b8]">{v}</span>,
    },
    {
      title: "MSNV",
      dataIndex: "MSNV",
      width: 110,
      render: (text, record) => (
        <span className="font-medium">
          {text} <span className="text-[#94a3b8]">#{record.id}</span>
        </span>
      ),
    },
    {
      title: "Tên NV",
      dataIndex: "name",
      width: 170,
      render: (text) => (
        <span className="font-medium text-[#1e4f6e]">{text}</span>
      ),
    },
    {
      title: "Thời gian nghỉ",
      key: "range",
      width: 300,
      render: (_, r) => (
        <span>
          {r.startDate} <span className="text-[#94a3b8]">→</span> {r.endDate}
        </span>
      ),
    },
    {
      title: "Số giờ",
      dataIndex: "totalHours",
      width: 80,
      align: "center",
    },
    { title: "Loại phép", dataIndex: "leaveType", width: 110 },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 130,
      render: (status) => <StatusLeave status={status} />,
    },
    {
      title: "Người phê duyệt",
      dataIndex: "approvers",
      width: 190,
      render: (text) => <span className="text-[#6b7280]">{text || "—"}</span>,
    },
    {
      title: "",
      key: "action",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          className="!text-[#4c809e] hover:!text-[#001935] hover:!bg-[#eef4f8]"
          onClick={() => handleOpenDetail(record.id)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  /* ---------------------------------- Render ---------------------------------- */

  const filterBody = (
    <Row gutter={[12, 12]}>
      <Col xs={24} sm={12} lg={4}>
        <FilterField label="MSNV">
          <Input
            prefix={<IdcardOutlined className="text-[#9aa4b2]" />}
            placeholder="Mã số NV"
            allowClear
            value={filters.msnv}
            onChange={(e) => patchFilters({ msnv: e.target.value })}
            onPressEnter={handleSearch}
          />
        </FilterField>
      </Col>

      <Col xs={24} sm={12} lg={5}>
        <FilterField label="Tên NV">
          <Input
            prefix={<UserOutlined className="text-[#9aa4b2]" />}
            placeholder="Tên nhân viên"
            allowClear
            value={filters.name}
            onChange={(e) => patchFilters({ name: e.target.value })}
            onPressEnter={handleSearch}
          />
        </FilterField>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <FilterField label="Tháng nghỉ">
          <DatePicker
            picker="month"
            className="!w-full"
            placeholder="Chọn tháng"
            format="MM/YYYY"
            allowClear
            value={filters.month}
            suffixIcon={<CalendarOutlined className="text-[#9aa4b2]" />}
            onChange={(month) => patchFilters({ month })}
          />
        </FilterField>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <FilterField label="Chi nhánh">
          <Select
            className="!w-full"
            placeholder="Tất cả"
            allowClear
            suffixIcon={<ShopOutlined className="text-[#9aa4b2]" />}
            value={filters.brand}
            onChange={(brand) => patchFilters({ brand: brand ?? undefined })}
            options={BRAND_OPTIONS}
          />
        </FilterField>
      </Col>

      {role === "ADMIN" && (
        <Col xs={24} sm={12} lg={5}>
          <FilterField label="Bộ phận">
            <TreeSelect
              showSearch
              allowClear
              className="!w-full"
              placeholder="Phòng ban"
              value={filters.department}
              treeData={treeData}
              treeNodeFilterProp="title"
              treeDefaultExpandAll={false}
              styles={{ popup: { root: { maxHeight: 400, overflow: "auto" } } }}
              onChange={(department) => patchFilters({ department })}
            />
          </FilterField>
        </Col>
      )}
    </Row>
  );

  const actionBar = (
    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
      <Button
        icon={<ReloadOutlined />}
        disabled={activeFilterCount === 0}
        onClick={handleReset}
        className="max-sm:flex-1"
      >
        Xóa lọc
      </Button>

      {(role === "ADMIN" || role === "MANAGER") && (
        <Button
          icon={<ScheduleOutlined />}
          onClick={() => setModalCalendarLeave(true)}
          className="max-sm:flex-1"
        >
          Xem DS nghỉ
        </Button>
      )}

      {role === "ADMIN" && <ExportLeaveRequests />}

      <Button
        type="primary"
        icon={<SearchOutlined />}
        className="!border-none !font-semibold !shadow-[0_2px_6px_rgba(0,25,53,0.2)] max-sm:!w-full"
        style={{ background: BRAND_GRADIENT }}
        onClick={handleSearch}
      >
        Tìm kiếm
      </Button>
    </div>
  );

  return (
    <div className="min-h-full bg-[#f7f8fa] -m-4 p-3 sm:p-4 md:-m-6 md:p-6">
      <ModalNeedApproved
        open={modalNeedApproved}
        allRequestsApproved={requestsNeedApprove}
        putApprovedRequest={putApprovedRequest}
        onClose={() => {
          setModalNeedApproved(false);
          getPendingApprovals();
          refreshCurrent();
        }}
      />
      <ModalCalendarLeave
        open={modalCalendarLeave}
        onClose={() => setModalCalendarLeave(false)}
      />
      <ModalDetailLeave
        open={modalDetailLeave}
        infoRequetLeave={infoRequestLeave}
        title="Chi Tiết Đơn Xin Phép"
        onClose={() => {
          setModalDetailLeave(false);
          refreshCurrent();
        }}
      />
      <ModalLoading isOpen={loading} />
      {contextHolder}

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mb-1 inline-block text-[11px] font-bold uppercase tracking-wider text-[#4c809e]">
            Quản lý nghỉ phép
          </span>
          <h1 className="m-0 text-xl font-bold leading-tight text-[#1f2937] md:text-[22px]">
            Danh sách phiếu yêu cầu
          </h1>
        </div>

        <Badge
          count={requestsNeedApprove.length}
          overflowCount={99}
          offset={[-4, 4]}
          color="#dc2626"
          className="max-sm:w-full"
        >
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleFilled />}
            className="!h-10 !rounded-lg !border-none !px-5 !font-semibold !shadow-[0_4px_10px_rgba(0,25,53,0.25)] max-sm:!w-full"
            style={{ background: BRAND_GRADIENT }}
            onClick={() => setModalNeedApproved(true)}
          >
            Phê duyệt
          </Button>
        </Badge>
      </div>

      {/* Filters */}
      <Card
        className={`!mb-4 !rounded-2xl !border !border-[#e8eaee] !shadow-[0_1px_2px_rgba(16,24,40,0.06)] ${styles.filterCard}`}
        styles={{ body: { padding: isMobile ? 14 : "20px 24px" } }}
      >
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-[15px] text-[#4c809e]" />
          <span className="text-[15px] font-semibold text-[#1f2937]">
            Bộ lọc tìm kiếm
          </span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-[#4c809e] px-2 py-px text-[11px] font-medium text-white">
              {activeFilterCount} đang chọn
            </span>
          )}
          {isMobile && (
            <Button
              type="link"
              size="small"
              className="!ml-auto"
              onClick={() => setShowFilters((v) => !v)}
            >
              {showFilters ? "Thu gọn" : "Mở rộng"}
            </Button>
          )}
        </div>

        {(!isMobile || showFilters) && (
          <div className="mt-4">
            {filterBody}
            {actionBar}
          </div>
        )}

        {/* Mobile thu gọn: chỉ hiện nút tìm nhanh */}
        {isMobile && !showFilters && (
          <Space.Compact className="mt-3 w-full">
            <Input
              allowClear
              placeholder="Tìm tên / MSNV..."
              value={filters.name}
              onChange={(e) => patchFilters({ name: e.target.value, msnv: "" })}
              onPressEnter={handleSearch}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              style={{ background: BRAND_GRADIENT }}
              onClick={handleSearch}
            />
          </Space.Compact>
        )}
      </Card>

      {/* Results */}
      <Card
        className="!overflow-hidden !rounded-2xl !border !border-[#e8eaee] !shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex items-center justify-between border-b border-[#eef0f3] bg-white px-4 py-3 md:px-5">
          <span className="text-[13px] text-[#6b7280]">
            Tổng cộng{" "}
            <span className="font-semibold text-[#1f2937]">{total}</span> phiếu
            {appliedRef.current.month && (
              <>
                {" "}
                · tháng{" "}
                <span className="font-semibold text-[#1f2937]">
                  {appliedRef.current.month.format("MM/YYYY")}
                </span>
              </>
            )}
          </span>
        </div>

        {isMobile ? (
          <div className="flex flex-col gap-3 bg-[#f7f8fa] p-3">
            {rows.length === 0 ? (
              <Empty description="Không có phiếu nào" className="!py-8" />
            ) : (
              rows.map((item) => (
                <MobileRequestCard
                  key={item.id}
                  item={item}
                  onDetail={handleOpenDetail}
                />
              ))
            )}
          </div>
        ) : (
          <Table<DataType>
            rowKey="id"
            size="small"
            className={styles.customTable}
            columns={columns}
            dataSource={rows}
            pagination={false}
            scroll={{ x: 1100, y: "calc(100vh - 420px)" }}
            locale={{ emptyText: <Empty description="Không có phiếu nào" /> }}
          />
        )}

        <div className="border-t border-[#eef0f3] bg-white px-4 py-3 md:px-5">
          <Pagination
            align={isMobile ? "center" : "end"}
            size={isMobile ? "small" : "default"}
            simple={isMobile}
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger={!isMobile}
            showTotal={undefined}
            onChange={handlePageChange}
          />
        </div>
      </Card>
    </div>
  );
}
