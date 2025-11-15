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
  Timeline,
  Row,
  Col,
  Descriptions,
  Progress,
  Badge,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  FolderViewOutlined,
} from "@ant-design/icons";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { useAppSelector } from "@/store/hook";
import axios from "axios";

// Docx preview
import { renderAsync } from "docx-preview";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const { Title, Text, Paragraph } = Typography;

interface ProposalDetail {
  id: number;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  file?: {
    filename: string;
    mimeType: string;
    data?: any;
  };
  proposer: any;
  signers: Array<{ signer: any; status: string; signedAt?: string }>;
  approvers: Array<{ approver: any; status: string; approvedAt?: string }>;
  statusApprove: boolean;
  statusSign: boolean;
  currentStep: currentStep;
}

export interface currentStep {
  step: string;
  userId: string;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(
    null
  );
  const proposalId = Number(params.id);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const { id } = useAppSelector((state) => state.user);

  useEffect(() => {
    fetchProposal();
    return () => {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
    };
  }, [proposalId]);

  const fetchProposal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals?id=${proposalId}`);
      const result = await res.json();

      if (res.ok) {
        const data = result;
        setProposal(data);

        if (
          data.file?.mimeType.includes("officedocument") ||
          data.file?.mimeType.includes("msword")
        ) {
        } else {
          if (data.file?.id) {
            // ✅ Nếu có file, tạo link xem trực tiếp
            const previewUrl = `/api/files/view/${data.file.id}`;
            setCurrentPreviewUrl(previewUrl);
          }
        }
      } else {
        message.error(result.error || "Không thể tải thông tin đề xuất");
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async (
    action: "sign" | "approve",
    status: "approved" | "rejected"
  ) => {
    setActionLoading(true);
    try {
      await axios.post(`/api/proposals/${proposalId}/${action}`, {
        proposalId,
        status,
      });
      message.success(status === "approved" ? "Đã phê duyệt!" : "Đã từ chối!");
      await fetchProposal();
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi gửi phê duyệt.");
    } finally {
      setActionLoading(false);
    }
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
        return { color: "default", text: status, icon: <InfoCircleOutlined /> };
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
    if (proposal.status === "pending_signatures") {
      const percent =
        totalSigners > 0 ? (approvedSigners / totalSigners) * 50 : 0;
      return { percent, status: "active" as const };
    }
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

  const getTimelineItems = () => {
    if (!proposal) return [];
    const items: any[] = [];
    items.push({
      color: "blue",
      dot: <CheckCircleOutlined style={{ fontSize: 16 }} />,
      children: (
        <div>
          <Text strong>Đề xuất được tạo</Text>
          <div>
            <Text type="secondary">
              {new Date(proposal.createdAt).toLocaleString("vi-VN")}
            </Text>
          </div>
          <div>
            <Text type="secondary">Bởi: {proposal.proposer.name}</Text>
          </div>
        </div>
      ),
    });
    proposal.signers.forEach((s) => {
      if (s.status !== "pending")
        items.push({
          color: s.status === "approved" ? "green" : "red",
          dot:
            s.status === "approved" ? (
              <CheckCircleOutlined style={{ fontSize: 16 }} />
            ) : (
              <CloseOutlined style={{ fontSize: 16 }} />
            ),
          children: (
            <div>
              <Text strong>
                {s.signer.name} đã{" "}
                {s.status === "approved" ? "đồng ý" : "từ chối"}
              </Text>
              {s.signedAt && (
                <div>
                  <Text type="secondary">
                    {new Date(s.signedAt).toLocaleString("vi-VN")}
                  </Text>
                </div>
              )}
            </div>
          ),
        });
    });
    proposal.approvers.forEach((a) => {
      if (a.status !== "pending")
        items.push({
          color: a.status === "approved" ? "green" : "red",
          dot:
            a.status === "approved" ? (
              <CheckCircleOutlined style={{ fontSize: 16 }} />
            ) : (
              <CloseOutlined style={{ fontSize: 16 }} />
            ),
          children: (
            <div>
              <Text strong>
                {a.approver.name} đã{" "}
                {a.status === "approved" ? "phê duyệt" : "từ chối"}
              </Text>
              {a.approvedAt && (
                <div>
                  <Text type="secondary">
                    {new Date(a.approvedAt).toLocaleString("vi-VN")}
                  </Text>
                </div>
              )}
            </div>
          ),
        });
    });
    return items;
  };

  const renderPersonCard = (
    person: any,
    role: "proposer" | "signer" | "approver",
    currentIdStep: string,
    status?: string,
    actionDate?: string
  ) => {
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
        className={`${
          Number(person.id) === Number(currentIdStep) ? "!bg-blue-200" : ""
        }`}
        style={{
          marginBottom: 12,
          border:
            person.id === id ? `2px solid ${roleConfig[role]}` : undefined,
          boxShadow:
            person.id === id ? `0 0 10px ${roleConfig[role]}20` : undefined,
        }}
      >
        <Row gutter={16} align="middle">
          <Col flex="none">
            <Badge dot={person.id === id} color={roleConfig[role]}>
              <Avatar size={48} icon={<UserOutlined />} src={person.avatar} />
            </Badge>
          </Col>
          <Col flex="auto">
            <div className="flex items-center gap-2 justify-between ">
              <Text strong style={{ fontSize: 16 }}>
                {person.name} •{" "}
                <Text type="secondary">{person.employeeCode}</Text>
                {person.id === id && (
                  <Tag color={roleConfig[role]} style={{ marginLeft: 8 }}>
                    Bạn
                  </Tag>
                )}
              </Text>
            </div>
            {status && (
              <Tag
                color={statusConfig[status as keyof typeof statusConfig]?.color}
              >
                {statusConfig[status as keyof typeof statusConfig]?.icon}
                <span style={{ marginLeft: 4 }}>
                  {statusConfig[status as keyof typeof statusConfig]?.text}
                </span>
              </Tag>
            )}
            {actionDate && (
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(actionDate).toLocaleString("vi-VN")}
                </Text>
              </div>
            )}
          </Col>
        </Row>
      </Card>
    );
  };

  if (loading)
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="Đang tải thông tin đề xuất..." fullscreen />
      </div>
    );
  if (!proposal)
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <ExclamationCircleOutlined
            style={{ fontSize: 64, color: "#faad14", marginBottom: 16 }}
          />
          <Title level={3}>Không tìm thấy đề xuất</Title>
          <Button type="primary" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    );

  const statusConfigFinal = getStatusConfig(proposal.status);
  const progress = getProgress();
  // 🔍 Regex bắt thời gian bắt đầu & kết thúc trong mô tả
  const desc = proposal.description || "";

  // Regex: bắt cả dòng có “thời gian bắt đầu”, “thời gian kết thúc”, “from”, “to”... (không phân biệt hoa thường)
  const cleanedDescription = desc
    .replace(/^\s*thời gian bắt đầu.*$/gim, "")
    // Xóa dòng chứa "thời gian kết thúc"
    .replace(/^\s*thời gian kết thúc.*$/gim, "")
    // Xóa dòng chứa từ "from" đứng riêng
    .replace(/^\s*\bfrom\b.*$/gim, "")
    // Xóa dòng chứa từ "to" đứng riêng
    .replace(/^\s*\bto\b.*$/gim, "")
    // Xóa các dòng trống dư
    .replace(/^\s*$/gim, "")
    // Xóa khoảng trắng đầu/cuối
    .trim();

  // Nếu bạn vẫn muốn hiển thị thời gian riêng:
  const startTimeMatch = desc.match(/thời gian bắt đầu[:\-]?\s*([\d/:\-\s]+)/i);
  const endTimeMatch = desc.match(/thời gian kết thúc[:\-]?\s*([\d/:\-\s]+)/i);

  const startTime = startTimeMatch ? startTimeMatch[1].trim() : null;
  const endTime = endTimeMatch ? endTimeMatch[1].trim() : null;
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
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Quay lại danh sách
        </Button>
      </div>

      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col flex="auto">
            <Space direction="vertical" className="w-full">
              <Title level={2}>
                <FileTextOutlined /> {proposal.name}
              </Title>
              <Col className="flex justify-between items-start w-full flex-wrap">
                <Space className="h-16">
                  <Tag color={statusConfigFinal.color}>
                    {statusConfigFinal.icon}{" "}
                    <span style={{ marginLeft: 4 }}>
                      {statusConfigFinal.text}
                    </span>
                  </Tag>
                  <Text type="secondary">
                    <CalendarOutlined /> Tạo lúc:{" "}
                    {new Date(proposal.createdAt).toLocaleString("vi-VN")}
                  </Text>
                </Space>
                <Col flex="none" className="!p-0">
                  <div className="gap-2">
                    <a
                      href={`/api/files/${proposalId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button type="primary" icon={<DownloadOutlined />}>
                        Tải xuống
                      </Button>
                    </a>

                    {proposal.statusSign ? (
                      <Space style={{ marginTop: 8, marginLeft: 8 }}>
                        <Button
                          type="primary"
                          loading={actionLoading}
                          onClick={() => confirmAction("sign", "approved")}
                        >
                          Đồng ý
                        </Button>
                        <Button
                          danger
                          loading={actionLoading}
                          onClick={() => confirmAction("sign", "rejected")}
                        >
                          Từ chối
                        </Button>
                      </Space>
                    ) : (
                      ""
                    )}
                    {proposal.statusApprove ? (
                      <Space style={{ marginTop: 8, marginLeft: 8 }}>
                        <Button
                          type="primary"
                          loading={actionLoading}
                          onClick={() => confirmAction("approve", "approved")}
                        >
                          Đồng ý
                        </Button>
                        <Button
                          danger
                          loading={actionLoading}
                          onClick={() => confirmAction("approve", "rejected")}
                        >
                          Từ chối
                        </Button>
                      </Space>
                    ) : (
                      ""
                    )}
                  </div>
                  <div style={{ textAlign: "right", minWidth: 200 }}>
                    <Text strong>Tiến độ xử lý</Text>
                    <Progress
                      percent={progress.percent}
                      status={progress.status}
                      strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                    />
                  </div>
                </Col>
              </Col>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Chi tiết */}
      <Card
        title={
          <>
            <InfoCircleOutlined /> Thông tin chi tiết
          </>
        }
        style={{ marginBottom: 24 }}
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Tên đề xuất">
            {proposal.name}
          </Descriptions.Item>
          {proposal.description && (
            <>
              <Descriptions.Item label="Mô tả">
                <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {cleanedDescription}
                </Paragraph>
              </Descriptions.Item>
              {startTime && (
                <>
                  <Descriptions.Item label="Bắt đầu">
                    <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {startTime}
                    </Paragraph>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kết thúc">
                    <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {endTime}
                    </Paragraph>
                  </Descriptions.Item>
                </>
              )}
            </>
          )}

          <Descriptions.Item label="Trạng thái">
            <Tag color={statusConfigFinal.color}>
              {statusConfigFinal.icon} {statusConfigFinal.text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(proposal.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(proposal.updatedAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Preview file */}
      {currentPreviewUrl && (
        <Card title="Xem trước File">
          <div className="w-full flex justify-center max-h-[80vh] overflow-auto">
            {proposal.file?.mimeType === "application/pdf" ? (
              <iframe
                src={currentPreviewUrl}
                style={{ width: "100%", height: "80vh", border: "none" }}
              />
            ) : proposal.file?.mimeType.startsWith("image/") ? (
              <img
                src={currentPreviewUrl}
                alt={proposal.file?.filename}
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            ) : proposal.file?.mimeType.includes("officedocument") ||
              proposal.file?.mimeType.includes("msword") ? (
              <div className="w-full h-[90vh]">
                <iframe
                  src={`/api/files/view/${proposal.id}`}
                  width="100%"
                  height="100%"
                ></iframe>
              </div>
            ) : (
              <Text>Không thể xem trực tiếp file này.</Text>
            )}
          </div>
        </Card>
      )}

      {/* Người đề xuất / ký / phê duyệt */}
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Card
            title={
              <>
                <TeamOutlined /> Người đề xuất / ký
              </>
            }
            style={{ marginBottom: 24 }}
          >
            {renderPersonCard(
              proposal.proposer,
              "proposer",
              proposal.currentStep.userId
            )}
            {proposal.signers.map((s) => (
              <div key={s.signer.id}>
                {renderPersonCard(
                  s.signer,
                  "signer",
                  proposal.currentStep.userId,
                  s.status,
                  s.signedAt
                )}
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <>
                <CheckOutlined /> Người phê duyệt
              </>
            }
            style={{ marginBottom: 24 }}
          >
            {proposal.approvers.map((a) => (
              <div key={a.approver.id}>
                {renderPersonCard(
                  a.approver,
                  "approver",
                  proposal.currentStep.userId,
                  a.status,
                  a.approvedAt
                )}
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Timeline */}
      <Card
        title={
          <>
            <ClockCircleOutlined /> Lịch sử xử lý
          </>
        }
        style={{ marginBottom: 24 }}
      >
        <Timeline items={getTimelineItems()} />
      </Card>
    </div>
  );
}
