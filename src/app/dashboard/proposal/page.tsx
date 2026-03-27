/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
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
  Tag,
  Divider,
  message,
  Form,
  Modal,
  Statistic,
  Empty,
  Tooltip,
} from "antd";
import {
  FileTextOutlined,
  RedoOutlined,
  SendOutlined,
  CarOutlined,
  ClockCircleTwoTone,
  EnvironmentOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  EyeOutlined,
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

export default function ProposalCreatorProfessional() {
  const [form] = Form.useForm();

  // State Quản lý file
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewFiles, setPreviewFiles] = useState<
    { url: string; name: string; type: string }[]
  >([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // State Dữ liệu hệ thống
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleBookings, setVehicleBookings] = useState<any>({});
  const [proposalType, setProposalType] = useState<"REGULAR" | "VEHICLE">(
    "REGULAR",
  );
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [rangeTime, setRangeTime] = useState<any>(null);
  const [managerIds, setManagerIds] = useState<number[]>([]);

  const user = useAppSelector((s: any) => s.user);
  const [modal, contextHolder] = Modal.useModal();

  // 1. FETCH DỮ LIỆU
  useEffect(() => {
    const fetchInitialData = async () => {
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
          setManagerIds(mgrJson.managerIds || []);
        }
      } catch (e) {
        message.error("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // 2. KIỂM TRA TRÙNG LỊCH
  const isRangeOverlap = (
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
    bookings: any[],
  ) => {
    return bookings.some(
      (b) => start.isBefore(dayjs(b.endAt)) && end.isAfter(dayjs(b.startAt)),
    );
  };

  const onVehicleTimeChange = (dates: any) => {
    if (!dates || !dates[0] || !dates[1]) {
      setRangeTime(null);
      return;
    }
    const [start, end] = dates;
    const currentBookings = vehicleBookings[selectedVehicle!] || [];

    if (isRangeOverlap(start, end, currentBookings)) {
      modal.error({
        title: "Trùng lịch xe!",
        content: "Xe đã có người đăng ký. Vui lòng chọn khung giờ khác.",
      });
      setRangeTime(null);
    } else {
      setRangeTime(dates);
    }
  };

  // 3. Auto-fill người duyệt
  useEffect(() => {
    if (proposalType === "VEHICLE") {
      form.setFieldsValue({ signers: managerIds, approvers: [6] });
    } else {
      form.setFieldsValue({ signers: [], approvers: [] });
    }
  }, [proposalType, managerIds, form]);

  const signersWatch = Form.useWatch("signers", form) || [];
  const approversWatch = Form.useWatch("approvers", form) || [];

  // 4. Xử lý File
  const handleBeforeUpload = (file: RcFile) => {
    const isAllowed =
      file.type === "application/pdf" || file.type.startsWith("image/");
    if (!isAllowed) {
      message.error(`${file.name} không đúng định dạng PDF/Ảnh!`);
      return Upload.LIST_IGNORE;
    }
    const url = URL.createObjectURL(file as File);
    const newFileItem = {
      uid: Math.random().toString(36),
      name: file.name,
      status: "done" as const,
      originFileObj: file,
      url: url,
    };
    setFileList((prev) => [...prev, newFileItem]);
    setPreviewFiles((prev) => [
      ...prev,
      { url, name: file.name, type: file.type },
    ]);
    setActiveIndex(previewFiles.length);
    return false;
  };

  const removeFile = (index: number) => {
    const updatedPreviews = [...previewFiles];
    URL.revokeObjectURL(updatedPreviews[index].url);
    setFileList((prev) => prev.filter((_, i) => i !== index));
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
    if (activeIndex >= updatedPreviews.length - 1)
      setActiveIndex(Math.max(0, updatedPreviews.length - 2));
  };

  const handleSubmit = async (values: any) => {
    if (proposalType === "REGULAR" && fileList.length === 0)
      return message.warning("Vui lòng đính kèm tài liệu!");
    if (proposalType === "VEHICLE" && !rangeTime)
      return message.warning("Vui lòng chọn thời gian sử dụng xe!");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("proposerId", String(user.id || 0));
      formData.append("signerIds", JSON.stringify(values.signers));
      formData.append("approverIds", JSON.stringify(values.approvers));
      formData.append("proposalType", proposalType);

      if (proposalType === "VEHICLE") {
        formData.append("vehicleId", String(selectedVehicle));
        formData.append("startAt", rangeTime[0].toISOString());
        formData.append("endAt", rangeTime[1].toISOString());
        formData.append("dropoffPlace", values.dropoffPlace || "");
      } else {
        fileList.forEach(
          (file) =>
            file.originFileObj && formData.append("files", file.originFileObj),
        );
      }

      const res = await fetch("/api/proposals", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        modal.success({ title: "Gửi đề xuất thành công!" });
        handleReset();
      } else {
        const err = await res.json();
        message.error(err.error || "Gửi thất bại");
      }
    } catch (e) {
      message.error("Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    previewFiles.forEach((f) => URL.revokeObjectURL(f.url));
    setFileList([]);
    setPreviewFiles([]);
    setRangeTime(null);
    setSelectedVehicle(null);
    setProposalType("REGULAR");
  };

  return (
    <div className="max-w-[1600px] mx-auto p-3 sm:p-6 bg-[#f0f2f5] min-h-screen font-sans">
      <ModalLoading isOpen={loading || submitting} />
      {contextHolder}

      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 rounded-xl shadow-sm gap-4">
        <Space align="center" size="middle">
          <div className="bg-blue-600 p-2 sm:p-3 rounded-lg shadow-lg">
            <FileTextOutlined className="text-white text-xl sm:text-2xl" />
          </div>
          <div>
            <Title level={4} className="!mb-0 text-base sm:text-lg">
              Trình Ký Đề Xuất
            </Title>
            <Text type="secondary" className="text-xs hidden sm:block">
              Toyota Binh Duong System
            </Text>
          </div>
        </Space>
        <Space className="w-full md:w-auto">
          <Button
            icon={<RedoOutlined />}
            onClick={handleReset}
            className="flex-1 md:flex-none h-10 rounded-lg"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => form.submit()}
            loading={submitting}
            className="flex-1 md:flex-none bg-blue-600 h-10 px-6 rounded-lg shadow-md"
          >
            Gửi
          </Button>
        </Space>
      </div>

      <Row gutter={[20, 20]}>
        {/* CỘT TRÁI: FORM */}
        <Col xs={24} lg={14} xl={15}>
          <Card className="rounded-xl border-none shadow-sm overflow-hidden">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Row gutter={16}>
                <Col xs={24} md={16}>
                  <Form.Item
                    name="name"
                    label={<Text strong>Tiêu đề đề xuất</Text>}
                    rules={[{ required: true, message: "Nhập tiêu đề" }]}
                  >
                    <Input
                      placeholder="Ví dụ: Đề xuất thanh toán..."
                      size="large"
                      className="rounded-md"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label={<Text strong>Loại hình</Text>}>
                    <Select
                      value={proposalType}
                      onChange={setProposalType}
                      size="large"
                      className="w-full"
                    >
                      <Select.Option value="REGULAR">
                        Văn bản (Đa file)
                      </Select.Option>
                      <Select.Option value="VEHICLE">Sử dụng xe</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label={<Text strong>Nội dung tóm tắt</Text>}
              >
                <TextArea
                  rows={3}
                  placeholder="Mô tả mục đích..."
                  className="rounded-md"
                />
              </Form.Item>

              {/* Upload Files Section */}
              {proposalType === "REGULAR" && (
                <div className="mb-6">
                  <Text strong className="block mb-2">
                    Tài liệu đính kèm
                  </Text>
                  <Upload.Dragger
                    multiple
                    beforeUpload={handleBeforeUpload}
                    fileList={[]}
                    className="bg-gray-50 border-2 border-dashed border-blue-200 rounded-xl"
                  >
                    <div className="py-2">
                      <PaperClipOutlined className="text-blue-500 text-2xl" />
                      <p className="text-xs mt-1">
                        Kéo thả hoặc nhấn để chọn tập tin (PDF/Ảnh)
                      </p>
                    </div>
                  </Upload.Dragger>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewFiles.map((file, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-all ${activeIndex === idx ? "border-blue-500 bg-blue-50" : "bg-white"}`}
                      >
                        <Space className="overflow-hidden">
                          {file.type === "application/pdf" ? (
                            <FilePdfOutlined className="text-red-500" />
                          ) : (
                            <FileImageOutlined className="text-green-500" />
                          )}
                          <Text ellipsis className="max-w-[120px] text-xs">
                            {file.name}
                          </Text>
                        </Space>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicle Section */}
              {proposalType === "VEHICLE" && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item label={<Text strong>Chọn xe</Text>} required>
                        <Select
                          placeholder="Chọn xe..."
                          value={selectedVehicle}
                          onChange={(v) => {
                            setSelectedVehicle(v);
                            setRangeTime(null);
                          }}
                          size="large"
                        >
                          {vehicles.map((v) => (
                            <Select.Option key={v.id} value={v.id}>
                              <CarOutlined className="mr-2 text-blue-500" />{" "}
                              {v.plateNumber} - {v.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={<Text strong>Thời gian</Text>} required>
                        <RangePicker
                          showTime
                          format="DD/MM HH:mm"
                          value={rangeTime}
                          onChange={onVehicleTimeChange}
                          size="large"
                          className="w-full"
                          disabled={!selectedVehicle}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="dropoffPlace"
                        label={<Text strong>Điểm đến</Text>}
                      >
                        <Input
                          prefix={
                            <EnvironmentOutlined className="text-red-500" />
                          }
                          placeholder="Địa chỉ chi tiết..."
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}

              <Divider orientation="left">
                <Tag color="blue" className="rounded-full px-4">
                  Luồng phê duyệt
                </Tag>
              </Divider>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="signers"
                    label={<Text strong>Kiểm duyệt</Text>}
                    required
                  >
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Chọn người kiểm..."
                      size="large"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={employees.map((e) => ({
                        value: e.id,
                        label: `${e.name} ${e.workInfo?.position?.name ? `(${e.workInfo.position.name})` : ""}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="approvers"
                    label={<Text strong>Phê duyệt cuối</Text>}
                    required
                  >
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Chọn người duyệt..."
                      size="large"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={employees.map((e) => ({
                        value: e.id,
                        label: `${e.name} ${e.position ? `(${e.position})` : ""}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* CỘT PHẢI: PREVIEW (Tự động xuống dưới trên Mobile) */}
        <Col xs={24} lg={10} xl={9}>
          <Space direction="vertical" className="w-full" size="large">
            <Card
              title={
                <Space>
                  <EyeOutlined className="text-blue-500" />
                  <Text strong>Xem trước tài liệu</Text>
                </Space>
              }
              className="rounded-xl shadow-sm overflow-hidden"
              bodyStyle={{ padding: 0 }}
            >
              {proposalType === "REGULAR" ? (
                previewFiles.length > 0 ? (
                  <div className="bg-gray-100">
                    <div className="bg-white p-2 border-b px-4">
                      <Text
                        italic
                        className="text-[10px] text-gray-500 truncate"
                      >
                        {previewFiles[activeIndex].name}
                      </Text>
                    </div>
                    {previewFiles[activeIndex].type === "application/pdf" ? (
                      <iframe
                        src={previewFiles[activeIndex].url}
                        className="w-full h-[450px] md:h-[600px] border-none"
                        title="Preview"
                      />
                    ) : (
                      <div className="w-full h-[450px] md:h-[600px] flex items-center justify-center p-4">
                        <img
                          src={previewFiles[activeIndex].url}
                          alt="preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-gray-50">
                    <Empty description="Chưa có tệp đính kèm" />
                  </div>
                )
              ) : (
                <div className="p-6">
                  <Text strong className="block mb-4">
                    Lịch xe hiện tại:
                  </Text>
                  {selectedVehicle &&
                  (vehicleBookings[selectedVehicle] || []).length > 0 ? (
                    <Timeline mode="left">
                      {(vehicleBookings[selectedVehicle] || []).map(
                        (b: any, i: number) => (
                          <Timeline.Item
                            key={i}
                            color="red"
                            dot={<ClockCircleTwoTone twoToneColor="#ff4d4f" />}
                          >
                            <div className="text-[10px] text-gray-400">
                              {b.startAt.format("DD/MM HH:mm")} -{" "}
                              {b.endAt.format("HH:mm")}
                            </div>
                            <div className="font-medium text-xs">Đã bận</div>
                          </Timeline.Item>
                        ),
                      )}
                    </Timeline>
                  ) : (
                    <Empty
                      description="Xe trống lịch"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>
              )}
            </Card>

            <Card className="bg-slate-900 rounded-xl border-none p-2">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title={<span className="text-slate-400 text-xs">Tệp</span>}
                    value={fileList.length}
                    prefix={<PaperClipOutlined />}
                    valueStyle={{ color: "#fff", fontSize: "1.2rem" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={
                      <span className="text-slate-400 text-xs">Người ký</span>
                    }
                    value={signersWatch.length + approversWatch.length}
                    valueStyle={{ color: "#fff", fontSize: "1.2rem" }}
                  />
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
