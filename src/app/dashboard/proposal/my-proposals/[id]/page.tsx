"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Avatar,
  Tag,
  Button,
  Spin,
  message,
  Row,
  Col,
  Descriptions,
  Progress,
  Modal,
  Input,
  Form,
  Select,
  DatePicker,
  Divider,
  Timeline,
  Space,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { useAppSelector } from "@/store/hook";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

/**
 * Proposal detail — Tailwind + Antd
 * - Toàn bộ giao diện, spacing, typography dùng Tailwind
 * - Toàn tiếng Việt
 * - Responsive: mobile / tablet / desktop
 * - Giữ nguyên logic hiện tại (API calls)
 */

export default function ProposalDetailTailwind() {
  const params = useParams();
  const router = useRouter();
  const proposalId = Number(params.id);
  const { id, role } = useAppSelector((state) => state.user);
  const isAdmin = role === "ADMIN";

  const [proposal, setProposal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentAction, setCurrentAction] = useState<"sign" | "approve" | null>(
    null
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState<number | null>(null);
  const [editTimeRange, setEditTimeRange] = useState<[Dayjs, Dayjs] | null>(
    null
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, vRes] = await Promise.all([
        fetch(`/api/proposals?id=${proposalId}`),
        fetch(`/api/vehicles`),
      ]);
      const pJson = await pRes.json();
      const vJson = await vRes.json();
      if (pRes.ok) {
        setProposal(pJson);
        console.log(pJson);

        if (pJson.vehicle) setEditVehicleId(pJson.vehicle.id);
        if (pJson.startAt && pJson.endAt)
          setEditTimeRange([dayjs(pJson.startAt), dayjs(pJson.endAt)]);
      } else {
        message.error(pJson.error || "Không thể tải đề xuất");
      }
      if (vRes.ok) setVehicles(vJson.vehicles || []);
    } catch (e) {
      console.error(e);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const toVietnamTime = (isoString?: string) => {
    if (!isoString) return "";
    return dayjs(isoString).format("HH:mm DD/MM/YYYY");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending_signatures":
        return {
          color: "orange",
          text: "Đang chờ ký",
          icon: <ClockCircleOutlined />,
        };
      case "waiting_approval":
        return {
          color: "blue",
          text: "Đang chờ duyệt",
          icon: <ClockCircleOutlined />,
        };
      case "approved":
        return {
          color: "green",
          text: "Đã duyệt",
          icon: <CheckCircleOutlined />,
        };
      case "rejected":
        return { color: "red", text: "Đã từ chối", icon: <CloseOutlined /> };
      default:
        return {
          color: "default",
          text: status,
          icon: <ExclamationCircleOutlined />,
        };
    }
  };

  const getProgress = () => {
    if (!proposal) return { percent: 0, status: "normal" as const };
    const totalSigners = proposal.signers?.length || 0;
    const totalApprovers = proposal.approvers?.length || 0;
    const approvedSigners =
      proposal.signers?.filter((s: any) => s.status === "approved").length || 0;
    const approvedApprovers =
      proposal.approvers?.filter((a: any) => a.status === "approved").length ||
      0;

    if (proposal.status === "rejected")
      return { percent: 100, status: "exception" as const };
    if (proposal.status === "approved")
      return { percent: 100, status: "success" as const };
    if (proposal.status === "pending_signatures")
      return {
        percent:
          totalSigners > 0
            ? Math.round((approvedSigners / totalSigners) * 50)
            : 0,
        status: "active" as const,
      };
    if (proposal.status === "waiting_approval")
      return {
        percent:
          50 +
          Math.round(
            totalApprovers > 0 ? (approvedApprovers / totalApprovers) * 50 : 0
          ),
        status: "active" as const,
      };
    return { percent: 0, status: "normal" as const };
  };

  const handleApprove = async (action: "sign" | "approve") => {
    setActionLoading(true);
    try {
      await axios.post(`/api/proposals/${proposalId}/${action}`, {
        status: "approved",
      });
      message.success("Đồng ý thành công");
      await fetchData();
    } catch (e) {
      console.error(e);
      message.error("Có lỗi khi xử lý");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (action: "sign" | "approve") => {
    setCurrentAction(action);
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!currentAction) return;
    setActionLoading(true);
    try {
      await axios.post(`/api/proposals/${proposalId}/${currentAction}`, {
        status: "rejected",
        reason: rejectReason,
      });
      message.success("Từ chối thành công");
      setRejectReason("");
      setRejectModalVisible(false);
      await fetchData();
    } catch (e) {
      console.error(e);
      message.error("Không thể gửi từ chối");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProposal = async () => {
    if (!editVehicleId || !editTimeRange) {
      message.error("Vui lòng điền đầy đủ thông tin cập nhật");
      return;
    }
    setActionLoading(true);
    try {
      await axios.patch(`/api/proposals/${proposal?.id}/update`, {
        vehicleId: editVehicleId,
        startAt: editTimeRange[0].toISOString(),
        endAt: editTimeRange[1].toISOString(),
      });
      message.success("Cập nhật đề xuất thành công");
      setEditModalVisible(false);
      await fetchData();
    } catch (e) {
      console.error(e);
      message.error("Cập nhật thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  // Small person card using Tailwind
  const PersonCard: React.FC<{
    person: any;
    reason: string;
    roleLabel?: string;
    status?: string;
    date?: string;
    isCurrent?: boolean;
  }> = ({ person, reason, roleLabel, status, date, isCurrent }) => {
    return (
      <div
        className={`flex gap-3 items-center p-3 rounded-lg ${
          isCurrent
            ? "border-2 border-orange-400 bg-orange-50"
            : "border border-gray-100 bg-white"
        }`}
      >
        <Avatar size={48} src={person?.avatar} icon={<UserOutlined />} />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-sm">{person?.name || "—"}</div>
              <div className="text-xs text-gray-500">
                {person?.employeeCode || ""}
              </div>
              {reason && reason !== "" && (
                <div className="text-xs text-red-500">Lý do: {reason}</div>
              )}
            </div>
            <div className="text-right">
              {status && (
                <Tag
                  color={
                    status === "approved"
                      ? "green"
                      : status === "pending"
                      ? "orange"
                      : "red"
                  }
                >
                  {status === "approved"
                    ? "Đã ký"
                    : status === "pending"
                    ? "Đang chờ"
                    : "Đã từ chối"}
                </Tag>
              )}
              {date && (
                <div className="text-xs text-gray-400 mt-1">
                  {toVietnamTime(date)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[420px]">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );

  if (!proposal)
    return (
      <div className="text-center p-6">
        <ExclamationCircleOutlined className="text-5xl text-yellow-500" />
        <Title level={3}>Không tìm thấy đề xuất</Title>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );

  const statusCfg = getStatusConfig(proposal.status);
  const progress = getProgress();

  return (
    <div className="p-4 max-w-[1200px] mx-auto">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        className="flex items-center"
      >
        Quay lại
      </Button>
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 ">
        <div className="flex-1 flex-shrink-0">
          <h2 className="text-2xl font-semibold leading-tight">
            {proposal.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Tag color={statusCfg.color} className="flex items-center">
              {statusCfg.icon} <span className="ml-2">{statusCfg.text}</span>
            </Tag>
            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-500 flex items-center gap-2  flex-shrink-0">
                <CalendarOutlined />
                <span>{toVietnamTime(proposal.createdAt)}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-gray-200 shadow-sm  flex-shrink-0">
                <svg
                  className="w-4 h-4 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {proposal.proposalType === "REGULAR"
                    ? "Đề xuất chung"
                    : "Đề xuất xe"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className=" flex flex-col items-end gap-3 ">
          <div className="flex items-center gap-2">
            {proposal.proposalType === "REGULAR" && (
              <a
                href={`/api/files/${proposal.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button icon={<DownloadOutlined />}>Tải xuống</Button>
              </a>
            )}
            {isAdmin && proposal.proposalType !== "REGULAR" && (
              <Button
                icon={<EditOutlined />}
                onClick={() => setEditModalVisible(true)}
              >
                Chỉnh sửa
              </Button>
            )}
          </div>

          <div className="w-full flex items-center justify-end gap-3">
            <div className="text-sm font-medium">Tiến độ</div>
            <div className="flex items-center gap-3">
              <div className="w-36">
                <Progress percent={progress.percent} status={progress.status} />
              </div>
            </div>
          </div>

          {proposal.statusSign && (
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="primary"
                loading={actionLoading}
                onClick={() => handleApprove("sign")}
              >
                Đồng ý
              </Button>
              <Button
                danger
                loading={actionLoading}
                onClick={() => handleRejectClick("sign")}
              >
                Từ chối
              </Button>
            </div>
          )}

          {proposal.statusApprove && (
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="primary"
                loading={actionLoading}
                onClick={() => handleApprove("approve")}
              >
                Đồng ý
              </Button>
              <Button
                danger
                loading={actionLoading}
                onClick={() => handleRejectClick("approve")}
              >
                Từ chối
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Layout: left info, right preview + people */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column (info + timeline) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold mb-2">
                  Thông tin đề xuất
                </div>
              </div>
            </div>

            <Descriptions column={1} size="small" bordered className="mt-3">
              <Descriptions.Item label="Tên đề xuất">
                {proposal.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                <Paragraph className="whitespace-pre-wrap mb-0">
                  {proposal.description || (
                    <span className="text-gray-500">Không có mô tả</span>
                  )}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Loại">
                {proposal.proposalType === "REGULAR"
                  ? "Đề xuất chung"
                  : "Đề xuất xe"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusCfg.color}>{statusCfg.text}</Tag>
              </Descriptions.Item>
              {proposal.vehicle && (
                <Descriptions.Item label="Xe">
                  {proposal.vehicle.name}{" "}
                  {proposal.vehicle.plateNumber
                    ? `(${proposal.vehicle.plateNumber})`
                    : ""}
                </Descriptions.Item>
              )}
              {proposal.startAt && proposal.endAt && (
                <Descriptions.Item label="Thời gian">
                  {toVietnamTime(proposal.startAt)} →{" "}
                  {toVietnamTime(proposal.endAt)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card className="rounded-xl shadow-sm p-4">
            <div className="text-sm font-semibold mb-3">Quá trình xử lý</div>
            <Timeline>
              {proposal.signers?.map((s: any, idx: number) => (
                <Timeline.Item
                  key={`s-${idx}`}
                  color={
                    s.status === "approved"
                      ? "green"
                      : s.status === "rejected"
                      ? "red"
                      : "orange"
                  }
                >
                  <div className="font-medium">{s.signer?.name}</div>
                  <div className="text-xs text-gray-500">
                    {s.status === "approved"
                      ? "Đã ký"
                      : s.status === "rejected"
                      ? "Đã từ chối"
                      : "đang xử lý"}{" "}
                    {s.signedAt ? `• ${toVietnamTime(s.signedAt)}` : ""}
                  </div>
                  {s.reason && (
                    <div className="text-xs text-red-500">
                      Lý do: {s.reason}
                    </div>
                  )}
                </Timeline.Item>
              ))}
              {proposal.approvers?.map((a: any, idx: number) => (
                <Timeline.Item
                  key={`a-${idx}`}
                  color={
                    a.status === "approved"
                      ? "green"
                      : a.status === "rejected"
                      ? "red"
                      : "orange"
                  }
                >
                  <div className="font-medium">{a.approver?.name}</div>
                  <div className="text-xs text-gray-500">
                    {a.status === "approved"
                      ? "Đã duyệt"
                      : a.status === "rejected"
                      ? "Đã từ chối"
                      : "đang xử lý"}{" "}
                    {a.approvedAt ? `• ${toVietnamTime(a.approvedAt)}` : ""}
                  </div>
                  {a.reason && (
                    <div className="text-xs text-red-500">
                      Lý do: {a.reason}
                    </div>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </div>

        {/* Right column (preview + people) */}
        <div className="lg:col-span-7 space-y-4">
          {proposal.proposalType === "REGULAR" && (
            <Card className="rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-semibold">
                  <FileTextOutlined /> Xem file
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                {proposal.file?.mimeType === "application/pdf" ? (
                  <iframe
                    src={`/api/files/view/${proposal.file.id}`}
                    style={{ width: "100%", height: "72vh", border: "none" }}
                  />
                ) : (
                  <div
                    style={{
                      padding: 40,
                      textAlign: "center",
                      background: "#fafafa",
                      borderRadius: 8,
                    }}
                  >
                    {" "}
                    <Text type="secondary">
                      Không thể xem trực tiếp file
                    </Text>{" "}
                  </div>
                )}{" "}
              </div>
            </Card>
          )}

          <Card className="rounded-xl shadow-sm p-4">
            <div className="text-sm font-semibold mb-3">
              Người đề xuất / Người ký / Người duyệt
            </div>
            <Divider className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm font-medium mb-2">Người đề xuất</div>
                <PersonCard
                  person={proposal.proposer}
                  reason={""}
                  date={proposal.createdAt}
                  isCurrent={false}
                />
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Người ký</div>
                <div className="space-y-2">
                  {proposal.signers?.map((s: any) => (
                    <PersonCard
                      key={s.signer?.id}
                      person={s.signer}
                      reason={s.reason}
                      status={s.status}
                      date={s.signedAt}
                      isCurrent={
                        String(proposal.currentStep?.userId) ===
                        String(s.signer?.id)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Người duyệt</div>
              <div className="space-y-2">
                {proposal.approvers?.map((a: any) => (
                  <PersonCard
                    key={a.approver?.id}
                    person={a.approver}
                    reason={a.reason}
                    status={a.status}
                    date={a.approvedAt}
                    isCurrent={
                      String(proposal.currentStep?.userId) ===
                      String(a.approver?.id)
                    }
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Reject modal */}
      <Modal
        title="Nhập lý do từ chối"
        open={rejectModalVisible}
        onOk={confirmReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={actionLoading}
      >
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>

      {/* Edit modal (Admin) */}
      {isAdmin && (
        <Modal
          title="Chỉnh sửa đề xuất"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={handleUpdateProposal}
          okText="Lưu"
          cancelText="Hủy"
          confirmLoading={actionLoading}
        >
          <Form layout="vertical">
            <Form.Item label="Chọn xe" required>
              <Select
                value={editVehicleId ?? undefined}
                onChange={(v) => setEditVehicleId(v)}
                placeholder="Chọn xe"
              >
                {vehicles.map((v) => (
                  <Select.Option key={v.id} value={v.id}>
                    {v.name} {v.plateNumber ? `(${v.plateNumber})` : ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Thời gian" required>
              <RangePicker
                showTime
                value={editTimeRange ?? undefined}
                onChange={(d) => setEditTimeRange(d as [Dayjs, Dayjs])}
                className="w-full"
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}
