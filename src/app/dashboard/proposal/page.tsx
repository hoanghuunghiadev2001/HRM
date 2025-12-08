"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
  DatePicker,
  Space,
  Timeline,
  Upload,
  Button,
  Input,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Tag,
  Divider,
  message,
  Form,
  Modal,
  Statistic,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  UserOutlined,
  EditOutlined,
  EyeOutlined,
  DownloadOutlined,
  CarOutlined,
  CheckCircleTwoTone,
  ClockCircleTwoTone,
  RedoOutlined,
} from "@ant-design/icons";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import ModalLoading from "@/components/modalLoading";
import { useAppSelector } from "@/store/hook";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TextArea } = Input;

dayjs.extend(isBetween);

export default function ProposalCreatorPolished() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleBookings, setVehicleBookings] = useState<any>({});
  const [proposalType, setProposalType] = useState<"REGULAR" | "VEHICLE">(
    "REGULAR"
  );
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [rangeTime, setRangeTime] = useState<any>(null);
  const [managerId, setManagerId] = useState<number | null>(null);

  const conflictRef = useRef<string | null>(null);
  const user = useAppSelector((s: any) => s.user);
  const [modal, contextHolder] = Modal.useModal();

  // Fetch initial data
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [empResp, vehResp, schedResp, mgrResp] = await Promise.all([
          fetch("/api/employees/employeeProposal"),
          fetch("/api/vehicles"),
          fetch("/api/report/vehicles"),
          fetch("/api/profile/manager"),
        ]);

        const empJson = empResp.ok ? await empResp.json() : [];
        setEmployees(empJson || []);

        const vehJson = vehResp.ok ? await vehResp.json() : { vehicles: [] };
        setVehicles((vehJson.vehicles || []).filter((v: any) => !v.isBusy));

        const schedJson = schedResp.ok ? await schedResp.json() : {};
        const mapBookings: any = {};
        (schedJson.proposals || []).forEach((p: any) => {
          if (!mapBookings[p.vehicleId]) mapBookings[p.vehicleId] = [];
          mapBookings[p.vehicleId].push({
            startAt: dayjs(p.startAt),
            endAt: dayjs(p.endAt),
          });
        });
        setVehicleBookings(mapBookings);

        if (mgrResp.ok) {
          const mgrJson = await mgrResp.json();
          setManagerId(mgrJson.managerId ?? null);
        }
      } catch (e) {
        console.error(e);
        message.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Keep form signers/approvers in sync for display counts and defaults
  useEffect(() => {
    if (proposalType === "VEHICLE") {
      // set defaults for vehicle proposals
      const defaultApprovers = Array.from(new Set([6, 132]));
      const defaultSigners = managerId ? [managerId] : [];
      form.setFieldsValue({
        signers: defaultSigners,
        approvers: defaultApprovers,
      });
    } else {
      // for regular proposals, clear defaults (allow selection)
      form.setFieldsValue({ signers: [], approvers: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalType, managerId]);

  // Watches so counts update reactively
  const signersWatch = Form.useWatch("signers", form) || [];
  const approversWatch = Form.useWatch("approvers", form) || [];

  const handleBeforeUpload = (file: RcFile) => {
    const isValid =
      file.type === "application/pdf" || file.type.startsWith("image/");
    if (!isValid) {
      message.error("Chỉ chấp nhận file PDF hoặc ảnh!");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error("File không được vượt quá 10MB!");
      return Upload.LIST_IGNORE;
    }

    const url = URL.createObjectURL(file as File);
    setPdfPreviewUrl(url);
    setCurrentFile(file as File);
    setFileList([
      {
        uid: Date.now().toString(),
        name: file.name,
        status: "done",
        size: file.size,
        type: file.type,
      },
    ]);
    message.success(`${file.name} đã được tải lên`);
    return false; // prevent auto upload
  };

  const handleRemove = () => {
    setPdfPreviewUrl(null);
    setCurrentFile(null);
    setFileList([]);
    message.info("Đã xóa file");
  };

  const isRangeOverlap = (
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
    bookings: any[]
  ) => {
    if (!start || !end) return false;
    return bookings.some((b) => {
      const bStart = dayjs(b.startAt);
      const bEnd = dayjs(b.endAt);
      return start.isBefore(bEnd) && end.isAfter(bStart);
    });
  };

  const onRangeChange = (dates: any) => {
    if (!dates || !dates[0] || !dates[1]) {
      setRangeTime(null);
      return;
    }
    const [start, end] = dates;
    const rawBookings = vehicleBookings[selectedVehicle!] || [];
    if (isRangeOverlap(start, end, rawBookings)) {
      const key = `${start.valueOf()}_${end.valueOf()}`;
      if (conflictRef.current === key) {
        setRangeTime(null);
        return;
      }
      conflictRef.current = key;
      modal.error({
        title: "Khoảng thời gian này đã có xe bận!",
        onOk: () => (conflictRef.current = null),
      });
      setRangeTime(null);
      return;
    }
    conflictRef.current = null;
    setRangeTime([start, end]);
  };

  const handleSubmit = async (values: any) => {
    if (!values.name || !values.name.trim()) {
      message.error("Vui lòng nhập tên đề xuất");
      return;
    }

    if (proposalType === "REGULAR" && !currentFile) {
      message.error("Vui lòng tải lên file PDF hoặc ảnh");
      return;
    }

    let signers = values.signers || [];
    let approvers = values.approvers || [];
    if (proposalType !== "REGULAR") {
      approvers = Array.from(new Set([6, 132]));
      signers = managerId ? [managerId] : [];
    }
    if (signers.length === 0) {
      console.log(1);

      message.error("Vui lòng chọn ít nhất một người ký");
      return;
    }

    if (approvers.length === 0) {
      console.log(2);
      message.error("Vui lòng chọn ít nhất một người duyệt");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("title", values.name);
      formData.append("description", values.description || "");
      formData.append("proposerId", String(user.id || 0));
      formData.append("signerIds", JSON.stringify(signers));
      formData.append("approverIds", JSON.stringify(approvers));
      formData.append("proposalType", proposalType);

      if (proposalType === "VEHICLE") {
        formData.append("vehicleId", String(selectedVehicle || ""));
        formData.append("startAt", rangeTime ? rangeTime[0].toISOString() : "");
        formData.append("endAt", rangeTime ? rangeTime[1].toISOString() : "");
        formData.append("dropoffPlace", values.dropoffPlace || "");
      } else if (currentFile) {
        formData.append("file", currentFile);
      }

      const res = await fetch("/api/proposals", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        modal.success({ title: "Tạo đề xuất thành công" });
        form.resetFields();
        setPdfPreviewUrl(null);
        setFileList([]);
        setCurrentFile(null);
        setRangeTime(null);
        setSelectedVehicle(null);
      } else {
        modal.error({ title: json?.error || "Lỗi" });
      }
    } catch (e) {
      console.error(e);
      modal.error({ title: "Không thể kết nối server" });
    } finally {
      setSubmitting(false);
    }
  };

  // Build Select.Option elements with searchText prop so optionFilterProp works
  const employeeOptions = employees.map((u: any) => (
    <Select.Option
      key={u.id}
      value={u.id}
      searchText={`${u.name} ${u.position || ""} ${u.email || ""}`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar
          size={28}
          src={u.avatar}
          icon={<UserOutlined />}
          className="flex-shrink-0"
        />
        <div>
          <div style={{ fontWeight: 500 }}>{u.name}</div>
          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>
            {` • ` + (u.position || "")}
          </div>
        </div>
      </div>
    </Select.Option>
  ));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <ModalLoading isOpen={loading || submitting} />
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div>
          <Title
            level={3}
            style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
          >
            <EditOutlined /> Tạo Đề Xuất Mới
          </Title>
          <div style={{ color: "rgba(0,0,0,0.45)" }}>
            Tạo đề xuất chung — đề xuất xe.
          </div>
        </div>
        <Space>
          <Button
            type="primary"
            size="large"
            onClick={() => form.submit()}
            loading={submitting}
          >
            Gửi đề xuất
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card style={{ borderRadius: 8 }} bodyStyle={{ padding: 20 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ signers: [], approvers: [] }}
            >
              <Form.Item
                name="name"
                label={<Text strong>Tên đề xuất *</Text>}
                rules={[{ required: true, message: "Nhập tên đề xuất" }]}
              >
                <Input placeholder="Ví dụ: Đề xuất dùng xe đi công tác" />
              </Form.Item>

              <Form.Item name="description" label={<Text strong>Mô tả</Text>}>
                <TextArea
                  rows={4}
                  placeholder="Mô tả ngắn gọn mục đích đề xuất"
                />
              </Form.Item>

              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <Text strong>Loại đề xuất</Text>
                  <Select
                    value={proposalType}
                    onChange={(v) => {
                      setProposalType(v);
                      setPdfPreviewUrl(null);
                      setFileList([]);
                      setCurrentFile(null);
                    }}
                    style={{ width: "100%", marginTop: 8 }}
                  >
                    <Select.Option value="REGULAR">Đề xuất chung</Select.Option>
                    <Select.Option value="VEHICLE">Đề xuất xe</Select.Option>
                  </Select>
                </div>

                {proposalType === "VEHICLE" && (
                  <div style={{ flex: 1 }}>
                    <Text strong>Chọn xe *</Text>
                    <Select
                      value={selectedVehicle}
                      onChange={(v) => setSelectedVehicle(v)}
                      style={{ width: "100%", marginTop: 8 }}
                      placeholder="Chọn xe"
                    >
                      {vehicles.map((v: any) => (
                        <Select.Option
                          key={v.id}
                          value={v.id}
                        >{`${v.code} — ${v.name} — ${v.plateNumber}`}</Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>

              {proposalType === "REGULAR" ? (
                <Form.Item
                  label={<Text strong>Tải lên file (PDF / Ảnh) *</Text>}
                >
                  <Upload
                    beforeUpload={handleBeforeUpload}
                    fileList={fileList}
                    onRemove={handleRemove}
                    accept=".pdf,image/*"
                    maxCount={1}
                    showUploadList={{ showPreviewIcon: false }}
                  >
                    <Button icon={<UploadOutlined />}>Chọn file</Button>
                  </Upload>
                </Form.Item>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  <Text strong>Khoảng thời gian</Text>
                  <RangePicker
                    showTime
                    format="DD-MM-YYYY HH:mm"
                    value={rangeTime}
                    onChange={onRangeChange}
                    style={{ width: "100%", marginTop: 8 }}
                  />
                  <Form.Item
                    name="dropoffPlace"
                    label={<Text strong>Địa điểm</Text>}
                  >
                    <Input placeholder="Nhập địa điểm trả xe" />
                  </Form.Item>
                </div>
              )}

              <Divider />

              {proposalType === "REGULAR" ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <Text strong>Người ký *</Text>
                    <Form.Item
                      name="signers"
                      rules={[
                        { required: true, message: "Chọn ít nhất 1 người ký" },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        showSearch
                        optionFilterProp="searchText"
                        placeholder="Chọn người ký"
                        maxTagCount={2}
                        dropdownMatchSelectWidth={320}
                      >
                        {employeeOptions}
                      </Select>
                    </Form.Item>
                    <div style={{ marginTop: 6 }}>
                      {(signersWatch || []).slice(0, 5).map((id: any) => {
                        const u = employees.find(
                          (e: any) => Number(e.id) === Number(id)
                        );
                        if (!u) return null;
                        return (
                          <Tag key={id} style={{ marginBottom: 6 }}>
                            <Avatar
                              size={16}
                              src={u.avatar}
                              icon={<UserOutlined />}
                              style={{ marginRight: 6 }}
                            />
                            {u.name}
                          </Tag>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Text strong>Người duyệt *</Text>
                    <Form.Item
                      name="approvers"
                      rules={[
                        {
                          required: true,
                          message: "Chọn ít nhất 1 người duyệt",
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        showSearch
                        optionFilterProp="searchText"
                        placeholder="Chọn người duyệt"
                        maxTagCount={2}
                        dropdownMatchSelectWidth={320}
                      >
                        {employeeOptions}
                      </Select>
                    </Form.Item>
                    <div style={{ marginTop: 6 }}>
                      {(approversWatch || []).slice(0, 5).map((id: any) => {
                        const u = employees.find(
                          (e: any) => Number(e.id) === Number(id)
                        );
                        if (!u) return null;
                        return (
                          <Tag key={id} style={{ marginBottom: 6 }}>
                            <Avatar
                              size={16}
                              src={u.avatar}
                              icon={<UserOutlined />}
                              style={{ marginRight: 6 }}
                            />
                            {u.name}
                          </Tag>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                // VEHICLE: show defaults and hide selectors (read-only)
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <Text strong>Người ký (mặc định)</Text>
                    <div style={{ marginTop: 8 }}>
                      {(form.getFieldValue("signers") || []).map((id: any) => {
                        const u = employees.find(
                          (e: any) => Number(e.id) === Number(id)
                        );
                        const label = u ? u.name : `ID:${id}`;
                        return (
                          <Tag key={id} style={{ marginBottom: 6 }}>
                            <Avatar
                              size={16}
                              src={u?.avatar}
                              icon={<UserOutlined />}
                              style={{ marginRight: 6 }}
                            />
                            {label}
                          </Tag>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Text strong>Người duyệt (mặc định)</Text>
                    <div style={{ marginTop: 8 }}>
                      {(form.getFieldValue("approvers") || []).map(
                        (id: any) => {
                          const u = employees.find(
                            (e: any) => Number(e.id) === Number(id)
                          );
                          const label = u ? u.name : `ID:${id}`;
                          return (
                            <Tag key={id} style={{ marginBottom: 6 }}>
                              <Avatar
                                size={16}
                                src={u?.avatar}
                                icon={<UserOutlined />}
                                style={{ marginRight: 6 }}
                              />
                              {label}
                            </Tag>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Form>
          </Card>

          <Card style={{ marginTop: 12 }} bodyStyle={{ padding: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text strong>Thông tin nhanh</Text>
                <div style={{ color: "rgba(0,0,0,0.45)", fontSize: 12 }}>
                  Số lượng hiện tại
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Statistic title="Tệp" value={fileList.length} />
                <Statistic
                  title="Người ký"
                  value={(signersWatch || []).length}
                />
                <Statistic
                  title="Người duyệt"
                  value={(approversWatch || []).length}
                />
              </div>
            </div>

            <Divider />

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => currentFile && window.open(pdfPreviewUrl || "")}
                disabled={!currentFile}
              >
                Tải file
              </Button>
              <Button
                icon={<EyeOutlined />}
                onClick={() =>
                  currentFile && window.open(pdfPreviewUrl || "_blank")
                }
                disabled={!currentFile}
              >
                Xem
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card style={{ borderRadius: 8 }} bodyStyle={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong>
                <FileTextOutlined /> Xem trước
              </Text>
              <div>
                <Tag
                  icon={<CarOutlined />}
                  color={proposalType === "VEHICLE" ? "geekblue" : "default"}
                >
                  {proposalType === "VEHICLE" ? "Đề xuất xe" : "Đề xuất chung"}
                </Tag>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {proposalType === "REGULAR" ? (
                pdfPreviewUrl && currentFile ? (
                  <div style={{ height: 540 }}>
                    <iframe
                      src={`${pdfPreviewUrl}#toolbar=1&navpanes=0`}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      title="PDF Preview"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 36,
                      textAlign: "center",
                      color: "rgba(0,0,0,0.35)",
                      border: "2px dashed #f0f0f0",
                      borderRadius: 8,
                    }}
                  >
                    <FileTextOutlined style={{ fontSize: 48 }} />
                    <div style={{ marginTop: 12 }}>
                      Chưa có file để xem trước
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12 }}>
                      Tải lên file PDF để xem trực tiếp
                    </div>
                  </div>
                )
              ) : (
                <div>
                  <Text strong>Lịch bận xe</Text>
                  <Divider />
                  {selectedVehicle &&
                  (vehicleBookings[selectedVehicle] || []).length > 0 ? (
                    <Timeline>
                      {(vehicleBookings[selectedVehicle] || []).map(
                        (b: any, idx: number) => (
                          <Timeline.Item key={idx} color="red">
                            <div
                              style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                              }}
                            >
                              <ClockCircleTwoTone twoToneColor="#fa8c16" />
                              <div>
                                <div style={{ fontWeight: 500 }}>
                                  {b.startAt.format("DD/MM/YYYY HH:mm")} →{" "}
                                  {b.endAt.format("DD/MM/YYYY HH:mm")}
                                </div>
                              </div>
                            </div>
                          </Timeline.Item>
                        )
                      )}
                    </Timeline>
                  ) : (
                    <div style={{ color: "rgba(0,0,0,0.45)" }}>
                      Không có lịch bận cho xe đang chọn
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card style={{ marginTop: 12 }} bodyStyle={{ padding: 12 }}>
            <Text strong>Gợi ý</Text>
            <div
              style={{ marginTop: 8, color: "rgba(0,0,0,0.65)", fontSize: 13 }}
            >
              <div>• Kiểm tra kỹ thời gian trước khi gửi đề xuất xe.</div>
              <div>• Nếu file lớn, nén hoặc tách file để tải nhanh hơn.</div>
            </div>
          </Card>
        </Col>
      </Row>

      <div
        style={{
          marginTop: 18,
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
        }}
      >
        <Button
          icon={<RedoOutlined />}
          onClick={() => {
            form.resetFields();
            setPdfPreviewUrl(null);
            setFileList([]);
            setCurrentFile(null);
            setRangeTime(null);
          }}
          type="default"
          size="large"
          color="danger"
        >
          Reset
        </Button>
        <Button
          icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          type="primary"
          size="large"
          onClick={() => form.submit()}
          loading={submitting}
        >
          Gửi đề xuất
        </Button>
      </div>
    </div>
  );
}
