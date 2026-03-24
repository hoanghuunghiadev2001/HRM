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
  List,
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
  EyeOutlined,
  FilePdfOutlined,
  FileUnknownOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { useAppSelector } from "@/store/hook";
import TextArea from "antd/es/input/TextArea";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

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

  // Modal states
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);

  const [rejectReason, setRejectReason] = useState("");
  const [approveReason, setApproveReason] = useState("");
  const [currentAction, setCurrentAction] = useState<"sign" | "approve" | null>(
    null,
  );

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState<number | null>(null);
  const [editTimeRange, setEditTimeRange] = useState<[Dayjs, Dayjs] | null>(
    null,
  );

  useEffect(() => {
    fetchData();
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

    // 1. Đếm số lượng đã hoàn thành
    const approvedSigners =
      proposal.signers?.filter((s: any) => s.status === "approved").length || 0;
    const approvedApprovers =
      proposal.approvers?.filter((a: any) => a.status === "approved").length ||
      0;

    // 2. Tính tổng số người cần tham gia
    const totalPeople =
      (proposal.signers?.length || 0) + (proposal.approvers?.length || 0);

    // 3. Xử lý các trạng thái đặc biệt trước
    if (proposal.status === "rejected")
      return { percent: 100, status: "exception" as const };
    if (proposal.status === "approved")
      return { percent: 100, status: "success" as const };

    // Nếu chưa có ai ký/duyệt và tổng bằng 0 để tránh lỗi chia cho 0
    if (totalPeople === 0) return { percent: 0, status: "active" as const };

    // 4. Tính toán % thực tế
    const currentDone = approvedSigners + approvedApprovers;
    const rawPercent = Math.round((currentDone / totalPeople) * 100);

    // Đảm bảo nếu đang xử lý (active) thì ít nhất phải hiện 5-10% cho đẹp, không để 0%
    const finalPercent = rawPercent === 0 ? 5 : rawPercent;

    return {
      percent: finalPercent,
      status: "active" as const,
    };
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await axios.post(`/api/proposals/${proposalId}/${currentAction}`, {
        status: "approved",
        reason: approveReason,
      });
      message.success("Đồng ý thành công");
      await fetchData();
      setApproveModalVisible(false);
    } catch (e) {
      message.error("Có lỗi khi xử lý");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    setActionLoading(true);
    try {
      await axios.post(`/api/proposals/${proposalId}/${currentAction}`, {
        status: "rejected",
        reason: rejectReason,
      });
      message.success("Từ chối thành công");
      setRejectModalVisible(false);
      await fetchData();
    } catch (e) {
      message.error("Không thể gửi từ chối");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProposal = async () => {
    if (!editVehicleId || !editTimeRange)
      return message.error("Vui lòng điền đầy đủ thông tin");
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
      message.error("Cập nhật thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const PersonCard: React.FC<{
    person: any;
    reason: string;
    status?: string;
    date?: string;
    isCurrent?: boolean;
  }> = ({ person, reason, status, date, isCurrent }) => (
    <div
      className={`flex gap-3 items-center p-3 rounded-lg ${isCurrent ? "border-2 border-orange-400 bg-orange-50" : "border border-gray-100 bg-white"}`}
    >
      <Avatar size={48} src={person?.avatar} icon={<UserOutlined />} />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-sm">{person?.name || "—"}</div>
            <div className="text-xs text-gray-500">
              {person?.employeeCode || ""}
            </div>
            {reason && (
              <div
                className={`text-xs ${status === "approved" ? "text-green-700" : "text-red-500"}`}
              >
                Lý do: {reason}
              </div>
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[420px]">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  if (!proposal)
    return (
      <div className="text-center p-6">
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
        className="mb-4"
      >
        Quay lại
      </Button>

      {/* Header & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold">{proposal.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Tag color={statusCfg.color}>
              {statusCfg.icon} <span className="ml-2">{statusCfg.text}</span>
            </Tag>
            <span className="text-sm text-gray-500">
              <CalendarOutlined /> {toVietnamTime(proposal.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            {/* Nút Tải tất cả (Ví dụ: nén zip hoặc tải file đầu tiên) */}
            {proposal.files && proposal.files.length > 0 && (
              <Button
                icon={<DownloadOutlined />}
                onClick={() => {
                  // Ví dụ: Tải file đầu tiên hoặc mở link danh sách file
                  window.open(`/api/files/${proposal.id}`, "_blank");
                }}
              >
                Tải tài liệu ({proposal.files.length})
              </Button>
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
            <span className="text-sm font-medium">Tiến độ</span>
            <div className="w-36">
              <Progress percent={progress.percent} status={progress.status} />
            </div>
          </div>
          {(proposal.statusSign || proposal.statusApprove) && (
            <Space>
              <Button
                type="primary"
                loading={actionLoading}
                onClick={() => {
                  setCurrentAction(proposal.statusSign ? "sign" : "approve");
                  setApproveModalVisible(true);
                }}
              >
                Đồng ý
              </Button>
              <Button
                danger
                loading={actionLoading}
                onClick={() => {
                  setCurrentAction(proposal.statusSign ? "sign" : "approve");
                  setRejectModalVisible(true);
                }}
              >
                Từ chối
              </Button>
            </Space>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-xl shadow-sm" title="Thông tin đề xuất">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item
                label="Mô tả"
                contentStyle={{ whiteSpace: "pre-wrap" }}
              >
                {proposal.description || "Không có mô tả"}
              </Descriptions.Item>

              <Descriptions.Item label="Loại">
                {proposal.proposalType === "REGULAR"
                  ? "Đề xuất chung"
                  : "Đề xuất xe"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusCfg.color}>
                  {statusCfg.icon}{" "}
                  <span className="ml-2">{statusCfg.text}</span>
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="NV đề xuất">
                {proposal.proposer.name} - {proposal.proposer.employeeCode}
              </Descriptions.Item>
              {proposal.vehicle && (
                <Descriptions.Item label="Xe">
                  {proposal.vehicle.name} ({proposal.vehicle.plateNumber})
                </Descriptions.Item>
              )}
              {proposal.vehicle && (
                <Descriptions.Item label="Điểm đến">
                  {proposal.dropoffPlace}
                </Descriptions.Item>
              )}
              {proposal.startAt && (
                <Descriptions.Item label="Thời gian">
                  {toVietnamTime(proposal.startAt)} →{" "}
                  {toVietnamTime(proposal.endAt)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* <Card className="rounded-xl shadow-sm mt-2!" title="Quá trình xử lý">
            <Timeline>
              {[...(proposal.signers || []), ...(proposal.approvers || [])].map(
                (item: any, idx: number) => (
                  <Timeline.Item
                    key={idx}
                    color={
                      item.status === "approved"
                        ? "green"
                        : item.status === "rejected"
                          ? "red"
                          : "orange"
                    }
                  >
                    <div className="font-medium">
                      {item.signer?.name || item.approver?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.status === "pending"
                        ? "đang chờ"
                        : item.status === "approved"
                          ? "Đã ký"
                          : "Đã từ chối"}{" "}
                      {item.signedAt || item.approvedAt
                        ? `• ${toVietnamTime(item.signedAt || item.approvedAt)}`
                        : ""}
                    </div>
                  </Timeline.Item>
                ),
              )}
            </Timeline>
          </Card> */}
        </div>

        {/* Right Column - File List & Signers */}
        <div className="lg:col-span-7 space-y-4">
          {/* HIỂN THỊ DANH SÁCH FILE */}
          <Card
            className="rounded-xl shadow-sm"
            title={
              <span>
                <FileTextOutlined className="mr-2" />
                Danh sách tài liệu đính kèm
              </span>
            }
          >
            {proposal.files && proposal.files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {proposal.files.map((file: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-white transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {file.mimeType === "application/pdf" ? (
                        <FilePdfOutlined className="text-red-500 text-xl flex-shrink-0" />
                      ) : (
                        <FileUnknownOutlined className="text-gray-400 text-xl flex-shrink-0" />
                      )}
                      <div className="overflow-hidden">
                        <div
                          className="text-sm font-medium truncate w-full"
                          title={file.filename}
                        >
                          {file.filename || `Tài liệu ${index + 1}`}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase">
                          {file.mimeType?.split("/")[1] || "Unknown"}
                        </div>
                      </div>
                    </div>
                    <Space size="small">
                      {file.mimeType === "application/pdf" && (
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined className="text-blue-500" />}
                          onClick={() => {
                            setPreviewFile(file);
                            setPreviewModalVisible(true);
                          }}
                        />
                      )}
                    </Space>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
                <Text type="secondary">Không có tệp đính kèm</Text>
              </div>
            )}
          </Card>

          <Card
            className="rounded-xl shadow-sm mt-2!"
            title="Nhân sự liên quan"
          >
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2 text-gray-400 uppercase tracking-wider text-[11px]">
                  Người đề xuất
                </div>
                <PersonCard
                  person={proposal.proposer}
                  reason=""
                  date={proposal.createdAt}
                />
              </div>
              <Divider className="my-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2 text-gray-400 uppercase tracking-wider text-[11px]">
                    Người ký ({proposal.signers?.length || 0})
                  </div>
                  <div className="space-y-2">
                    {proposal.signers?.map((s: any) => (
                      <PersonCard
                        key={s.signer.id}
                        person={s.signer}
                        reason={s.reason}
                        status={s.status}
                        date={s.signedAt}
                        isCurrent={
                          String(proposal.currentStep?.userId) ===
                          String(s.signer.id)
                        }
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2 text-gray-400 uppercase tracking-wider text-[11px]">
                    Người duyệt ({proposal.approvers?.length || 0})
                  </div>
                  <div className="space-y-2">
                    {proposal.approvers?.map((a: any) => (
                      <PersonCard
                        key={a.approver.id}
                        person={a.approver}
                        reason={a.reason}
                        status={a.status}
                        date={a.approvedAt}
                        isCurrent={
                          String(proposal.currentStep?.userId) ===
                          String(a.approver.id)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Preview File Modal */}
      <Modal
        title={previewFile?.name || "Xem trước tài liệu"}
        open={previewModalVisible}
        onCancel={() => {
          setPreviewModalVisible(false);
          setPreviewFile(null);
        }}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width="85vw"
        style={{ top: 20 }}
      >
        {previewFile && (
          <iframe
            src={`/api/files/view/${previewFile.id}`}
            style={{ width: "100%", height: "75vh", border: "none" }}
          />
        )}
      </Modal>

      {/* Các Modal Reject/Approve/Edit giữ nguyên logic cũ... */}
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

      <Modal
        title="Nhập lý do đồng ý (Nếu có)"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => setApproveModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={actionLoading}
      >
        <Input.TextArea
          rows={4}
          value={approveReason}
          onChange={(e) => setApproveReason(e.target.value)}
          placeholder="Nhập lý do Đồng ý..."
        />
      </Modal>

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
                    {v.name} ({v.plateNumber})
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
