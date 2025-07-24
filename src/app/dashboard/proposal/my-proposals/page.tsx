/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Tabs,
  message,
} from "antd"
import {
  FileTextOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useRouter } from "next/navigation"
import axios from "axios"

import ModalApproveProposal from "@/components/ModalApproveProposal"
import ModalLoading from "@/components/modalLoading"
import { useAppSelector } from "@/store/hook"

const { Title, Text } = Typography
const { TabPane } = Tabs

interface Proposal {
  id: number
  name: string
  title: string
  description?: string
  status: string
  createdAt: string
  proposer: {
    id: number
    name: string
    employeeCode: string
  }
  file?: {
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
    }
    status: string
  }>
  approvers: Array<{
    approver: {
      id: number
      name: string
      employeeCode: string
    }
    status: string
  }>
}

interface resultData {
  data: Proposal[]
  total: number
}

export default function MyProposalsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [createdProposals, setCreatedProposals] = useState<resultData>()
  const [pendingSignatures, setPendingSignatures] = useState<resultData>()
  const [pendingApprovals, setPendingApprovals] = useState<resultData>()
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { id } = useAppSelector((state) => state.user);
  const getStatusColor = (status: string) => {
    return {
      pending_signatures: "orange",
      waiting_approval: "blue",
      approved: "green",
      rejected: "red",
    }[status] || "default"
  }

  const getStatusText = (status: string) => {
    return {
      pending_signatures: "Đang chờ ký",
      waiting_approval: "Đang chờ duyệt",
      approved: "Đã duyệt",
      rejected: "Đã từ chối",
    }[status] || status
  }

  const fetchProposals = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/proposals/my-proposals?page=${page}&pageSize=${pageSize}`)
      const data = await response.json()

      if (response.ok) {
        setCreatedProposals(data.created)
        setPendingApprovals(data.need_to_approve)
        setPendingSignatures(data.need_to_sign)

      } else {
        message.error(data.error || "Không thể tải danh sách đề xuất")
      }
    } catch (error) {
      console.error("Fetch error:", error)
      message.error("Không thể kết nối đến server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [page, pageSize])

  const showConfirm = async (
    proposalId: number,
    action: "sign" | "approve",
    status: "approved" | "rejected"
  ) => {
    setActionLoading(proposalId)
    try {
      await axios.post(`/api/proposals/${proposalId}/${action}`, {
        proposalId,
        status,
      })

      message.success(status === "approved" ? "Đã phê duyệt!" : "Đã từ chối đề xuất!")
      fetchProposals()
    } catch (error) {
      console.error("Approval error:", error)
      message.error("Có lỗi xảy ra khi gửi phê duyệt.")
    } finally {
      setActionLoading(null)
    }
  }

  const renderPeopleTags = (
    list: any[],
    type: "signer" | "approver"
  ) => {
    const colorMap = {
      signer: "#1890ff",
      approver: "#52c41a",
    }
    console.log(list);


    return (
      <div>
        <Text strong style={{ color: colorMap[type] }}>
          {type === "signer" ? "Người ký" : "Người duyệt"}:
        </Text>
        <div style={{ marginTop: 4 }}>
          <Space wrap>
            {list.map((item) => {
              const user = item[type]
              return (
                <Tag
                  key={user.id}
                  color={item.status === "approved" ? "green" : item.status === "rejected" ? "red" : "orange"}
                  style={{
                    border: user.id === id ? `2px solid ${colorMap[type]}` : 'none',
                  }}
                >
                  {user.name}
                  {item.status === "approved" && <CheckOutlined style={{ marginLeft: 4 }} />}
                  {item.status === "rejected" && <CloseOutlined style={{ marginLeft: 4 }} />}
                </Tag>
              )
            })}
          </Space>
        </div>
      </div>
    )
  }

  const handleViewDetail = (proposalId: number) => {
    router.push(`/dashboard/proposal/my-proposals/${proposalId}`)
  }

  const createdColumns: ColumnsType<Proposal> = [
    {
      title: "Tên đề xuất",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>

        </div>
      ),
    },
    {
      title: "Người lập đề xuất",
      dataIndex: "name",
      key: "employeeProposer",
      render: (text, record) => (
        record.proposer.name && (
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            {record.proposer.name} ({record.proposer.employeeCode})
          </Text>
        )
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record.id)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ]

  const pendingColumns: ColumnsType<Proposal> = [
    {
      title: "Tên đề xuất",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            Người đề xuất: {record.proposer.name}
          </Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              {record.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "File",
      key: "file",
      render: (_, record) =>
        record.file ? (
          <Button type="link" icon={<FileTextOutlined />} size="small">
            {record.file.filename}
          </Button>
        ) : (
          <Text type="secondary">Không có file</Text>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ]

  const actionColumn = (actionType: "sign" | "approve"): ColumnsType<Proposal>[number] => ({
    title: "Thao tác",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          size="small"
          loading={actionLoading === record.id}
          onClick={() => showConfirm(record.id, actionType, "approved")}
        >
          {actionType === "sign" ? "Đồng ý" : "Phê duyệt"}
        </Button>
        <Button
          danger
          icon={<CloseOutlined />}
          size="small"
          loading={actionLoading === record.id}
          onClick={() => showConfirm(record.id, actionType, "rejected")}
        >
          Từ chối
        </Button>
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record.id)}
        >
          Xem chi tiết
        </Button>
      </Space>
    ),
  })

  useEffect(() => {
    fetchProposals()
  }, [])

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <ModalLoading isOpen={loading} />


      <Title level={2} style={{ marginBottom: 24 }}>
        <FileTextOutlined /> Quản lý đề xuất
      </Title>

      <Tabs defaultActiveKey="created" size="large" onChange={(key) => {
        setPage(1) // Reset page when switching tabs
        setPageSize(10) // Reset page size when switching tabs

      }}>
        <TabPane
          tab={<span><FileTextOutlined /> Đề xuất  ({createdProposals?.data.length})</span>}
          key="created"
        >
          <Card>
            <Table
              columns={createdColumns}
              dataSource={createdProposals?.data}
              rowKey="id"
              loading={loading}
              scroll={{y: "calc(100vh - 380px)"}}
              pagination={{
                current: page,
                pageSize,
                total: createdProposals?.total,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: (newPage, newPageSize) => {
                  setPage(newPage)
                  setPageSize(newPageSize)
                },
              }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={<span><ClockCircleOutlined /> Cần ký ({pendingSignatures?.data.length})</span>}
          key="pending_signature"
        >
          <Card>
            <Table
              columns={[...pendingColumns, actionColumn("sign")]}
              dataSource={pendingSignatures?.data}
              rowKey="id"
              loading={loading}
              pagination={{
                current: page,
                pageSize,
                total: pendingSignatures?.total,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: (newPage, newPageSize) => {
                  setPage(newPage)
                  setPageSize(newPageSize)
                },
              }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={<span><CheckCircleOutlined /> Cần phê duyệt ({pendingApprovals?.data.length})</span>}
          key="pending_approval"
        >
          <Card>
            <Table
              columns={[...pendingColumns, actionColumn("approve")]}
              dataSource={pendingApprovals?.data}
              rowKey="id"
              loading={loading}
              pagination={{
                current: page,
                pageSize,
                total: pendingApprovals?.total,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: (newPage, newPageSize) => {
                  setPage(newPage)
                  setPageSize(newPageSize)
                },
              }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}
