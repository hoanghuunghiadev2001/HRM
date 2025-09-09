/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Worker, Viewer, SpecialZoomLevel, ScrollMode, ViewMode } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'

import dynamic from 'next/dynamic';

import {
  Card,
  Typography,
  Space,
  Avatar,
  Tag,
  Button,
  Spin,
  message,
  Modal,
  Timeline,
  Row,
  Col,
  Descriptions,
  Progress,
  Badge,
  Tooltip,
} from "antd"
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
  FileProtectOutlined,
  MailOutlined,
  PhoneOutlined,
  FolderViewOutlined,
} from "@ant-design/icons"
import { useRouter } from "next/navigation"

import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const { Title, Text, Paragraph } = Typography

interface ProposalDetail {
  id: number
  name: string
  title: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
  fileUrl?: string // Đây là URL an toàn để tải/xem file (sẽ là data URL)
  proposer: {
    id: number
    name: string
    employeeCode: string
    contactInfo?: {
      email?: string
      phoneNumber?: string
    }
    workInfo?: {
      position?: {
        name: string
      }
      department?: {
        name: string
        abbreviation: string
      }
    }
  }
  createdBy: {
    id: number
    name: string
    employeeCode: string
    contactInfo?: {
      email?: string
      phoneNumber?: string
    }
    workInfo?: {
      position?: {
        name: string
      }
      department?: {
        name: string
        abbreviation: string
      }
    }
  }
  file?: {
    // Thông tin metadata của file từ DB
    id: number
    filename: string
    mimeType: string
    fileSize: number
    createdAt: string
  }
  signers: Array<{
    signer: {
      id: number
      name: string
      employeeCode: string
      contactInfo?: {
        email?: string
        phoneNumber?: string
      }
      workInfo?: {
        position?: {
          name: string
        }
        department?: {
          name: string
          abbreviation: string
        }
      }
    }
    status: string
    signedAt?: string
  }>
  approvers: Array<{
    approver: {
      id: number
      name: string
      employeeCode: string
      contactInfo?: {
        email?: string
        phoneNumber?: string
      }
      workInfo?: {
        position?: {
          name: string
        }
        department?: {
          name: string
          abbreviation: string
        }
      }
    }
    status: string
    approvedAt?: string
  }>
}




export default function ProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [proposal, setProposal] = useState<ProposalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const currentUserId = 1 // Tạm thời hardcode, trong thực tế lấy từ auth
  const proposalId = Number.parseInt(params.id as string)
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [isModalOpenpdf, setIsModalOpenpdf] = useState(false)
  // State for in-page preview
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null)
  const [currentPreviewMimeType, setCurrentPreviewMimeType] = useState<string | null>('application/pdf')
  const [previewLoading, setPreviewLoading] = useState(false)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending_signatures":
        return { color: "orange", text: "Đang chờ ký", icon: <ClockCircleOutlined /> }
      case "waiting_approval":
        return { color: "blue", text: "Đang chờ duyệt", icon: <ClockCircleOutlined /> }
      case "approved":
        return { color: "green", text: "Đã duyệt", icon: <CheckCircleOutlined /> }
      case "rejected":
        return { color: "red", text: "Đã từ chối", icon: <CloseOutlined /> }
      default:
        return { color: "default", text: status, icon: <InfoCircleOutlined /> }
    }
  }

  const getProgress = () => {
    if (!proposal) return { percent: 0, status: "normal" as const }

    const totalSigners = proposal.signers.length
    const totalApprovers = proposal.approvers.length
    const approvedSigners = proposal.signers.filter((s) => s.status === "approved").length
    const approvedApprovers = proposal.approvers.filter((a) => a.status === "approved").length

    if (proposal.status === "rejected") {
      return { percent: 100, status: "exception" as const }
    }
    if (proposal.status === "approved") {
      return { percent: 100, status: "success" as const }
    }
    if (proposal.status === "pending_signatures") {
      const percent = totalSigners > 0 ? (approvedSigners / totalSigners) * 50 : 0
      return { percent, status: "active" as const }
    }
    if (proposal.status === "waiting_approval") {
      const signaturePercent = 50 // Đã hoàn thành ký
      const approvalPercent = totalApprovers > 0 ? (approvedApprovers / totalApprovers) * 50 : 0
      return { percent: signaturePercent + approvalPercent, status: "active" as const }
    }
    return { percent: 0, status: "normal" as const }
  }


  const fetchProposal = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/proposals?id=${proposalId}`)
      const result = await response.json()

      if (response.ok) {
        setProposal(result)

        // Trích xuất buffer từ object `{ 0: ..., 1: ..., ... }`
        const bufferData = Object.values(result.file.data) as number[]
        const uint8Array = new Uint8Array(bufferData)

        const blob = new Blob([uint8Array], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)

        setCurrentPreviewUrl(url)
        setCurrentPreviewMimeType("application/pdf") // bạn QUÊN gán MIME TYPE nên điều kiện hiển thị sai
      } else {
        message.error(result.error || "Không thể tải thông tin đề xuất")
      }
    } catch (error) {
      console.error("Fetch error:", error)
      message.error("Không thể kết nối đến server")
    } finally {
      setLoading(false)
    }
  }


  const handleAction = async (action: "sign" | "approve", status: "approved" | "rejected") => {
    setActionLoading(true)
    try {
      const endpoint = action === "sign" ? "sign" : "approve"
      const response = await fetch(`/api/proposals/${proposalId}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: currentUserId,
          status,
        }),
      })
      const result = await response.json()
      if (response.ok) {
        message.success(result.message)
        fetchProposal() // Refresh data
      } else {
        message.error(result.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Action error:", error)
      message.error("Không thể kết nối đến server")
    } finally {
      setActionLoading(false)
    }
  }

  // Modified viewFile to handle in-page preview
  const handleViewFile = async () => {
    if (!proposal?.file) {
      message.error("Không có file để xem trước.")
      return
    }

    setPreviewLoading(true)
    try {
      const res = await fetch(`/api/files/${proposalId}`)
      if (!res.ok) {
        throw new Error("Failed to fetch file for preview.")
      }

      // Revoke previous URL if exists before setting a new one
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
      }

    } catch (error: any) {
      console.error("Error viewing file:", error)
      message.error(`Không thể xem trước file: ${error.message}`)
    } finally {
      setPreviewLoading(false)
    }
  }





  const showConfirm = (action: "sign" | "approve", status: "approved" | "rejected") => {
    const actionText = action === "sign" ? "ký" : "phê duyệt"
    const statusText = status === "approved" ? "đồng ý" : "từ chối"
    Modal.confirm({
      title: `Xác nhận ${statusText}`,
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn ${statusText} ${actionText} đề xuất này?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk() {
        handleAction(action, status)
      },
    })
  }

  // Modified canSign and canApprove to check for rejected status
  const canSign =
    proposal?.status !== "rejected" &&
    proposal?.signers.some((signer) => signer.signer.id === currentUserId && signer.status === "pending")
  const canApprove =
    proposal?.status !== "rejected" &&
    proposal?.approvers.some((approver) => approver.approver.id === currentUserId && approver.status === "pending")

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getTimelineItems = () => {
    if (!proposal) return []
    const items = []

    // Tạo đề xuất
    items.push({
      color: "blue",
      dot: <CheckCircleOutlined style={{ fontSize: 16 }} />,
      children: (
        <div>
          <Text strong>Đề xuất được tạo</Text>
          <div>
            <Text type="secondary">{new Date(proposal.createdAt).toLocaleString("vi-VN")}</Text>
          </div>
          <div>
            <Text type="secondary">Bởi: {proposal.proposer.name}</Text>
          </div>
        </div>
      ),
    })

    // Trạng thái ký
    proposal.signers.forEach((signer) => {
      if (signer.status !== "pending") {
        items.push({
          color: signer.status === "approved" ? "green" : "red",
          dot:
            signer.status === "approved" ? (
              <CheckCircleOutlined style={{ fontSize: 16 }} />
            ) : (
              <CloseOutlined style={{ fontSize: 16 }} />
            ),
          children: (
            <div>
              <Text strong>
                {signer.signer.name} đã {signer.status === "approved" ? "đồng ý" : "từ chối"}
              </Text>
              {signer.signedAt && (
                <div>
                  <Text type="secondary">{new Date(signer.signedAt).toLocaleString("vi-VN")}</Text>
                </div>
              )}
            </div>
          ),
        })
      }
    })

    // Trạng thái phê duyệt
    proposal.approvers.forEach((approver) => {
      if (approver.status !== "pending") {
        items.push({
          color: approver.status === "approved" ? "green" : "red",
          dot:
            approver.status === "approved" ? (
              <CheckCircleOutlined style={{ fontSize: 16 }} />
            ) : (
              <CloseOutlined style={{ fontSize: 16 }} />
            ),
          children: (
            <div>
              <Text strong>
                {approver.approver.name} đã {approver.status === "approved" ? "phê duyệt" : "từ chối"}
              </Text>
              {approver.approvedAt && (
                <div>
                  <Text type="secondary">{new Date(approver.approvedAt).toLocaleString("vi-VN")}</Text>
                </div>
              )}
            </div>
          ),
        })
      }
    })
    return items
  }

  const renderPersonCard = (
    person: any,
    role: "proposer" | "signer" | "approver",
    status?: string,
    actionDate?: string,
  ) => {
    const roleConfig = {
      proposer: { color: "#1890ff", text: "Người đề xuất" },
      signer: { color: "#722ed1", text: "Người ký" },
      approver: { color: "#52c41a", text: "Người phê duyệt" },
    }
    const statusConfig = {
      pending: { color: "orange", text: "Chờ xử lý", icon: <ClockCircleOutlined /> },
      approved: { color: "green", text: role === "signer" ? "Đã ký" : "Đã duyệt", icon: <CheckOutlined /> },
      rejected: { color: "red", text: "Đã từ chối", icon: <CloseOutlined /> },
    }

    return (
      <Card
        size="small"
        style={{
          marginBottom: 12,
          border: person.id === currentUserId ? `2px solid ${roleConfig[role].color}` : undefined,
          boxShadow: person.id === currentUserId ? `0 0 10px ${roleConfig[role].color}20` : undefined,
        }}
      >
        <Row gutter={16} align="middle">
          <Col flex="none">
            <Badge dot={person.id === currentUserId} color={roleConfig[role].color}>
              <Avatar size={48} icon={<UserOutlined />} src={person.avatar} />
            </Badge>
          </Col>
          <Col flex="auto">
            <div className="flex items-center gap-2 justify-between ">
              <Text strong style={{ fontSize: 16 }}>
                {person.name}
                {" • "}
                <Text type="secondary">{person.employeeCode}</Text>

                {person.id === currentUserId && (
                  <Tag color={roleConfig[role].color} style={{ marginLeft: 8 }}>
                    Bạn
                  </Tag>
                )}
              </Text>
                      <Space size="small" style={{ marginTop: 4 }}>
              {person.contactInfo?.email && (
                <Tooltip title={person.contactInfo.email}>
                  <MailOutlined style={{ color: "#1890ff", fontSize: 12 }} />
                </Tooltip>
              )}
              {person.contactInfo?.phoneNumber && (
                <Tooltip title={person.contactInfo.phoneNumber}>
                  <PhoneOutlined style={{ color: "#52c41a", fontSize: 12 }} />
                </Tooltip>
              )}
            </Space>
            </div>
         
            {person.workInfo?.position && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {person.workInfo.position.name}
                </Text>
                {person.workInfo.department && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {" • "}
                    {person.workInfo.department.name}
                  </Text>
                )}
              </div>
            )}
    
          </Col>
          <Col flex="none" className={`${status === 'signer-rejected' ? "hidden" : ""}`}>
            <Space direction="vertical" align="end">
              {status && (
                <Tag color={statusConfig[status as keyof typeof statusConfig]?.color || "default"}>
                  {statusConfig[status as keyof typeof statusConfig]?.icon}
                  <span style={{ marginLeft: 4 }}>
                    {statusConfig[status as keyof typeof statusConfig]?.text || status}
                  </span>
                </Tag>
              )}
              {actionDate && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(actionDate).toLocaleString("vi-VN")}
                </Text>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    )
  }

  useEffect(() => {
    if (proposalId) {
      fetchProposal()
    }
    // Cleanup function to revoke object URL when component unmounts
    return () => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
      }
    }
  }, [proposalId]) // Only proposalId in dependency array for initial fetch and unmount cleanup


  if (loading) {
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
        <Spin size="large" tip="Đang tải thông tin đề xuất..." />
      </div>
    )
  }

  if (!proposal) {
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
          <ExclamationCircleOutlined style={{ fontSize: 64, color: "#faad14", marginBottom: 16 }} />
          <Title level={3}>Không tìm thấy đề xuất</Title>
          <Button type="primary" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(proposal.status)
  const progress = getProgress()

  const closePreviewModal = () => {
    setIsModalOpenpdf(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Modal
        title={
          <Space>
            <FolderViewOutlined /> Xem trước File: {proposal.file?.filename}
          </Space>
        }
        open={isModalOpenpdf}
        onCancel={closePreviewModal}
        footer={null} // Remove default footer buttons
        width="80%" // Adjust modal width as needed
        style={{ top: 20 }} // Position modal closer to the top
        destroyOnClose // Destroy content on close to reset viewer state
      >
        <div
          style={{ height: "80vh", overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {currentPreviewUrl && currentPreviewMimeType ? (
            <>
              {currentPreviewMimeType === "application/pdf" && (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <Viewer fileUrl={currentPreviewUrl} plugins={[defaultLayoutPluginInstance]} />
                </Worker>
              )}
              {currentPreviewMimeType.startsWith("image/") && (
                <img
                  src={currentPreviewUrl || "/placeholder.svg"}
                  alt="File Preview"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              )}
              {(currentPreviewMimeType.startsWith("text/") ||
                currentPreviewMimeType === "application/json" ||
                currentPreviewMimeType === "application/xml" ||
                currentPreviewMimeType === "text/csv") && (
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      backgroundColor: "#f0f0f0",
                      padding: "16px",
                      borderRadius: "8px",
                      maxHeight: "100%",
                      overflowY: "auto",
                      width: "100%",
                    }}
                  >
                    {/* Fetch content for text files directly in modal for simplicity */}
                    {/* <TextViewer url={currentPreviewUrl} /> */}
                  </pre>
                )}
              {!currentPreviewMimeType.startsWith("image/") &&
                currentPreviewMimeType !== "application/pdf" &&
                !currentPreviewMimeType.startsWith("text/") &&
                currentPreviewMimeType !== "application/json" &&
                currentPreviewMimeType !== "application/xml" &&
                currentPreviewMimeType !== "text/csv" && (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <ExclamationCircleOutlined style={{ fontSize: 48, color: "#faad14" }} />
                    <Title level={5} style={{ marginTop: 10 }}>
                      Không hỗ trợ xem trước loại file này.
                    </Title>
                    <Text type="secondary">Vui lòng tải xuống để xem.</Text>
                  </div>
                )}
            </>
          ) : (
            <Spin tip="Đang tải nội dung xem trước..." />
          )}
        </div>
      </Modal>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Quay lại danh sách
        </Button>
      </div>

      {/* Header với trạng thái */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size="small">
              <Title level={2} style={{ margin: 0 }}>
                <FileTextOutlined /> {proposal.name}
              </Title>
              <Space>
                <Tag color={statusConfig.color} style={{ fontSize: 14, padding: "4px 12px" }}>
                  {statusConfig.icon}
                  <span style={{ marginLeft: 4 }}>{statusConfig.text}</span>
                </Tag>
                <Text type="secondary">
                  <CalendarOutlined /> Tạo lúc: {new Date(proposal.createdAt).toLocaleString("vi-VN")}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col flex="none">
            <div style={{ textAlign: "right", minWidth: 200 }}>
              <div className="flex items-center gap-4">
                <a href={`/api/files/${proposalId}`} target="_blank" rel="noopener noreferrer">
                  <Button type="primary" icon={<DownloadOutlined />}>
                    Tải xuống {proposal.name ? `(${proposal.name})` : ""}
                  </Button>
                </a>
                <Button
                  onClick={() => setIsModalOpenpdf(true)}
                  type="dashed"
                  icon={<FolderViewOutlined />}
                  size="large"
                  loading={previewLoading}
                >
                  Xem file
                </Button>
              </div>
              <Text strong>Tiến độ xử lý</Text>
              <Progress
                percent={progress.percent}
                status={progress.status}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Thông tin chi tiết */}
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
            <Text strong style={{ fontSize: 16 }}>
              {proposal.name}
            </Text>
          </Descriptions.Item>
          {proposal.description && (
            <Descriptions.Item label="Mô tả">
              <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>{proposal.description}</Paragraph>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusConfig.color} style={{ fontSize: 14, padding: "4px 12px" }}>
              {statusConfig.icon}
              <span style={{ marginLeft: 4 }}>{statusConfig.text}</span>
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{new Date(proposal.createdAt).toLocaleString("vi-VN")}</Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(proposal.updatedAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {/* File đính kèm */}
          {proposal.file && (
            <Card
              title={
                <>
                  <FileProtectOutlined /> File đính kèm
                </>
              }
              style={{ marginBottom: 24 }}
            >
              <Card
                size="small"
                style={{ backgroundColor: "#f8f9fa", border: "2px dashed #d9d9d9" }}
                bodyStyle={{ padding: 16 }}
              >
                <Row gutter={16} align="middle">
                  <Col flex="none">
                    <Avatar size={48} icon={<FileTextOutlined />} style={{ backgroundColor: "#1890ff" }} />
                  </Col>
                  <Col flex="auto">
                    <div>
                      <Text strong style={{ fontSize: 16 }}>
                        {proposal.file.filename}
                      </Text>
                    </div>
                    <div>
                      <Space size="middle">
                        <Text type="secondary">{formatFileSize(proposal.file.fileSize)}</Text>
                        <Text type="secondary">{proposal.file.mimeType}</Text>
                        <Text type="secondary">
                          Tải lên: {new Date(proposal.file.createdAt).toLocaleString("vi-VN")}
                        </Text>
                      </Space>
                    </div>
                  </Col>
                  <Col flex="none">
                    {proposal.fileUrl && (
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = `/api/files/${proposalId}` // Use direct API endpoint for download
                          link.download = proposal.file?.filename || "download"
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        size="large"
                      >
                        Tải xuống
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card>

              {/* In-page File Preview Section */}

            </Card>
          )}

          {/* Người đề xuất */}
          <Card
            title={
              <>
                <UserOutlined /> Người đề xuất
              </>
            }
            style={{ marginBottom: 24 }}
          >
            {renderPersonCard(proposal.proposer, "proposer")}
          </Card>

          {/* Danh sách người ký */}
          <Card
            title={
              <Space>
                <TeamOutlined />
                Danh sách người ký ({proposal.signers.filter((s) => s.status === "approved").length}/
                {proposal.signers.length})
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            {proposal.signers.map((signer) =>
              renderPersonCard(signer.signer, "signer", signer.status, signer.signedAt),
            )}
          </Card>

          {/* Danh sách người phê duyệt */}
          <Card
            title={
              <Space>
                <CheckCircleOutlined />
                Danh sách người phê duyệt ({proposal.approvers.filter((a) => a.status === "approved").length}/
                {proposal.approvers.length})
              </Space>
            }
          >
            {proposal.approvers.map((approver) =>
              renderPersonCard(approver.approver, "approver", proposal.status === 'rejected' && approver.status !== 'rejected' ? 'signer-rejected' : approver.status, approver.approvedAt),
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Thao tác */}
          {/* {(canSign || canApprove) && (
            <Card title="🎯 Thao tác của bạn" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                {canSign && (
                  <>
                    <Text type="secondary">Đề xuất đang chờ bạn ký duyệt:</Text>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      block
                      size="large"
                      loading={actionLoading}
                      onClick={() => showConfirm("sign", "approved")}
                    >
                      Đồng ý ký
                    </Button>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      block
                      size="large"
                      loading={actionLoading}
                      onClick={() => showConfirm("sign", "rejected")}
                    >
                      Từ chối ký
                    </Button>
                  </>
                )}
                {canApprove && (
                  <>
                    <Text type="secondary">Đề xuất đang chờ bạn phê duyệt:</Text>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      block
                      size="large"
                      loading={actionLoading}
                      onClick={() => showConfirm("approve", "approved")}
                    >
                      Phê duyệt
                    </Button>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      block
                      size="large"
                      loading={actionLoading}
                      onClick={() => showConfirm("approve", "rejected")}
                    >
                      Từ chối phê duyệt
                    </Button>
                  </>
                )}
              </Space>
            </Card>
          )} */}

          {/* Timeline lịch sử */}
          <Card title="📋 Lịch sử xử lý">
            <Timeline items={getTimelineItems()} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
