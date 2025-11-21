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
  Form,
  Modal,
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
} from "@ant-design/icons";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import type { FormattedEmployee } from "@/components/api";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import ModalLoading from "@/components/modalLoading";
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hook";

const { Title, Text } = Typography;
const { TextArea } = Input;

export interface CreateProposalFormData {
  name: string;
  title: string;
  description?: string;
  proposerId: number;
  signerIds: number[];
  approverIds: number[];
  proposalType?: "REGULAR" | "VEHICLE";
  vehicleId?: number | null;
  startAt?: Date | null;
  endAt?: Date | null;
  dropoffPlace?: string | null;
}

export default function ProposalCreator() {
  // ---------- states ----------
  const [proposalName, setProposalName] = useState("");
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [signers, setSigners] = useState<number[]>([]);
  const [approvers, setApprovers] = useState<number[]>([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<FormattedEmployee[]>([]);
  const [modal, contextHolder] = Modal.useModal();
  const [vehicles, setVehicles] = useState<
    { id: number; name: string; code: string; plateNumber: string }[]
  >([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);

  // proposal type
  const [proposalType, setProposalType] = useState<"REGULAR" | "VEHICLE">(
    "REGULAR"
  );

  // vehicle fields
  const [startAt, setStartAt] = useState<dayjs.Dayjs | null>(null);
  const [endAt, setEndAt] = useState<dayjs.Dayjs | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState("");

  const { name, department, id } = useAppSelector((state) => state.user);
  const [managerId, setManagerId] = useState<number>();

  // ---------- helpers ----------
  const customTagRender = (props: CustomTagProps) => {
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

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Lỗi khi lấy danh sách xe");
      const data = await res.json();

      // lọc chỉ lấy xe rảnh
      const freeVehicles = (data.vehicles || []).filter((v: any) => !v.isBusy);
      setVehicles(freeVehicles);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách xe");
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees/employeeProposal");
      if (!res.ok) throw new Error("Lỗi khi lấy danh sách nhân viên");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const fetchManager = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/manager");
      if (!res.ok) throw new Error("Lỗi khi lấy quản lý");
      const data = await res.json();
      setManagerId(data.managerId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchManager();
    fetchVehicles(); // thêm dòng này
  }, []);

  useEffect(() => {
    if (proposalType === "VEHICLE") {
      if (managerId) setSigners([managerId]);
      setApprovers((prev) => {
        const base = new Set(prev);
        base.add(6);
        base.add(132);
        return Array.from(base);
      });
    } else {
      setSigners([]);
      setApprovers([]);
    }
  }, [proposalType, managerId]);

  const beforeUpload = (file: RcFile) => {
    if (proposalType === "VEHICLE") return Upload.LIST_IGNORE;
    const isValid =
      file.type === "application/pdf" ||
      file.type.startsWith("image/") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!isValid) {
      message.error("Chỉ chấp nhận file PDF hoặc ảnh!");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error("File không được vượt quá 10MB!");
      return Upload.LIST_IGNORE;
    }
    handleFileSelect(file);
    return false;
  };

  const handleFileSelect = (file: File) => {
    setCurrentFile(file);
    const url = URL.createObjectURL(file);
    setPdfPreviewUrl(url);
    const uploadFile: UploadFile = {
      uid: Date.now().toString(),
      name: file.name,
      status: "done",
      size: file.size,
      type: file.type,
    };
    setFileList([uploadFile]);
    message.success(`${file.name} đã được tải lên`);
  };

  const handleRemove = () => {
    setFileList([]);
    setPdfPreviewUrl(null);
    setCurrentFile(null);
    message.info("Đã xóa file");
  };

  const buildTemplateDataForVehicle = () => ({
    username: name || "",
    department: department || "",
    timeStart: startAt ? startAt.format("DD/MM/YYYY HH:mm") : "",
    timeEnd: endAt ? endAt.format("DD/MM/YYYY HH:mm") : "",
    location: dropoffPlace || "",
    noidung: description || "",
    proposalName: proposalName || "Đề xuất xe",
  });

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

      const resp = await fetch(templatePath);
      if (!resp.ok) throw new Error("Không thể tải template");
      const arrayBuffer = await resp.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      doc.setData(data);
      doc.render();

      const out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      return new File([out], `${proposalName || "vehicle_proposal"}.docx`, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    } catch (err) {
      console.error("generateDocxFromTemplate error:", err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!proposalName.trim()) {
      message.error("Vui lòng nhập tên đề xuất");
      return;
    }
    if (proposalType === "REGULAR" && !currentFile) {
      message.error("Vui lòng tải lên file PDF hoặc ảnh");
      return;
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
      formData.append("description", description.trim());
      formData.append("proposerId", String(id));
      formData.append("signerIds", JSON.stringify(signers));
      formData.append("approverIds", JSON.stringify(approvers));
      formData.append(
        "proposalType",
        proposalType === "VEHICLE" ? "VEHICLE" : "REGULAR"
      );

      if (proposalType === "VEHICLE") {
        formData.append("vehicleId", String(selectedVehicle));
        formData.append("startAt", startAt ? startAt.toISOString() : "");
        formData.append("endAt", endAt ? endAt.toISOString() : "");
        formData.append("dropoffPlace", dropoffPlace);
        const tplData = buildTemplateDataForVehicle();
        // const generatedFile = await generateDocxFromTemplate(
        //   "/templates/vehicle_proposal_template.docx",
        //   tplData
        // );
        // formData.append("file", generatedFile);
      } else if (currentFile) {
        formData.append("file", currentFile);
      }

      const res = await fetch("/api/proposals", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (res.ok) {
        modal.success({ title: "Tạo đề xuất thành công" });
        setProposalName("");
        setDescription("");
        setSigners([]);
        setApprovers([]);
        setFileList([]);
        setPdfPreviewUrl(null);
        setCurrentFile(null);
        setStartAt(null);
        setEndAt(null);
        setDropoffPlace("");
        setProposalType("REGULAR");
        message.info("Email đã gửi đến người ký/duyệt", 3);
      } else {
        modal.error({ title: "Có lỗi xảy ra" });
        message.error(result.error || "Lỗi server");
      }
    } catch (err) {
      console.error(err);
      modal.error({ title: "Không thể kết nối server" });
      message.error("Không thể kết nối server. Vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  const userSelectOptions = employees.map((user) => ({
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
    searchText: `${user.name} ${user.position} ${user.email}`,
  }));

  const renderSelectedUsers = (userIds: number[]) =>
    userIds.map((id) => {
      const user = employees.find((u) => Number(u.id) === Number(id));
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

  const handleDownloadPdf = () => {
    if (pdfPreviewUrl && currentFile) {
      const link = document.createElement("a");
      link.href = pdfPreviewUrl;
      link.download = currentFile.name;
      link.click();
    }
  };

  // ---------- render ----------
  return (
    <div style={{ padding: 0, maxWidth: 1400, margin: "0 auto" }}>
      <ModalLoading isOpen={loading || submitting} />
      {contextHolder}

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
            { value: "REGULAR", label: "Đề xuất chung" },
            { value: "VEHICLE", label: "Đề xuất xe" },
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
                  disabled={submitting}
                />
              </div>
              <div>
                <Text strong>Mô tả</Text>
                <TextArea
                  placeholder="Nhập mô tả"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={submitting}
                />
              </div>

              {proposalType === "REGULAR" && (
                <div>
                  <Text strong>Tải lên file PDF/Ảnh *</Text>
                  <Upload
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onRemove={handleRemove}
                    accept=".pdf,image/*"
                    maxCount={1}
                    showUploadList={{
                      showPreviewIcon: false,
                      showRemoveIcon: !submitting,
                      showDownloadIcon: false,
                    }}
                  >
                    {fileList.length === 0 && (
                      <Button icon={<UploadOutlined />} disabled={submitting}>
                        Chọn file
                      </Button>
                    )}
                  </Upload>
                </div>
              )}

              {proposalType === "VEHICLE" && (
                <div>
                  <div className="my-2 flex gap-4 items-center">
                    <Text className="flex-shrink-0" strong>
                      Chọn xe *
                    </Text>
                    <Select
                      placeholder="Chọn xe"
                      value={selectedVehicle}
                      onChange={setSelectedVehicle}
                      options={vehicles.map((v) => ({
                        label: `${v.code} - ${v.name} - ${v.plateNumber}`,
                        value: v.id,
                      }))}
                      style={{ width: "100%", marginTop: 4 }}
                      disabled={submitting}
                    />
                  </div>
                  <DatePicker
                    className="mt-2"
                    showTime
                    format="DD-MM-YYYY HH:mm"
                    placeholder="Thời gian bắt đầu"
                    style={{ width: "100%" }}
                    value={startAt}
                    onChange={setStartAt}
                    disabled={submitting}
                  />
                  <DatePicker
                    showTime
                    format="DD-MM-YYYY HH:mm"
                    placeholder="Thời gian kết thúc"
                    style={{ width: "100%", marginTop: 8 }}
                    value={endAt}
                    onChange={setEndAt}
                    disabled={submitting}
                  />
                  <Input
                    placeholder="Địa điểm"
                    value={dropoffPlace}
                    onChange={(e) => setDropoffPlace(e.target.value)}
                    style={{ marginTop: 8 }}
                    disabled={submitting}
                  />
                </div>
              )}
            </Space>
          </Card>
          {proposalType === "REGULAR" && (
            <Card title="Phân Quyền">
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div className="w-full  gap-4">
                  <Text className="flex-shrink-0" strong>
                    Người ký *
                  </Text>
                  <Select
                    mode="multiple"
                    placeholder="Chọn người ký"
                    value={signers}
                    onChange={setSigners}
                    options={userSelectOptions}
                    optionLabelProp="customLabel"
                    optionFilterProp="searchText"
                    tagRender={customTagRender}
                    disabled={submitting}
                    className="w-full mt-2"
                  />
                  <div className="mt-2">{renderSelectedUsers(signers)}</div>
                </div>
                <div className="w-full  gap-4">
                  <Text className="flex-shrink-0" strong>
                    Người duyệt *
                  </Text>
                  <Select
                    mode="multiple"
                    placeholder="Chọn người duyệt"
                    value={approvers}
                    onChange={setApprovers}
                    options={userSelectOptions}
                    optionLabelProp="customLabel"
                    optionFilterProp="searchText"
                    tagRender={customTagRender}
                    disabled={submitting}
                    className="w-full mt-2"
                  />
                  <div className="mt-2">{renderSelectedUsers(approvers)}</div>
                </div>
              </Space>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <FileTextOutlined /> Xem Trước
                </span>
                {proposalType === "REGULAR" && pdfPreviewUrl && currentFile && (
                  <Space>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => window.open(pdfPreviewUrl, "_blank")}
                    >
                      Mở rộng
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadPdf}
                    >
                      Tải xuống
                    </Button>
                  </Space>
                )}
              </div>
            }
          >
            {proposalType === "REGULAR" && pdfPreviewUrl && currentFile ? (
              <iframe
                src={`${pdfPreviewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                style={{ width: "100%", height: 600, border: "none" }}
                title="PDF Preview"
              />
            ) : proposalType === "VEHICLE" ? (
              <Text>
                Đây là loại <strong>Đề xuất xe</strong>. File sẽ được tạo tự
                động từ mẫu Word.
              </Text>
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
                <FilePdfOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
                <div>Tải lên file PDF để xem trước</div>
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
        >
          Tạo đề xuất
        </Button>
      </div>
    </div>
  );
}
