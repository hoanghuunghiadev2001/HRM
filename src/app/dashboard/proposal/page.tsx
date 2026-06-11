/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  Switch,
  Alert,
  InputNumber,
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
  UserOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import ModalLoading from "@/components/modalLoading";
import { useAppSelector } from "@/store/hook";
import { logger } from "@/lib/logger";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TextArea } = Input;

dayjs.extend(isBetween);

// ─── Cấu hình người ký/duyệt theo chi nhánh ───────────────────────────────────
const BRANCH_APPROVER_CONFIG = {
  TBD: {
    signerIds: [59],
    signerIdsWithException: [59, 18],
    approverIds: [317],
  },
  TMP: {
    signerIds: [36],
    signerIdsWithException: [36, 18],
    approverIds: [318],
  },
} as const;

// ─── Ngưỡng % ngoại lệ ────────────────────────────────────────────────────────
const EXCEPTION_THRESHOLD_PERCENT = 5;

type ProposalTypeValue = "REGULAR" | "VEHICLE" | "VEHICLE_GRAB";
type GrabSubType = "PERSONAL" | "CUSTOMER";
type BrandType = "TBD" | "TMP";

export default function ProposalCreatorProfessional() {
  const [form] = Form.useForm();

  // ── State: File ──────────────────────────────────────────────────────────────
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewFiles, setPreviewFiles] = useState<
    { url: string; name: string; type: string }[]
  >([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // ── State: Dữ liệu hệ thống ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleBookings, setVehicleBookings] = useState<any>({});
  const [managerIds, setManagerIds] = useState<number[]>([]);

  // ── State: Loại đề xuất ──────────────────────────────────────────────────────
  const [proposalType, setProposalType] =
    useState<ProposalTypeValue>("REGULAR");

  // ── State: VEHICLE ────────────────────────────────────────────────────────────
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [rangeTime, setRangeTime] = useState<any>(null);

  // ── State: VEHICLE_GRAB ───────────────────────────────────────────────────────
  const [grabSubType, setGrabSubType] = useState<GrabSubType>("PERSONAL");
  const [isException, setIsException] = useState(false);
  const [roPercent, setRoPercent] = useState<number | null>(null);
  const [autoException, setAutoException] = useState(false);

  const user = useAppSelector((s: any) => s.user);
  const userBrand = user?.brand as BrandType | undefined;

  const [modal, contextHolder] = Modal.useModal();

  // ── 1. FETCH DỮ LIỆU ─────────────────────────────────────────────────────────
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

  // ── 2. AUTO-FILL LUỒNG PHÊ DUYỆT ─────────────────────────────────────────────
  useEffect(() => {
    console.log(userBrand);

    if (proposalType === "VEHICLE") {
      // Xe nội bộ: manager ký, id 6 duyệt
      form.setFieldsValue({ signers: managerIds, approvers: [6] });
      return;
    }

    if (proposalType === "VEHICLE_GRAB") {
      if (grabSubType === "PERSONAL") {
        // Cá nhân: giống xe nội bộ
        form.setFieldsValue({ signers: managerIds, approvers: [6] });
        return;
      }

      // Khách hàng: lấy theo chi nhánh của user
      if (!userBrand || !BRANCH_APPROVER_CONFIG[userBrand]) {
        form.setFieldsValue({ signers: [], approvers: [] });
        return;
      }

      const cfg = BRANCH_APPROVER_CONFIG[userBrand];
      const effectiveException = isException || autoException;
      form.setFieldsValue({
        signers: effectiveException
          ? cfg.signerIdsWithException
          : cfg.signerIds,
        approvers: cfg.approverIds,
      });
      return;
    }

    // REGULAR
    form.setFieldsValue({ signers: [], approvers: [] });
  }, [
    proposalType,
    grabSubType,
    isException,
    autoException,
    managerIds,
    userBrand,
    form,
  ]);

  // ── 3. TÍNH % TIỀN TRÊN RO VÀ TỰ ĐỘNG NGOẠI LỆ ──────────────────────────────
  const handleAmountChange = useCallback(
    (value: number | null) => {
      // 1. Lấy giá trị của cả 2 ô một cách chính xác
      // Sử dụng form.getFieldsValue() để gom toàn bộ data hiện tại của form
      const currentFields = form.getFieldsValue();

      const vehicleAmount = currentFields.vehicleAmount;
      const roAmount = currentFields.roAmount;

      if (
        vehicleAmount &&
        roAmount &&
        Number(roAmount) > 0 &&
        Number(vehicleAmount) > 0
      ) {
        const percent = (Number(vehicleAmount) / Number(roAmount)) * 100;
        setRoPercent(percent);

        if (percent > EXCEPTION_THRESHOLD_PERCENT && !autoException) {
          setAutoException(true);
          message.warning(
            `Số tiền xe chiếm ${percent.toFixed(1)}% giá trị RO (> ${EXCEPTION_THRESHOLD_PERCENT}%) — tự động thêm ngoại lệ.`,
          );
        } else if (percent <= EXCEPTION_THRESHOLD_PERCENT && autoException) {
          setAutoException(false);
        }
      } else {
        setRoPercent(null);
        if (autoException) setAutoException(false);
      }
    },
    [form, autoException],
  ); // Nhớ thêm 'form' vào dependency nhé

  // ── 4. KIỂM TRA TRÙNG LỊCH XE ────────────────────────────────────────────────
  const isRangeOverlap = (
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
    bookings: any[],
  ) =>
    bookings.some(
      (b) => start.isBefore(dayjs(b.endAt)) && end.isAfter(dayjs(b.startAt)),
    );

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

  // ── 5. XỬ LÝ FILE ─────────────────────────────────────────────────────────────
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
      url,
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

  // ── 6. SUBMIT ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (values: any) => {
    if (proposalType === "REGULAR" && fileList.length === 0)
      return message.warning("Vui lòng đính kèm tài liệu!");
    if (proposalType === "VEHICLE" && !rangeTime)
      return message.warning("Vui lòng chọn thời gian sử dụng xe!");
    if (
      proposalType === "VEHICLE_GRAB" &&
      grabSubType === "CUSTOMER" &&
      !userBrand
    )
      return message.warning("Không xác định được chi nhánh của bạn!");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("proposerId", String(user.id || 0));
      formData.append("signerIds", JSON.stringify(values.signers || []));
      formData.append("approverIds", JSON.stringify(values.approvers || []));
      formData.append("proposalType", proposalType);

      if (proposalType === "VEHICLE_GRAB") {
        formData.append("grabSubType", grabSubType);
        formData.append("pickupPlace", values.pickupPlace || "");
        formData.append("dropoffPlace", values.dropoffPlace || "");
        formData.append("vehicleKm", String(values.vehicleKm || 0));
        formData.append("vehicleAmount", String(values.vehicleAmount || 0));
        formData.append("roAmount", String(values.roAmount || 0));

        if (grabSubType === "CUSTOMER") {
          formData.append("customerName", values.customerName || "");
          formData.append("roNumber", values.roNumber || "");
          formData.append("roAmount", String(values.roAmount || 0));
          formData.append("roPercent", String(roPercent?.toFixed(2) || "0"));
          formData.append("isException", String(isException || autoException));
          formData.append("branch", userBrand || "");
        }
      }

      if (proposalType === "VEHICLE") {
        formData.append("vehicleId", String(selectedVehicle));
        formData.append("startAt", rangeTime[0].toISOString());
        formData.append("endAt", rangeTime[1].toISOString());
        formData.append("dropoffPlace", values.dropoffPlace || "");
      }

      if (proposalType === "REGULAR") {
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

  // ── 7. RESET ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    form.resetFields();
    previewFiles.forEach((f) => URL.revokeObjectURL(f.url));
    setFileList([]);
    setPreviewFiles([]);
    setRangeTime(null);
    setSelectedVehicle(null);
    setProposalType("REGULAR");
    setGrabSubType("PERSONAL");
    setIsException(false);
    setAutoException(false);
    setRoPercent(null);
  };

  const signersWatch = Form.useWatch("signers", form) || [];
  const approversWatch = Form.useWatch("approvers", form) || [];

  const effectiveException = isException || autoException;

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1600px] mx-auto p-3 sm:p-6 bg-[#f0f2f5] min-h-screen font-sans">
      <ModalLoading isOpen={loading || submitting} />
      {contextHolder}

      {/* Header */}
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
              Toyota Binh Duong System 2
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
        {/* ── CỘT TRÁI: FORM ────────────────────────────────────────────────── */}
        <Col xs={24} lg={14} xl={15}>
          <Card className="rounded-xl border-none shadow-sm overflow-hidden">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              {/* Tiêu đề & Loại hình */}
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
                      onChange={(v) => {
                        setProposalType(v);
                        setGrabSubType("PERSONAL");
                        setIsException(false);
                        setAutoException(false);
                        setRoPercent(null);
                      }}
                      size="large"
                      className="w-full"
                    >
                      <Select.Option value="REGULAR">
                        Văn bản (Đa file)
                      </Select.Option>
                      <Select.Option value="VEHICLE">Sử dụng xe</Select.Option>
                      <Select.Option value="VEHICLE_GRAB">
                        Đặt xe GSM
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Mô tả */}
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

              {/* ── REGULAR: Upload files ─────────────────────────────────── */}
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
                        className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-all ${
                          activeIndex === idx
                            ? "border-blue-500 bg-blue-50"
                            : "bg-white"
                        }`}
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

              {/* ── VEHICLE: Xe nội bộ ───────────────────────────────────── */}
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
                              <CarOutlined className="mr-2 text-blue-500" />
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

              {/* ── VEHICLE_GRAB: Đặt xe GSM ─────────────────────────────── */}
              {proposalType === "VEHICLE_GRAB" && (
                <div className="mb-6">
                  {/* Toggle Cá nhân / Khách hàng */}
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setGrabSubType("PERSONAL");
                        setIsException(false);
                        setAutoException(false);
                        setRoPercent(null);
                      }}
                      className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        grabSubType === "PERSONAL"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <UserOutlined />
                      Cá nhân
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGrabSubType("CUSTOMER");
                        setIsException(false);
                        setAutoException(false);
                        setRoPercent(null);
                      }}
                      className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        grabSubType === "CUSTOMER"
                          ? "bg-green-600 text-white"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <TeamOutlined />
                      Khách hàng
                    </button>
                  </div>

                  {/* ── Sub-form: Cá nhân ──────────────────────────────────── */}
                  {grabSubType === "PERSONAL" && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="pickupPlace"
                            label={<Text strong>Điểm bắt đầu</Text>}
                            rules={[
                              { required: true, message: "Nhập điểm đón" },
                            ]}
                          >
                            <Input
                              prefix={
                                <EnvironmentOutlined className="text-blue-500" />
                              }
                              placeholder="Nhập điểm đón..."
                              size="large"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="dropoffPlace"
                            label={<Text strong>Điểm kết thúc</Text>}
                            rules={[
                              { required: true, message: "Nhập điểm đến" },
                            ]}
                          >
                            <Input
                              prefix={
                                <EnvironmentOutlined className="text-red-500" />
                              }
                              placeholder="Nhập điểm đến..."
                              size="large"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="vehicleKm"
                            label={<Text strong>Số KM ước tính</Text>}
                          >
                            <Input
                              type="number"
                              suffix="km"
                              placeholder="0"
                              size="large"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="vehicleAmount"
                            label={<Text strong>Số tiền ước tính</Text>}
                          >
                            <Input
                              type="number"
                              prefix="₫"
                              placeholder="0"
                              size="large"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* ── Sub-form: Khách hàng ───────────────────────────────── */}
                  {grabSubType === "CUSTOMER" && (
                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                      {/* Badge chi nhánh */}
                      {userBrand && (
                        <div className="mb-4">
                          <Tag
                            color={userBrand === "TBD" ? "blue" : "purple"}
                            className="rounded-full px-3 py-0.5 text-xs"
                          >
                            Chi nhánh: {userBrand}
                          </Tag>
                        </div>
                      )}

                      <Row gutter={16}>
                        {/* Thông tin khách & RO */}
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="customerName"
                            label={<Text strong>Tên khách hàng</Text>}
                            rules={[
                              {
                                required: true,
                                message: "Nhập tên khách hàng",
                              },
                            ]}
                          >
                            <Input placeholder="Tên khách..." size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="roNumber"
                            label={<Text strong>Số RO (Dịch vụ)</Text>}
                            rules={[
                              {
                                required: true,
                                message: "Nhập Số RO (Dịch vụ)",
                              },
                            ]}
                          >
                            <Input placeholder="Nhập mã RO..." size="large" />
                          </Form.Item>
                        </Col>

                        {/* Điểm đi / đến */}
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="pickupPlace"
                            label={<Text strong>Điểm bắt đầu</Text>}
                            rules={[
                              { required: true, message: "Nhập điểm đón" },
                            ]}
                          >
                            <Input
                              prefix={
                                <EnvironmentOutlined className="text-blue-500" />
                              }
                              placeholder="Nhập điểm đón..."
                              size="large"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="dropoffPlace"
                            label={<Text strong>Điểm kết thúc</Text>}
                            rules={[
                              { required: true, message: "Nhập điểm đến" },
                            ]}
                          >
                            <Input
                              prefix={
                                <EnvironmentOutlined className="text-red-500" />
                              }
                              placeholder="Nhập điểm đến..."
                              size="large"
                            />
                          </Form.Item>
                        </Col>

                        {/* KM & tiền xe */}
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="vehicleKm"
                            label={<Text strong>Số KM ước tính</Text>}
                          >
                            <Input
                              type="number"
                              suffix="km"
                              placeholder="0"
                              size="large"
                            />
                          </Form.Item>
                        </Col>
                        {/* Ô số tiền xe */}
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="vehicleAmount"
                            label={<Text strong>Số tiền xe ước tính</Text>}
                          >
                            <InputNumber
                              prefix="₫"
                              placeholder="0"
                              size="large"
                              style={{ width: "100%" }}
                              formatter={(value) =>
                                value
                                  ? `${value}`.replace(
                                      /\B(?=(\d{3})+(?!\d))/g,
                                      ",",
                                    )
                                  : ""
                              }
                              // 🔹 Sửa parser: Chuyển chuỗi sau khi xóa dấu phẩy thành kiểu số (number)
                              parser={(value) =>
                                value ? Number(value.replace(/,/g, "")) : 0
                              }
                              onChange={handleAmountChange}
                            />
                          </Form.Item>
                        </Col>

                        {/* Ô số tiền RO */}
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="roAmount"
                            label={<Text strong>Số tiền RO</Text>}
                            rules={[
                              {
                                required: true,
                                message: "Nhập Số tiền RO",
                              },
                            ]}
                          >
                            <InputNumber
                              prefix="₫"
                              placeholder="0"
                              size="large"
                              style={{ width: "100%" }}
                              formatter={(value) =>
                                value
                                  ? `${value}`.replace(
                                      /\B(?=(\d{3})+(?!\d))/g,
                                      ",",
                                    )
                                  : ""
                              }
                              // 🔹 Sửa parser ở đây tương tự để xóa sạch lỗi TS
                              parser={(value) =>
                                value ? Number(value.replace(/,/g, "")) : 0
                              }
                              onChange={handleAmountChange}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <Space size={4}>
                                <Text strong>% tiền xe / RO</Text>
                                <Tooltip title="Tự động tính từ (Tiền xe / Tiền RO) × 100. Nếu > 5% sẽ tự động thêm ngoại lệ.">
                                  <InfoCircleOutlined className="text-gray-400 text-xs" />
                                </Tooltip>
                              </Space>
                            }
                          >
                            <div
                              className={`h-10 flex items-center px-3 rounded-md border text-sm font-medium ${
                                roPercent === null
                                  ? "bg-gray-50 text-gray-400 border-gray-200"
                                  : roPercent > EXCEPTION_THRESHOLD_PERCENT
                                    ? "bg-red-50 text-red-600 border-red-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                              }`}
                            >
                              {roPercent === null
                                ? "— Nhập tiền xe & tiền RO"
                                : `${roPercent.toFixed(2)}%`}
                            </div>
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Alert ngoại lệ tự động */}
                      {autoException && (
                        <Alert
                          type="warning"
                          showIcon
                          icon={<WarningOutlined />}
                          className="mb-4 rounded-lg"
                          message={
                            <span className="text-sm">
                              Tỷ lệ <strong>{roPercent?.toFixed(2)}%</strong>{" "}
                              vượt ngưỡng {EXCEPTION_THRESHOLD_PERCENT}% — ngoại
                              lệ được thêm tự động.
                            </span>
                          }
                        />
                      )}

                      {/* Toggle ngoại lệ thủ công */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          effectiveException
                            ? "bg-amber-50 border-amber-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <Space>
                          <WarningOutlined
                            className={
                              effectiveException
                                ? "text-amber-500"
                                : "text-gray-400"
                            }
                          />
                          <div>
                            <Text strong className="text-sm block">
                              Ngoại lệ
                            </Text>
                            <Text type="secondary" className="text-xs">
                              {userBrand
                                ? `Thêm giám đốc dịch vụ (Anh Sơn Lênh) (${userBrand})`
                                : "Thêm người ký bổ sung"}
                            </Text>
                          </div>
                        </Space>
                        <Switch
                          checked={effectiveException}
                          onChange={(checked) => {
                            // Chỉ cho tắt thủ công nếu không phải auto
                            if (autoException && !checked) {
                              message.info(
                                "Ngoại lệ tự động do tỷ lệ > 5%. Giảm số tiền để tắt.",
                              );
                              return;
                            }
                            setIsException(checked);
                          }}
                          className={effectiveException ? "bg-amber-500" : ""}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── LUỒNG PHÊ DUYỆT ─────────────────────────────────────── */}
              <Divider orientation="left">
                <Tag color="blue" className="rounded-full px-4">
                  Luồng phê duyệt
                </Tag>
              </Divider>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="signers"
                    label={
                      <Text strong>
                        {proposalType === "VEHICLE_GRAB"
                          ? "Kiểm duyệt"
                          : "Kiểm duyệt"}
                      </Text>
                    }
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
                        label: `${e.name}${
                          e.workInfo?.position?.name
                            ? ` (${e.workInfo.position.name})`
                            : ""
                        }`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="approvers"
                    label={
                      <Text strong>
                        {" "}
                        {proposalType === "VEHICLE_GRAB"
                          ? "Người thực hiện"
                          : "Phê duyệt"}
                      </Text>
                    }
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
                        label: `${e.name}${
                          e.position ? ` (${e.position})` : ""
                        }`,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* ── CỘT PHẢI: PREVIEW ───────────────────────────────────────────── */}
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
              ) : proposalType === "VEHICLE" ? (
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
              ) : (
                /* VEHICLE_GRAB preview: tóm tắt thông tin */
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag color={grabSubType === "PERSONAL" ? "blue" : "green"}>
                      {grabSubType === "PERSONAL" ? "Cá nhân" : "Khách hàng"}
                    </Tag>
                    {grabSubType === "CUSTOMER" && userBrand && (
                      <Tag color={userBrand === "TBD" ? "geekblue" : "purple"}>
                        {userBrand}
                      </Tag>
                    )}
                    {effectiveException && (
                      <Tag color="warning" icon={<WarningOutlined />}>
                        Ngoại lệ
                      </Tag>
                    )}
                  </div>

                  {grabSubType === "CUSTOMER" && roPercent !== null && (
                    <div
                      className={`p-3 rounded-lg text-center ${
                        roPercent > EXCEPTION_THRESHOLD_PERCENT
                          ? "bg-red-50 border border-red-200"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      <div
                        className={`text-2xl font-semibold ${
                          roPercent > EXCEPTION_THRESHOLD_PERCENT
                            ? "text-red-600"
                            : "text-green-700"
                        }`}
                      >
                        {roPercent.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Tỷ lệ tiền xe / RO
                      </div>
                    </div>
                  )}

                  {grabSubType === "CUSTOMER" && userBrand && (
                    <div className="text-xs space-y-2 bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-600 mb-1">
                        Luồng duyệt ({userBrand}):
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <span className="text-gray-400">Ký:</span>
                        {(effectiveException
                          ? BRANCH_APPROVER_CONFIG[userBrand]
                              .signerIdsWithException
                          : BRANCH_APPROVER_CONFIG[userBrand].signerIds
                        ).map((id) => (
                          <Tag key={id} color="blue" className="text-xs m-0">
                            #{id}
                          </Tag>
                        ))}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <span className="text-gray-400">Duyệt:</span>
                        {BRANCH_APPROVER_CONFIG[userBrand].approverIds.map(
                          (id) => (
                            <Tag key={id} color="green" className="text-xs m-0">
                              #{id}
                            </Tag>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {grabSubType === "PERSONAL" && (
                    <div className="text-xs bg-blue-50 p-3 rounded-lg text-blue-700">
                      Luồng duyệt giống xe nội bộ (theo manager)
                    </div>
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
