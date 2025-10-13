/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Button,
  Input,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Avatar,
  Tag,
  Divider,
  message,
  DatePicker,
  Checkbox,
  Form,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FilePdfOutlined,
  EyeOutlined,
  DownloadOutlined,
  CarOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import type { FormattedEmployee } from "@/components/api";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import ModalLoading from "@/components/modalLoading";
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hook";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ProposalCreator() {
  // ---------- existing states ----------
  const [proposalName, setProposalName] = useState("");
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [signers, setSigners] = useState<number[]>([]);
  const [approvers, setApprovers] = useState<number[]>([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [currentPdfFile, setCurrentPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Thêm state cho submit loading
  const [employees, setEmployees] = useState<FormattedEmployee[]>([]);

  // ---------- new: proposal type ----------
  const [proposalType, setProposalType] = useState<"general" | "vehicle">(
    "general"
  );
  const { name, department, id } = useAppSelector((state) => state.user);
  // ---------- vehicle fields ----------
  // const [username, setUsername] = useState("")
  // const [department, setDepartment] = useState("")
  const [timestart, setTimestart] = useState<dayjs.Dayjs | null>(null);
  const [timeend, setTimeend] = useState<dayjs.Dayjs | null>(null);
  const [location, setLocation] = useState("");

  // trạng thái checkbox (mảng giá trị)

  // ---------- helper existing functions ----------
  const customTagRender = (props: CustomTagProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { label, value, closable, onClose } = props;
    const user = employees.find((u) => u.id === value);
    if (!user) return <span />;
    return (
      <Tag
        closable={closable}
        onClose={onClose}
        style={{ display: "flex", alignItems: "center", margin: 2 }}
      >
        <Avatar
          size="small"
          src={user.avatar}
          icon={<UserOutlined />}
          style={{ marginRight: 6 }}
        />
        {user.name}
      </Tag>
    );
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees/employeeProposal");
      if (!res.ok) {
        throw new Error("Lỗi khi lấy dữ liệu nhân viên");
      }
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Lỗi:", err);
      message.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ---------- file upload handling (existing) ----------
  const beforeUpload = (file: RcFile) => {
    // when vehicle selected we hide file uploader, but still keep validation here
    if (proposalType === "vehicle") {
      return Upload.LIST_IGNORE; // ngăn Upload thực hiện
    }
    const isValidType =
      file.type === "application/pdf" ||
      file.type.startsWith("image/") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isValidType) {
      message.error("Chỉ chấp nhận file PDF hoặc ảnh!");
      return Upload.LIST_IGNORE;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error("File không được vượt quá 10MB!");
      return Upload.LIST_IGNORE;
    }

    handleFileSelect(file);
    return false; // ngăn upload tự động
  };

  const handleFileSelect = (file: File) => {
    setCurrentPdfFile(file);
    // Tạo URL preview cho PDF
    const fileURL = URL.createObjectURL(file);
    setPdfPreviewUrl(fileURL);
    // Cập nhật fileList để hiển thị trong Upload component
    const uploadFile: UploadFile = {
      uid: Date.now().toString(),
      name: file.name,
      status: "done",
      size: file.size,
      type: file.type,
    };
    setFileList([uploadFile]);
    message.success(`${file.name} đã được tải lên thành công`);
  };

  const handleRemove = () => {
    setFileList([]);
    setPdfPreviewUrl(null);
    setCurrentPdfFile(null);
    message.info("Đã xóa file");
  };

  // ---------- helper to generate DOCX from template on client ----------
  // dynamic import pizzip + docxtemplater (run in browser)

  const generateDocxFromTemplate = async (
    templatePath: string,
    data: Record<string, any>
  ): Promise<File> => {
    try {
      const PizZipModule = await import("pizzip");
      const PizZip = (PizZipModule as any).default || PizZipModule;

      const DocxtemplaterModule = await import("docxtemplater");
      const Docxtemplater: any =
        (DocxtemplaterModule as any).default || DocxtemplaterModule;
      // dynamic import to avoid SSR issues

      // fetch template from public/templates/...
      const resp = await fetch(templatePath);
      if (!resp.ok) throw new Error("Không thể tải template");
      const arrayBuffer = await resp.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.setData(data);
      try {
        doc.render();
      } catch (err) {
        console.error("Docxtemplater render error:", err);
        throw err;
      }

      const out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // create File to upload
      const filename =
        (data?.proposalName ? `${data.proposalName}` : "vehicle_proposal") +
        ".docx";
      const file = new File([out], filename, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      return file;
    } catch (error) {
      console.error("generateDocxFromTemplate error:", error);
      throw error;
    }
  };

  // map checkbox arrays to placeholders (☑/☐)
  const buildTemplateDataForVehicle = () => {
    // default all to unchecked

    // Build final object - keys must match placeholders in your DOCX template
    const tpl: Record<string, string> = {
      username: name || "",
      department: department || "",
      timeStart: timestart ? timestart.format("DD/MM/YYYY HH:mm") : "",
      timeEnd: timeend ? timeend.format("DD/MM/YYYY HH:mm") : "",
      location: location || "",
      noidung: description || "",
      proposalName: proposalName || "Đề xuất xe",
    };

    return tpl;
  };

  // ---------- submit ----------
  const handleSubmit = async () => {
    // validation
    if (!proposalName.trim()) {
      message.error("Vui lòng nhập tên đề xuất");
      return;
    }

    if (proposalType === "general") {
      if (!currentPdfFile) {
        message.error("Vui lòng tải lên file PDF");
        return;
      }
    } else {
      // vehicle: validate required vehicle fields (adjust rules as needed)
      // if (!username.trim()) return message.error("Vui lòng nhập họ tên")
      // if (!department.trim()) return message.error("Vui lòng nhập bộ phận")
      if (!timestart || !timeend)
        return message.error("Vui lòng chọn thời gian bắt đầu & kết thúc");
      // file not required because we will generate docx from template
    }

    if (signers.length === 0) {
      message.error("Vui lòng chọn ít nhất một người ký");
      return;
    }
    if (approvers.length === 0) {
      message.error("Vui lòng chọn ít nhất một người duyệt");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", proposalName.trim());
      formData.append("title", proposalName.trim());
      let finalDescription = description.trim();
      if (proposalType === "vehicle") {
        const startText = timestart ? timestart.format("DD/MM/YYYY HH:mm") : "";
        const endText = timeend ? timeend.format("DD/MM/YYYY HH:mm") : "";
        finalDescription += `\n\nThời gian bắt đầu: ${startText}\nThời gian kết thúc: ${endText}`;
      }
      formData.append("description", finalDescription);
      formData.append("proposerId", String(id)); // TODO: replace with real user id
      formData.append("signerIds", JSON.stringify(signers));
      formData.append("approverIds", JSON.stringify(approvers));
      formData.append("proposalType", proposalType);

      // attach vehicle data either as extraData and/or as generated file
      if (proposalType === "vehicle") {
        // Build template data mapping
        const tplData = buildTemplateDataForVehicle();
        // Add extraData (in case backend wants fields)
        formData.append("extraData", JSON.stringify(tplData));

        // Generate docx file from template and append as 'file'
        // Template path (public folder): /templates/vehicle_proposal_template.docx
        try {
          const generatedFile = await generateDocxFromTemplate(
            "/templates/vehicle_proposal_template.docx",
            tplData
          );
          formData.append("file", generatedFile);
        } catch (err) {
          console.error("Lỗi tạo file DOCX từ template:", err);
          message.error("Không thể tạo file từ mẫu. Vui lòng thử lại.");
          setSubmitting(false);
          return;
        }
      } else {
        // general: append currentPdfFile (or image converted earlier)
        if (currentPdfFile) {
          formData.append("file", currentPdfFile);
        }
      }

      // Call API (same endpoint as before)
      const response = await fetch("/api/proposals", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        message.success("Đề xuất đã được tạo thành công!");
        // reset everything
        setProposalName("");
        setDescription("");
        setSigners([]);
        setApprovers([]);
        setFileList([]);
        setPdfPreviewUrl(null);
        setCurrentPdfFile(null);
        // setUsername("")
        // setDepartment("")
        setTimestart(null);
        setTimeend(null);
        setLocation("");
        setProposalType("general");
        message.info("Email đã được gửi đến những người cần ký duyệt", 3);
      } else {
        message.error(result.error || "Có lỗi xảy ra khi tạo đề xuất");
        console.error("API Error:", result);
      }
    } catch (error) {
      console.error("Submit error:", error);
      message.error("Không thể kết nối đến server. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- existing helpers ----------
  const handleDownloadPdf = () => {
    if (pdfPreviewUrl && currentPdfFile) {
      const link = document.createElement("a");
      link.href = pdfPreviewUrl;
      link.download = currentPdfFile.name;
      link.click();
    }
  };

  const userSelectOptions = Array.isArray(employees)
    ? employees.map((user) => ({
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar
              size="small"
              src={user.avatar}
              icon={<UserOutlined />}
              className="flex-shrink-0"
            />
            <div>
              <div>{user.name}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {user.position} • {user.email}
              </Text>
            </div>
          </div>
        ),
        value: user.id,
        searchText: `${user.name} ${user.position} ${user.email}`,
      }))
    : [];

  const renderSelectedUsers = (
    userIds: number[],
    type: "signer" | "approver"
  ) => {
    return userIds.map((id) => {
      const user = employees.find((u) => String(u.id) === String(id));
      if (!user) return null;
      return (
        <Tag key={id} style={{ marginBottom: 4 }}>
          <Avatar
            size="small"
            src={user.avatar}
            icon={<UserOutlined />}
            style={{ marginRight: 4 }}
          />
          {user.name}
        </Tag>
      );
    });
  };

  // ---------- render ----------
  return (
    <div style={{ padding: 0, maxWidth: 1400, margin: "0 auto" }}>
      <ModalLoading isOpen={loading || submitting} />
      <Title level={2}>
        <EditOutlined /> Tạo Đề Xuất Mới
      </Title>

      <Card style={{ marginBottom: 16 }}>
        <Text strong>Loại đề xuất</Text>
        <Select
          value={proposalType}
          onChange={(v) => setProposalType(v)}
          style={{ width: 240, marginLeft: 12 }}
          options={[
            { value: "general", label: "Đề xuất chung" },
            { value: "vehicle", label: "Đề xuất xe" },
          ]}
        />
      </Card>

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
              {proposalType === "general" && (
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
              )}

              {/* If proposalType is general show upload; if vehicle hide upload (we generate docx) */}
              {proposalType === "general" && (
                <div>
                  <Text strong>Tải lên file PDF *</Text>
                  <Upload
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onRemove={handleRemove}
                    accept=".pdf,image/*"
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
                      <Button
                        icon={<UploadOutlined />}
                        size="large"
                        disabled={submitting}
                      >
                        <FilePdfOutlined /> Chọn file (PDF hoặc ảnh)
                      </Button>
                    )}
                  </Upload>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block", marginTop: 4 }}
                  >
                    Chỉ chấp nhận file PDF (tối đa 10MB)
                  </Text>
                </div>
              )}
            </Space>
          </Card>

          {/* Vehicle section: only shown when proposalType === "vehicle" */}
          {proposalType === "vehicle" && (
            <Card
              title={
                <>
                  <CarOutlined /> Đề Xuất Xe
                </>
              }
              style={{ marginBottom: 24 }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                {/* <Input placeholder="Họ tên" value={username} onChange={(e) => setUsername(e.target.value)} disabled={submitting} />
                <Input placeholder="Bộ phận" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={submitting} /> */}
                <DatePicker
                  showTime={{
                    format: "HH:mm",
                    defaultValue: dayjs("08:00", "HH:mm"), // ⏰ Giờ mặc định 08:00
                  }}
                  format="DD-MM-YYYY HH:mm" // 🗓 hiển thị không có giây
                  placeholder="Thời gian bắt đầu"
                  style={{ width: "100%" }}
                  value={timestart}
                  onChange={(val) => setTimestart(val)}
                  disabled={submitting}
                />
                <DatePicker
                  showTime={{
                    format: "HH:mm",
                    defaultValue: dayjs("12:00", "HH:mm"), // ⏰ Giờ mặc định 08:00
                  }}
                  format="DD-MM-YYYY HH:mm" // 🗓 hiển thị không có giây
                  placeholder="Thời gian kết thúc"
                  style={{ width: "100%" }}
                  value={timeend}
                  onChange={(val) => setTimeend(val)}
                  disabled={submitting}
                />
                <Input
                  placeholder="Địa điểm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={submitting}
                />
                <TextArea
                  placeholder="Nội dung công tác"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={submitting}
                />
              </Space>
            </Card>
          )}

          {/* Bàn giao tình trạng xe: show only vehicle */}

          <Card title="Phân Quyền">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Text strong>
                  <CheckCircleOutlined
                    style={{ color: "#1890ff", marginRight: 4 }}
                  />
                  Người ký *
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Chọn người ký"
                  value={signers}
                  onChange={setSigners}
                  options={userSelectOptions}
                  style={{ width: "100%", marginTop: 8 }}
                  optionLabelProp="customLabel"
                  optionFilterProp="searchText"
                  tagRender={customTagRender}
                  disabled={submitting}
                />
                <div style={{ marginTop: 8 }}>
                  {renderSelectedUsers(signers, "signer")}
                </div>
              </div>

              <div>
                <Text strong>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: 4 }}
                  />
                  Người duyệt *
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Chọn người duyệt"
                  value={approvers}
                  onChange={setApprovers}
                  options={userSelectOptions}
                  style={{ width: "100%", marginTop: 8 }}
                  optionLabelProp="customLabel"
                  optionFilterProp="searchText"
                  tagRender={customTagRender}
                  disabled={submitting}
                />
                <div style={{ marginTop: 8 }}>
                  {renderSelectedUsers(approvers, "approver")}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <FileTextOutlined /> Xem Trước PDF
                </span>
                {/* For vehicle we won't show upload actions (since file generated from template) */}
                {proposalType === "general" &&
                  pdfPreviewUrl &&
                  currentPdfFile && (
                    <Space>
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => window.open(pdfPreviewUrl, "_blank")}
                        disabled={submitting}
                      >
                        Mở rộng
                      </Button>
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadPdf}
                        disabled={submitting}
                      >
                        Tải xuống
                      </Button>
                    </Space>
                  )}
              </div>
            }
            style={{ position: "sticky", top: 24 }}
          >
            {/* If general and preview available show iframe */}
            {proposalType === "general" && pdfPreviewUrl && currentPdfFile ? (
              <div>
                <div style={{ marginBottom: 16, textAlign: "center" }}>
                  <FilePdfOutlined
                    style={{ fontSize: 20, color: "#ff4d4f", marginRight: 8 }}
                  />
                  <Text strong>{currentPdfFile.name}</Text>
                  <br />
                  <Text type="secondary">
                    {(currentPdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </div>
                <div
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    src={`${pdfPreviewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    style={{ width: "100%", height: 600, border: "none" }}
                    title="PDF Preview"
                  />
                </div>
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Sử dụng thanh cuộn hoặc các nút điều hướng trong PDF để xem
                    toàn bộ nội dung
                  </Text>
                </div>
              </div>
            ) : proposalType === "vehicle" ? (
              <div style={{ padding: 24 }}>
                <Text strong>Thông báo</Text>
                <div style={{ marginTop: 8 }}>
                  Đây là loại <Text strong>Đề xuất xe</Text>. File sẽ được tạo
                  tự động từ mẫu Word và gửi lên server khi bạn bấm Tạo Đề Xuất.
                </div>
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">
                    Bạn có thể tải hàng mẫu (DOCX) tại{" "}
                    <a
                      href="/templates/vehicle_proposal_template.docx"
                      target="_blank"
                      rel="noreferrer"
                    >
                      /templates/vehicle_proposal_template.docx
                    </a>
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
                  <FilePdfOutlined
                    style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <div style={{ color: "#999", fontSize: 16 }}>
                    Tải lên file PDF để xem trước
                  </div>
                  <div style={{ color: "#ccc", fontSize: 12, marginTop: 8 }}>
                    File PDF sẽ hiển thị tại đây ngay sau khi tải lên
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider />
      <div style={{ textAlign: "right" }}>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          loading={submitting}
          disabled={submitting}
        >
          Tạo Đề Xuất
        </Button>
      </div>
    </div>
  );
}
