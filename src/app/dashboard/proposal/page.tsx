"use client"

import { useEffect, useState } from "react"
import { Upload, Button, Input, Select, Card, Row, Col, Typography, Space, Avatar, Tag, Divider, message } from "antd"
import {
  UploadOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FilePdfOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons"
import type { UploadFile, RcFile } from "antd/es/upload/interface"
import type { FormattedEmployee } from "@/components/api"
import type { CustomTagProps } from "rc-select/lib/BaseSelect"
import ModalLoading from "@/components/modalLoading"

const { Title, Text } = Typography
const { TextArea } = Input

export default function ProposalCreator() {
  const [proposalName, setProposalName] = useState("")
  const [description, setDescription] = useState("")
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [signers, setSigners] = useState<number[]>([])
  const [approvers, setApprovers] = useState<number[]>([])
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [currentPdfFile, setCurrentPdfFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false) // Thêm state cho submit loading
  const [employees, setEmployees] = useState<FormattedEmployee[]>([])

  const customTagRender = (props: CustomTagProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { label, value, closable, onClose } = props
    const user = employees.find((u) => u.id === value)
    if (!user) return <span />
    return (
      <Tag closable={closable} onClose={onClose} style={{ display: "flex", alignItems: "center", margin: 2 }}>
        <Avatar size="small" src={user.avatar} icon={<UserOutlined />} style={{ marginRight: 6 }} />
        {user.name}
      </Tag>
    )
  }

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/employees/employeeProposal")
      if (!res.ok) {
        throw new Error("Lỗi khi lấy dữ liệu nhân viên")
      }
      const data = await res.json()
      setEmployees(data)
    } catch (err) {
      console.error("Lỗi:", err)
      message.error("Không thể tải danh sách nhân viên")
    } finally {
      setLoading(false)
    }
  }

  // Xử lý trước khi upload
  const beforeUpload = (file: RcFile) => {
    // Kiểm tra file PDF
    if (file.type !== "application/pdf") {
      message.error("Chỉ chấp nhận file PDF!")
      return false
    }
    // Kiểm tra kích thước file (10MB)
    if (file.size > 10 * 1024 * 1024) {
      message.error("File không được vượt quá 10MB!")
      return false
    }
    // Xử lý file ngay tại đây
    handleFileSelect(file)
    return false // Ngăn upload tự động
  }

  // Xử lý khi chọn file
  const handleFileSelect = (file: File) => {
    setCurrentPdfFile(file)
    // Tạo URL preview cho PDF
    const fileURL = URL.createObjectURL(file)
    setPdfPreviewUrl(fileURL)
    // Cập nhật fileList để hiển thị trong Upload component
    const uploadFile: UploadFile = {
      uid: Date.now().toString(),
      name: file.name,
      status: "done",
      size: file.size,
      type: file.type,
    }
    setFileList([uploadFile])
    message.success(`${file.name} đã được tải lên thành công`)
  }

  // Xử lý khi xóa file
  const handleRemove = () => {
    setFileList([])
    setPdfPreviewUrl(null)
    setCurrentPdfFile(null)
    message.info("Đã xóa file")
  }

  // Cập nhật hàm handleSubmit để gọi API
  const handleSubmit = async () => {
    // Validation
    if (!proposalName.trim()) {
      message.error("Vui lòng nhập tên đề xuất")
      return
    }
    if (!currentPdfFile) {
      message.error("Vui lòng tải lên file PDF")
      return
    }
    if (signers.length === 0) {
      message.error("Vui lòng chọn ít nhất một người ký")
      return
    }
    if (approvers.length === 0) {
      message.error("Vui lòng chọn ít nhất một người duyệt")
      return
    }

    setSubmitting(true)

    try {
      // Tạo FormData để gửi file và dữ liệu
      const formData = new FormData()

      // Thêm thông tin đề xuất
      formData.append("name", proposalName.trim())
      formData.append("title", proposalName.trim()) // Sử dụng name làm title
      formData.append("description", description.trim())
      formData.append("proposerId", "1") // Tạm thời hardcode, trong thực tế lấy từ session/auth
      formData.append("signerIds", JSON.stringify(signers))
      formData.append("approverIds", JSON.stringify(approvers))

      // Thêm file PDF
      formData.append("file", currentPdfFile)

      // Gọi API
      const response = await fetch("/api/proposals", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        message.success("Đề xuất đã được tạo thành công!")

        // Reset form sau khi tạo thành công
        setProposalName("")
        setDescription("")
        setSigners([])
        setApprovers([])
        setFileList([])
        setPdfPreviewUrl(null)
        setCurrentPdfFile(null)

        // Có thể redirect hoặc hiển thị thông tin đề xuất vừa tạo
        console.log("Proposal created:", result)

        // Hiển thị thông báo chi tiết
        message.info("Email đã được gửi đến những người cần ký duyệt", 3)
      } else {
        // Xử lý lỗi từ API
        message.error(result.error || "Có lỗi xảy ra khi tạo đề xuất")
        console.error("API Error:", result)
      }
    } catch (error) {
      console.error("Submit error:", error)
      message.error("Không thể kết nối đến server. Vui lòng thử lại!")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadPdf = () => {
    if (pdfPreviewUrl && currentPdfFile) {
      const link = document.createElement("a")
      link.href = pdfPreviewUrl
      link.download = currentPdfFile.name
      link.click()
    }
  }

  const userSelectOptions = Array.isArray(employees)
    ? employees.map((user) => ({
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar size="small" src={user.avatar} icon={<UserOutlined />} />
            <div>
              <div>{user.name}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {user.position} • {user.email}
              </Text>
            </div>
          </div>
        ),
        value: user.id,
      }))
    : []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderSelectedUsers = (userIds: number[], type: "signer" | "approver") => {
    return userIds.map((id) => {
      const user = employees.find((u) => String(u.id) === String(id))
      if (!user) return null
      return (
        <Tag key={id} style={{ marginBottom: 4 }}>
          <Avatar size="small" src={user.avatar} icon={<UserOutlined />} style={{ marginRight: 4 }} />
          {user.name}
        </Tag>
      )
    })
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <ModalLoading isOpen={loading || submitting} />
      <Title level={2}>
        <EditOutlined /> Tạo Đề Xuất Mới
      </Title>
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="Thông Tin Đề Xuất" style={{ marginBottom: 24 }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Text strong>Tên đề xuất *</Text>
                <Input
                  placeholder="Nhập tên đề xuất"
                  value={proposalName}
                  onChange={(e) => setProposalName(e.target.value)}
                  style={{ marginTop: 8 }}
                  disabled={submitting}
                />
              </div>
              <div>
                <Text strong>Mô tả</Text>
                <TextArea
                  placeholder="Nhập mô tả chi tiết về đề xuất"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  style={{ marginTop: 8 }}
                  disabled={submitting}
                />
              </div>
              <div>
                <Text strong>Tải lên file PDF *</Text>
                <Upload
                  fileList={fileList}
                  beforeUpload={beforeUpload}
                  onRemove={handleRemove}
                  accept=".pdf"
                  maxCount={1}
                  style={{ marginTop: 8 }}
                  disabled={submitting}
                  showUploadList={{
                    showPreviewIcon: false,
                    showRemoveIcon: !submitting,
                    showDownloadIcon: false,
                  }}
                >
                  {fileList.length === 0 && (
                    <Button icon={<UploadOutlined />} size="large" disabled={submitting}>
                      <FilePdfOutlined /> Chọn file PDF
                    </Button>
                  )}
                </Upload>
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                  Chỉ chấp nhận file PDF (tối đa 10MB)
                </Text>
              </div>
            </Space>
          </Card>
          <Card title="Phân Quyền">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Text strong>
                  <CheckCircleOutlined style={{ color: "#1890ff", marginRight: 4 }} />
                  Người ký *
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Chọn người ký"
                  value={signers}
                  onChange={setSigners}
                  options={userSelectOptions}
                  style={{ width: "100%", marginTop: 8 }}
                  optionLabelProp="label"
                  tagRender={customTagRender}
                  disabled={submitting}
                />
                <div style={{ marginTop: 8 }}>{renderSelectedUsers(signers, "signer")}</div>
              </div>
              <div>
                <Text strong>
                  <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 4 }} />
                  Người duyệt *
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Chọn người duyệt"
                  value={approvers}
                  onChange={setApprovers}
                  options={userSelectOptions}
                  style={{ width: "100%", marginTop: 8 }}
                  optionLabelProp="label"
                  tagRender={customTagRender}
                  disabled={submitting}
                />
                <div style={{ marginTop: 8 }}>{renderSelectedUsers(approvers, "approver")}</div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>
                  <FileTextOutlined /> Xem Trước PDF
                </span>
                {pdfPreviewUrl && currentPdfFile && (
                  <Space>
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => window.open(pdfPreviewUrl, "_blank")}
                      disabled={submitting}
                    >
                      Mở rộng
                    </Button>
                    <Button type="text" icon={<DownloadOutlined />} onClick={handleDownloadPdf} disabled={submitting}>
                      Tải xuống
                    </Button>
                  </Space>
                )}
              </div>
            }
            style={{ position: "sticky", top: 24 }}
          >
            {pdfPreviewUrl && currentPdfFile ? (
              <div>
                <div style={{ marginBottom: 16, textAlign: "center" }}>
                  <FilePdfOutlined style={{ fontSize: 20, color: "#ff4d4f", marginRight: 8 }} />
                  <Text strong>{currentPdfFile.name}</Text>
                  <br />
                  <Text type="secondary">{(currentPdfFile.size / 1024 / 1024).toFixed(2)} MB</Text>
                </div>
                <div style={{ border: "1px solid #d9d9d9", borderRadius: 6, overflow: "hidden" }}>
                  <iframe
                    src={`${pdfPreviewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    style={{
                      width: "100%",
                      height: 600,
                      border: "none",
                    }}
                    title="PDF Preview"
                  />
                </div>
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Sử dụng thanh cuộn hoặc các nút điều hướng trong PDF để xem toàn bộ nội dung
                  </Text>
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fafafa",
                  border: "2px dashed #d9d9d9",
                  borderRadius: 6,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <FilePdfOutlined style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }} />
                  <div style={{ color: "#999", fontSize: 16 }}>Tải lên file PDF để xem trước</div>
                  <div style={{ color: "#ccc", fontSize: 12, marginTop: 8 }}>
                    File PDF sẽ được hiển thị trực tiếp tại đây
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
      <Divider />
      <div style={{ textAlign: "center" }}>
        <Space size="middle">
          <Button size="large" disabled={submitting}>
            Hủy
          </Button>
          <Button type="primary" size="large" onClick={handleSubmit} loading={submitting} disabled={submitting}>
            {submitting ? "Đang tạo đề xuất..." : "Tạo Đề Xuất"}
          </Button>
        </Space>
      </div>
    </div>
  )
}
