/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Space,
  Avatar,
  Tag,
  Button,
  Spin,
  message,
  Row,
  Col,
  Descriptions,
  Progress,
  Badge,
  Modal,
  Input,
  Form,
  Select,
  DatePicker,
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
  TeamOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { useAppSelector } from "@/store/hook";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface ProposalDetail {
  id: number;
  name: string;
  description?: string;
  proposalType?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  file?: {
    filename: string;
    mimeType: string;
    data?: any;
    id?: number;
  };
  proposer: any;
  signers: Array<{
    signer: any;
    status: string;
    signedAt?: string;
    reason?: string;
  }>;
  approvers: Array<{
    approver: any;
    status: string;
    approvedAt?: string;
    reason?: string;
  }>;
  statusApprove: boolean;
  statusSign: boolean;
  currentStep: currentStep;
  vehicle?: any | null;
  startAt?: string | null;
  endAt?: string | null;
  dropoffPlace?: string | null;
}

export interface currentStep {
  step: string;
  userId: string;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = Number(params.id);
  const { id, role } = useAppSelector((state) => state.user);
  const isAdmin = role === "ADMIN";

  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(
    null
  );
  const [vehicles, setVehicles] = useState<
    Array<{ id: number; name: string; plateNumber?: string }>
  >([]);

  // Modal từ chối
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentAction, setCurrentAction] = useState<"sign" | "approve" | null>(
    null
  );

  // Modal chỉnh sửa (Admin Only)
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState<number | null>(null);
  const [editTimeRange, setEditTimeRange] = useState<[Dayjs, Dayjs] | null>(
    null
  );

  useEffect(() => {
    fetchVehicles();
    fetchProposal();
    return () => {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
    };
  }, [proposalId]);

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      const result = await res.json();
      if (res.ok) setVehicles(result.vehicles);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi khi tải danh sách xe");
    }
  };

  const fetchProposal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals?id=${proposalId}`);
      const result = await res.json();
      if (res.ok) {
        setProposal(result);
        setEditVehicleId(result.vehicle?.id ?? null);
        if (result.startAt && result.endAt) {
          setEditTimeRange([dayjs(result.startAt), dayjs(result.endAt)]);
        }
        if (result.file?.id) {
          setCurrentPreviewUrl(`/api/files/view/${result.file.id}`);
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải thông tin đề xuất");
    } finally {
      setLoading(false);
    }
  };

  const toVietnamTime = (isoString?: string) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date(isoString));
  };

  const handleApprove = async (action: "sign" | "approve") => {
    setActionLoading(true);
    try {
      await axios.post(`/api/proposals/${proposalId}/${action}`, {
        status: "approved",
      });
      message.success("Đã đồng ý!");
      await fetchProposal();
    } catch (error) {
      console.error(error);
      message.error("Có lỗi khi xử lý đồng ý");
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
      message.success("Đã từ chối!");
      setRejectReason("");
      setRejectModalVisible(false);
      await fetchProposal();
    } catch (error) {
      console.error(error);
      message.error("Có lỗi khi gửi từ chối");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProposal = async () => {
    if (!editVehicleId || !editTimeRange) {
      message.error("Vui lòng điền đầy đủ thông tin");
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
      await fetchProposal();
    } catch (error) {
      console.error(error);
      message.error("Cập nhật thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const getProgress = () => {
    if (!proposal) return { percent: 0, status: "normal" as const };
    const totalSigners = proposal.signers.length;
    const totalApprovers = proposal.approvers.length;
    const approvedSigners = proposal.signers.filter(
      (s) => s.status === "approved"
    ).length;
    const approvedApprovers = proposal.approvers.filter(
      (a) => a.status === "approved"
    ).length;

    if (proposal.status === "rejected")
      return { percent: 100, status: "exception" as const };
    if (proposal.status === "approved")
      return { percent: 100, status: "success" as const };
    if (proposal.status === "pending_signatures")
      return {
        percent: totalSigners > 0 ? (approvedSigners / totalSigners) * 50 : 0,
        status: "active" as const,
      };
    if (proposal.status === "waiting_approval") {
      const signaturePercent = 50;
      const approvalPercent =
        totalApprovers > 0 ? (approvedApprovers / totalApprovers) * 50 : 0;
      return {
        percent: signaturePercent + approvalPercent,
        status: "active" as const,
      };
    }
    return { percent: 0, status: "normal" as const };
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

  const renderPersonCard = (
    person: any,
    role: "proposer" | "signer" | "approver",
    currentIdStep: string,
    totalStatus: string,
    status?: string,
    actionDate?: string,
    reason?: string
  ) => {
    console.log(person.id);
    console.log(currentIdStep);

    const roleConfig = {
      proposer: "#1890ff",
      signer: "#722ed1",
      approver: "#52c41a",
    };
    const statusConfig = {
      pending: {
        color: "orange",
        text: "Chờ xử lý",
        icon: <ClockCircleOutlined />,
      },
      approved: {
        color: "green",
        text: role === "signer" ? "Đã ký" : "Đã duyệt",
        icon: <CheckOutlined />,
      },
      rejected: { color: "red", text: "Đã từ chối", icon: <CloseOutlined /> },
    };
    return (
      <Card
        size="small"
        className={`!relative ${
          Number(person.id) === Number(currentIdStep) ? "!bg-[#FFA50020]" : ""
        }`}
        style={{
          marginBottom: 12,
          border:
            Number(person.id) === Number(currentIdStep)
              ? `2px solid #FFA500`
              : person.id === id
              ? "2px solid #42A5F5"
              : "",
          boxShadow:
            Number(person.id) === Number(currentIdStep)
              ? `0 0 10px #FFA50020`
              : undefined,
        }}
      >
        <Row gutter={16} align="middle">
          <Col flex="none">
            <Badge dot={person.id === id} color={roleConfig[role]}>
              <Avatar size={48} icon={<UserOutlined />} src={person.avatar} />
            </Badge>
          </Col>
          <Col flex="auto">
            <div className=" items-center gap-2 justify-between ">
              <Text strong style={{ fontSize: 16 }}>
                {person.name}
              </Text>
              <Text type="secondary">• {person.employeeCode}</Text>
            </div>
            {role === "proposer" && (
              <Tag color={"#1890ff"}>
                <span style={{ marginLeft: 4 }}>Người tạo đề xuất</span>
              </Tag>
            )}
            {role !== "proposer" &&
              (totalStatus !== "rejected" || status !== "pending") && (
                <Tag
                  className="mt-1"
                  color={
                    statusConfig[status as keyof typeof statusConfig]?.color
                  }
                >
                  {statusConfig[status as keyof typeof statusConfig]?.icon}{" "}
                  <span style={{ marginLeft: 4 }}>
                    {statusConfig[status as keyof typeof statusConfig]?.text}
                  </span>
                </Tag>
              )}
            {reason && <Text type="secondary">Lý do: {reason}</Text>}
            {actionDate && (
              <div className="mt-1 flex w-full justify-end italic text-xs">
                <Text type="secondary" className="text-[6px]">
                  •{toVietnamTime(actionDate)}
                </Text>
              </div>
            )}
          </Col>
        </Row>
        {person.id === id && (
          <Tag color={"#42A5F5"} className="!absolute top-[-10px] right-0">
            <span>Bạn</span>
          </Tag>
        )}
      </Card>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  if (!proposal)
    return (
      <div className="text-center p-12">
        <ExclamationCircleOutlined style={{ fontSize: 64, color: "#faad14" }} />
        <Title level={3}>Không tìm thấy đề xuất</Title>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );

  const progress = getProgress();
  const statusConfigFinal = getStatusConfig(proposal.status);

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1400,
        margin: "0 auto",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: 24 }}
      >
        Quay lại danh sách
      </Button>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col className="w-full">
            <Space className="w-full flex justify-between">
              <div className="flex-shrink-0">
                <Title level={2}>
                  <FileTextOutlined /> {proposal.name}
                </Title>
                <Space>
                  <Tag color={statusConfigFinal.color}>
                    {statusConfigFinal.icon} {statusConfigFinal.text}
                  </Tag>
                  <Text type="secondary">
                    <CalendarOutlined /> Tạo lúc:{" "}
                    {toVietnamTime(proposal.createdAt)}
                  </Text>
                </Space>
              </div>

              <div style={{ marginTop: 12 }} className="w-full min-w-[300px]">
                <div className="flex justify-end">
                  <a
                    href={`/api/files/${proposalId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button type="primary" icon={<DownloadOutlined />}>
                      Tải xuống
                    </Button>
                  </a>
                </div>
                {proposal.statusSign && (
                  <Space className="flex justify-end">
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
                  </Space>
                )}
                {proposal.statusApprove && (
                  <Space className="flex justify-end">
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
                  </Space>
                )}
                <div style={{ marginTop: 12 }}>
                  <Text strong>Tiến độ xử lý</Text>
                  <Progress
                    percent={progress.percent}
                    status={progress.status}
                    strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                  />
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Chi tiết */}
      <Card
        title={
          <>
            <InfoCircleOutlined /> Thông tin chi tiết
            {isAdmin && proposal.proposalType !== "REGULAR" && (
              <Button
                type="primary"
                style={{ float: "right" }}
                onClick={() => setEditModalVisible(true)}
              >
                Chỉnh sửa
              </Button>
            )}
          </>
        }
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Tên đề xuất">
            {proposal.name}
          </Descriptions.Item>
          {proposal.description && (
            <Descriptions.Item label="Mô tả">
              <Paragraph style={{ whiteSpace: "pre-wrap" }}>
                {proposal.description}
              </Paragraph>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusConfigFinal.color}>
              {statusConfigFinal.icon} {statusConfigFinal.text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {toVietnamTime(proposal.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {toVietnamTime(proposal.updatedAt)}
          </Descriptions.Item>
          {proposal.vehicle && (
            <Descriptions.Item label="Xe sử dụng">
              {proposal.vehicle.name}{" "}
              {proposal.vehicle.plateNumber
                ? `(${proposal.vehicle.plateNumber})`
                : ""}
            </Descriptions.Item>
          )}
          {proposal.startAt && proposal.endAt && (
            <Descriptions.Item label="Thời gian sử dụng">
              {toVietnamTime(proposal.startAt)} →{" "}
              {toVietnamTime(proposal.endAt)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Xem file */}
      {currentPreviewUrl && (
        <Card title="Xem trước file">
          {proposal.file?.mimeType === "application/pdf" ? (
            <iframe
              src={currentPreviewUrl}
              style={{ width: "100%", height: "80vh", border: "none" }}
            />
          ) : (
            <Text>Không thể xem trực tiếp file</Text>
          )}
        </Card>
      )}

      {/* Người ký / phê duyệt */}
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={
              <>
                <TeamOutlined /> Người đề xuất / ký
              </>
            }
          >
            {renderPersonCard(
              proposal.proposer,
              "proposer",
              proposal.currentStep.userId,
              proposal.status,
              proposal.status,
              proposal.createdAt
            )}
            {proposal.signers.map((s) =>
              renderPersonCard(
                s.signer,
                "signer",
                proposal.currentStep.userId,
                proposal.status,
                s.status,
                s.signedAt,
                s.reason
              )
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <>
                <CheckOutlined /> Người phê duyệt
              </>
            }
          >
            {proposal.approvers.map((a) =>
              renderPersonCard(
                a.approver,
                "approver",
                proposal.currentStep.userId,
                proposal.status,
                a.status,
                a.approvedAt,
                a.reason
              )
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal nhập lý do từ chối */}
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

      {/* Modal chỉnh sửa (Admin Only) */}
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
            <Form.Item label="Loại xe" required>
              <Select
                value={editVehicleId ?? undefined}
                onChange={(value) => setEditVehicleId(value)}
                placeholder="Chọn xe"
              >
                {vehicles.map((v) => (
                  <Select.Option key={v.id} value={v.id}>
                    {v.name} {v.plateNumber ? `(${v.plateNumber})` : ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Thời gian sử dụng" required>
              <RangePicker
                showTime
                value={editTimeRange ?? undefined}
                onChange={(dates) => setEditTimeRange(dates as [Dayjs, Dayjs])}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}
