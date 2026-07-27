/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Calendar,
  DatePicker,
  Drawer,
  Spin,
  Tag,
  Timeline,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import TextArea from "antd/es/input/TextArea";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  DownloadOutlined,
  FileTextOutlined,
  IdcardOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

// ⬇️ Thêm vào file app/dashboard/allRequests/page.tsx
// (chỉ phần interface, KHÔNG thay cả file — bạn chỉ cần chèn/sửa như bên dưới)

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

interface ModalApproveRequestProps {
  open: boolean;
  onClose: () => void;
  requestApprove?: PendingApprovalItem;
  putApprovedRequest: (
    decision: "approved" | "rejected",
    comment?: string,
  ) => void;
}

interface LeaveCount {
  date: string;
  count: number;
}

// ===== Cấu hình hiển thị =====
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

const APPROVER_STATUS_CONFIG: Record<
  string,
  { color: string; text: string; icon: React.ReactNode }
> = {
  approved: {
    color: "#52c41a",
    text: "Đã duyệt",
    icon: <CheckCircleFilled />,
  },
  pending: {
    color: "#d4b106",
    text: "Đang chờ",
    icon: <ClockCircleFilled />,
  },
  rejected: {
    color: "#ff4d4f",
    text: "Từ chối",
    icon: <CloseCircleFilled />,
  },
  revoked: {
    color: "#8c8c8c",
    text: "Thu hồi",
    icon: <ClockCircleFilled />,
  },
};

const InfoField = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-2.5">
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eef3f7] text-[#4c809e]">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-[#242424]">
        {value || "—"}
      </p>
    </div>
  </div>
);

const SectionCard = ({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 ${className}`}
  >
    <div className="mb-3 flex items-center gap-2">
      {icon}
      <h3 className="text-sm font-bold uppercase tracking-wide text-[#4a4a6a]">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const ModalApproveRequest = ({
  open,
  requestApprove,
  putApprovedRequest,
  onClose,
}: ModalApproveRequestProps) => {
  const { RangePicker } = DatePicker;
  const [rejectedReason, setRejectedReason] = useState("");

  const disabledDate = (currentDate: dayjs.Dayjs) => {
    return currentDate && currentDate.isBefore(dayjs().startOf("day"));
  };

  const rangeValue: [dayjs.Dayjs, dayjs.Dayjs] = [
    dayjs.utc(requestApprove?.startDate).tz("Asia/Ho_Chi_Minh"),
    dayjs.utc(requestApprove?.endDate).tz("Asia/Ho_Chi_Minh"),
  ];

  const [data, setData] = useState<LeaveCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setRejectedReason("");
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/leave/calendar", {
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok) setData(json);
        else console.error(json.error);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, [open]);

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format("YYYY-MM-DD");
    const found = data.find((item) => item.date === dateStr);

    const inRange =
      rangeValue &&
      value.isSameOrAfter(rangeValue[0].startOf("day")) &&
      value.isSameOrBefore(rangeValue[1].endOf("day"));

    return (
      <div
        className={`relative flex h-full items-end justify-end rounded-md p-1 ${
          inRange ? "bg-yellow-500" : ""
        }`}
      >
        {found && (
          <div className="text-sm font-bold text-red-600">{found.count}</div>
        )}
      </div>
    );
  };

  // Ưu tiên chuỗi phê duyệt đầy đủ (approvalChain); nếu API cũ chưa trả về,
  // fallback dựng từ approversWhoApproved để không vỡ giao diện.
  const approvalChain =
    requestApprove?.approvalChain ??
    (requestApprove?.approversWhoApproved?.length
      ? [
          {
            stepId: 0,
            level: requestApprove.approversWhoApproved[0].stepLevel,
            status: "approved" as const,
            approvedAt: null,
            approvers: requestApprove.approversWhoApproved.map((a) => ({
              name: a.name,
              employeeCode: a.employeeCode,
              departmentName: a.departmentName,
              positionName: a.positionName,
              status: "approved" as const,
              approvedAt: a.approvedAt,
            })),
          },
        ]
      : []);

  const employeeInitial = requestApprove?.employeeName?.charAt(0) ?? "?";

  return (
    <Drawer
      title={
        <p className="text-xl font-bold text-[#242424]">
          Chi tiết phiếu yêu cầu nghỉ phép
        </p>
      }
      width={640}
      open={open}
      onClose={onClose}
      closable={{ "aria-label": "Close Button" }}
      styles={{ body: { background: "#f7f8fa", padding: 16 } }}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            danger
            size="large"
            onClick={() => putApprovedRequest("rejected", rejectedReason)}
          >
            Từ chối
          </Button>
          <Button
            type="primary"
            size="large"
            className="!bg-gradient-to-r !from-[#4c809e] !to-[#001935]"
            onClick={() => putApprovedRequest("approved")}
          >
            Chấp nhận
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* ===== Thông tin nhân viên ===== */}
        <SectionCard title="Người yêu cầu" icon={<UserOutlined />}>
          <div className="mb-4 flex items-center gap-3">
            <Avatar
              size={48}
              style={{
                background: "linear-gradient(135deg, #4c809e 0%, #001935 100%)",
                fontWeight: 700,
              }}
            >
              {employeeInitial}
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-[#242424]">
                {requestApprove?.employeeName || "—"}
              </p>
              <p className="text-sm text-gray-500">
                MSNV: {requestApprove?.employeeCode || "—"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoField
              icon={<TeamOutlined />}
              label="Bộ phận"
              value={requestApprove?.department}
            />
            <InfoField
              icon={<IdcardOutlined />}
              label="Chức vụ"
              value={requestApprove?.position}
            />
          </div>
        </SectionCard>

        {/* ===== Thông tin nghỉ phép ===== */}
        <SectionCard title="Thông tin nghỉ phép" icon={<CalendarOutlined />}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Tag color="blue" className="!rounded-full !px-3 !py-1 !text-sm">
              {LEAVE_TYPE_LABELS[requestApprove?.leaveType ?? ""] ??
                requestApprove?.leaveType}
            </Tag>
            <Tag color="purple" className="!rounded-full !px-3 !py-1 !text-sm">
              {requestApprove?.totalHours ?? 0} giờ
            </Tag>
          </div>
          <RangePicker
            className="w-full"
            disabledDate={disabledDate}
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            showTime={{
              hideDisabledOptions: true,
              defaultValue: [dayjs("00:00", "HH:mm"), dayjs("00:00", "HH:mm")],
            }}
            format="DD/MM/YYYY HH:mm"
            value={rangeValue}
            disabled
          />

          <div className="mt-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Lý do
            </p>
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-[#3a3a3a]">
              {requestApprove?.reason || "Không có lý do"}
            </p>
          </div>
        </SectionCard>

        {/* ===== Danh sách người duyệt ===== */}
        <SectionCard title="Danh sách người duyệt" icon={<TeamOutlined />}>
          {approvalChain.length === 0 ? (
            <p className="text-sm text-gray-400">
              Chưa có dữ liệu chuỗi phê duyệt.
            </p>
          ) : (
            <Timeline
              items={approvalChain
                .sort(
                  (a: { level: number }, b: { level: number }) =>
                    a.level - b.level,
                )
                .map((step: any) => {
                  const stepConfig =
                    APPROVER_STATUS_CONFIG[step.status] ??
                    APPROVER_STATUS_CONFIG.pending;
                  return {
                    color: stepConfig.color,
                    dot: (
                      <span style={{ color: stepConfig.color }}>
                        {stepConfig.icon}
                      </span>
                    ),
                    children: (
                      <div className="pb-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Cấp {step.level}
                        </p>
                        <div className="mt-1.5 flex flex-col gap-2">
                          {step.approvers.map(
                            (
                              approver: any,
                              idx: React.Key | null | undefined,
                            ) => {
                              const config =
                                APPROVER_STATUS_CONFIG[approver.status] ??
                                APPROVER_STATUS_CONFIG.pending;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#242424]">
                                      {approver.name || "—"}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                      {[
                                        approver.positionName,
                                        approver.departmentName,
                                      ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                                    <Tag
                                      color={config.color}
                                      className="!m-0 !rounded-full !text-xs"
                                    >
                                      {config.text}
                                    </Tag>
                                    {approver.approvedAt && (
                                      <span className="text-[11px] text-gray-400">
                                        {dayjs(approver.approvedAt).format(
                                          "DD/MM/YYYY HH:mm",
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    ),
                  };
                })}
            />
          )}
        </SectionCard>

        {/* ===== Lịch nghỉ phép đã duyệt ===== */}
        <SectionCard
          title="Lịch nghỉ phép đã duyệt"
          icon={<CalendarOutlined />}
        >
          {loading ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : (
            <Calendar
              fullscreen={false}
              dateCellRender={dateCellRender}
              className="!p-0"
            />
          )}
        </SectionCard>

        {/* ===== Biên bản bàn giao ===== */}
        <SectionCard title="Biên bản bàn giao" icon={<FileTextOutlined />}>
          {requestApprove?.handoverFileId ? (
            (() => {
              const fileId = requestApprove?.handoverFileId ?? null;
              const fileUrl = fileId ? `/api/files/${fileId}` : null;
              return (
                <div>
                  <div className="mb-2 flex items-center justify-end">
                    <a href={fileUrl ?? ""} target="_blank" rel="noreferrer">
                      <Button icon={<DownloadOutlined />} size="small">
                        Tải xuống
                      </Button>
                    </a>
                  </div>
                  {fileUrl && (
                    <iframe
                      src={`/api/files/view/${fileId}`}
                      className="w-full rounded-lg border border-gray-100"
                      style={{ height: "40vh" }}
                    />
                  )}
                </div>
              );
            })()
          ) : (
            <p className="text-sm text-gray-400">
              Không có biên bản bàn giao đính kèm.
            </p>
          )}
        </SectionCard>

        {/* ===== Lý do từ chối ===== */}
        <SectionCard title="Lý do từ chối (nếu có)" icon={<FileTextOutlined />}>
          <TextArea
            rows={3}
            placeholder="Nhập lý do từ chối..."
            value={rejectedReason}
            onChange={(e) => setRejectedReason(e.target.value)}
          />
        </SectionCard>
      </div>
    </Drawer>
  );
};

export default ModalApproveRequest;
