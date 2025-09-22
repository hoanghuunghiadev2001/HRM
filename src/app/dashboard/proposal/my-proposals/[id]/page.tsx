/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
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

import { Worker, Viewer } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const { Title, Text, Paragraph } = Typography

interface ProposalDetail {
  id: number
  name: string
  title: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
  fileUrl?: string
  proposer: any
  createdBy: any
  file?: {
    id: number
    filename: string
    mimeType: string
    fileSize: number
    createdAt: string
  }
  signers: Array<{ signer: any; status: string; signedAt?: string }>
  approvers: Array<{ approver: any; status: string; approvedAt?: string }>
}

export default function ProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [proposal, setProposal] = useState<ProposalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [isModalOpenpdf, setIsModalOpenpdf] = useState(false)
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const proposalId = Number.parseInt(params.id as string)
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const currentUserId = 1

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

    if (proposal.status === "rejected") return { percent: 100, status: "exception" as const }
    if (proposal.status === "approved") return { percent: 100, status: "success" as const }
    if (proposal.status === "pending_signatures") {
      const percent = totalSigners > 0 ? (approvedSigners / totalSigners) * 50 : 0
      return { percent, status: "active" as const }
    }
    if (proposal.status === "waiting_approval") {
      const signaturePercent = 50
      const approvalPercent = totalApprovers > 0 ? (approvedApprovers / totalApprovers) * 50 : 0
      return { percent: signaturePercent + approvalPercent, status: "active" as const }
    }
    return { percent: 0, status: "normal" as const }
  }

  const fetchProposal = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/proposals?id=${proposalId}`)
      const result = await res.json()
      if (res.ok) {
        setProposal(result)
        if (result.file?.data) {
          const bufferData = Object.values(result.file.data) as number[]
          const uint8Array = new Uint8Array(bufferData)
          const blob = new Blob([uint8Array], { type: "application/pdf" })
          setCurrentPreviewUrl(URL.createObjectURL(blob))
        }
      } else {
        message.error(result.error || "Không thể tải thông tin đề xuất")
      }
    } catch (error) {
      console.error(error)
      message.error("Không thể kết nối đến server")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: "sign" | "approve", status: "approved" | "rejected") => {
    setActionLoading(true)
    try {
      const endpoint = action === "sign" ? "sign" : "approve"
      const res = await fetch(`/api/proposals/${proposalId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: currentUserId, status }),
      })
      const result = await res.json()
      if (res.ok) {
        message.success(result.message)
        fetchProposal()
      } else {
        message.error(result.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error(error)
      message.error("Không thể kết nối đến server")
    } finally {
      setActionLoading(false)
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
      onOk() { handleAction(action, status) },
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]
  }

  const getTimelineItems = () => {
    if (!proposal) return []
    const items: any[] = []
    items.push({
      color: "blue",
      dot: <CheckCircleOutlined style={{ fontSize: 16 }} />,
      children: (
        <div>
          <Text strong>Đề xuất được tạo</Text>
          <div><Text type="secondary">{new Date(proposal.createdAt).toLocaleString("vi-VN")}</Text></div>
          <div><Text type="secondary">Bởi: {proposal.proposer.name}</Text></div>
        </div>
      ),
    })
    proposal.signers.forEach((s) => {
      if (s.status !== "pending") {
        items.push({
          color: s.status === "approved" ? "green" : "red",
          dot: s.status === "approved" ? <CheckCircleOutlined style={{ fontSize: 16 }} /> : <CloseOutlined style={{ fontSize: 16 }} />,
          children: (
            <div>
              <Text strong>{s.signer.name} đã {s.status === "approved" ? "đồng ý" : "từ chối"}</Text>
              {s.signedAt && <div><Text type="secondary">{new Date(s.signedAt).toLocaleString("vi-VN")}</Text></div>}
            </div>
          ),
        })
      }
    })
    proposal.approvers.forEach((a) => {
      if (a.status !== "pending") {
        items.push({
          color: a.status === "approved" ? "green" : "red",
          dot: a.status === "approved" ? <CheckCircleOutlined style={{ fontSize: 16 }} /> : <CloseOutlined style={{ fontSize: 16 }} />,
          children: (
            <div>
              <Text strong>{a.approver.name} đã {a.status === "approved" ? "phê duyệt" : "từ chối"}</Text>
              {a.approvedAt && <div><Text type="secondary">{new Date(a.approvedAt).toLocaleString("vi-VN")}</Text></div>}
            </div>
          ),
        })
      }
    })
    return items
  }

  const renderPersonCard = (person: any, role: "proposer" | "signer" | "approver", status?: string, actionDate?: string) => {
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
                {person.name} • <Text type="secondary">{person.employeeCode}</Text>
                {person.id === currentUserId && <Tag color={roleConfig[role].color} style={{ marginLeft: 8 }}>Bạn</Tag>}
              </Text>
              <Space size="small" style={{ marginTop: 4 }}>
                {person.contactInfo?.email && <Tooltip title={person.contactInfo.email}><MailOutlined style={{ color: "#1890ff", fontSize: 12 }} /></Tooltip>}
                {person.contactInfo?.phoneNumber && <Tooltip title={person.contactInfo.phoneNumber}><PhoneOutlined style={{ color: "#52c41a", fontSize: 12 }} /></Tooltip>}
              </Space>
            </div>
            {person.workInfo?.position && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>{person.workInfo.position.name}</Text>
                {person.workInfo.department && <Text type="secondary" style={{ fontSize: 12 }}> • {person.workInfo.department.name}</Text>}
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
              {actionDate && <Text type="secondary" style={{ fontSize: 11 }}>{new Date(actionDate).toLocaleString("vi-VN")}</Text>}
            </Space>
          </Col>
        </Row>
      </Card>
    )
  }

  useEffect(() => {
    if (proposalId) fetchProposal()
    return () => { if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl) }
  }, [proposalId])

  if (loading) return <div style={{ padding: 24, textAlign: "center", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}><Spin size="large" tip="Đang tải thông tin đề xuất..." /></div>
  if (!proposal) return <div style={{ padding: 24, textAlign: "center", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}><div><ExclamationCircleOutlined style={{ fontSize: 64, color: "#faad14", marginBottom: 16 }} /><Title level={3}>Không tìm thấy đề xuất</Title><Button type="primary" onClick={() => router.back()}>Quay lại</Button></div></div>

  const statusConfigFinal = getStatusConfig(proposal.status)
  const progress = getProgress()

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Modal xem PDF */}
      <Modal
        title={<Space><FolderViewOutlined /> Xem trước File: {proposal.file?.filename}</Space>}
        open={isModalOpenpdf}
        onCancel={() => setIsModalOpenpdf(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
        destroyOnClose
      >
        <div style={{ height: "80vh", overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {currentPreviewUrl ? (

            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
              <Viewer fileUrl={currentPreviewUrl} plugins={[defaultLayoutPluginInstance]} />
            </Worker>
          ) : (
            <Spin tip="Đang tải nội dung xem trước..." />
          )}
        </div>
      </Modal>

      {/* Back button */}
      <div style={{ marginBottom: 24 }}><Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Quay lại danh sách</Button></div>

      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size="small">
              <Title level={2} style={{ margin: 0 }}><FileTextOutlined /> {proposal.name}</Title>
              <Space>
                <Tag color={statusConfigFinal.color} style={{ fontSize: 14, padding: "4px 12px" }}>{statusConfigFinal.icon}<span style={{ marginLeft: 4 }}>{statusConfigFinal.text}</span></Tag>
                <Text type="secondary"><CalendarOutlined /> Tạo lúc: {new Date(proposal.createdAt).toLocaleString("vi-VN")}</Text>
              </Space>
            </Space>
          </Col>
          <Col flex="none">
            <div style={{ textAlign: "right", minWidth: 200 }}>
              <div className="flex items-center gap-4">
                <a href={`/api/files/${proposalId}`} target="_blank" rel="noopener noreferrer">
                  <Button type="primary" icon={<DownloadOutlined />}>Tải xuống</Button>
                </a>
                <Button onClick={() => setIsModalOpenpdf(true)} type="dashed" icon={<FolderViewOutlined />} size="large" loading={previewLoading}>Xem file</Button>
              </div>
              <Text strong>Tiến độ xử lý</Text>
              <Progress percent={progress.percent} status={progress.status} strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }} />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Thông tin chi tiết */}
      <Card title={<><InfoCircleOutlined /> Thông tin chi tiết</>} style={{ marginBottom: 24 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Tên đề xuất"><Text strong style={{ fontSize: 16 }}>{proposal.name}</Text></Descriptions.Item>
          {proposal.description && <Descriptions.Item label="Mô tả"><Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>{proposal.description}</Paragraph></Descriptions.Item>}
          <Descriptions.Item label="Trạng thái"><Tag color={statusConfigFinal.color} style={{ fontSize: 14, padding: "4px 12px" }}>{statusConfigFinal.icon}<span style={{ marginLeft: 4 }}>{statusConfigFinal.text}</span></Tag></Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{new Date(proposal.createdAt).toLocaleString("vi-VN")}</Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">{new Date(proposal.updatedAt).toLocaleString("vi-VN")}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Card title={<><TeamOutlined /> Người đề xuất / ký</>} style={{ marginBottom: 24 }}>
            {renderPersonCard(proposal.proposer, "proposer")}
            {proposal.signers.map((s) => renderPersonCard(s.signer, "signer", s.status, s.signedAt))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<><CheckOutlined /> Người phê duyệt</>} style={{ marginBottom: 24 }}>
            {proposal.approvers.map((a) => renderPersonCard(a.approver, "approver", a.status, a.approvedAt))}
          </Card>
        </Col>
      </Row>

      <Card title={<><ClockCircleOutlined /> Lịch sử xử lý</>} style={{ marginBottom: 24 }}>
        <Timeline items={getTimelineItems()} />
      </Card>

      {/* Action buttons */}
      <Card style={{ textAlign: "center" }}>
        {proposal.signers.some((s) => s.signer.id === currentUserId && s.status === "pending") && (
          <Space>
            <Button type="primary" loading={actionLoading} onClick={() => showConfirm("sign", "approved")}>Ký đồng ý</Button>
            <Button danger loading={actionLoading} onClick={() => showConfirm("sign", "rejected")}>Ký từ chối</Button>
          </Space>
        )}
        {proposal.approvers.some((a) => a.approver.id === currentUserId && a.status === "pending") && (
          <Space>
            <Button type="primary" loading={actionLoading} onClick={() => showConfirm("approve", "approved")}>Phê duyệt</Button>
            <Button danger loading={actionLoading} onClick={() => showConfirm("approve", "rejected")}>Từ chối</Button>
          </Space>
        )}
      </Card>
    </div>
  )
}
