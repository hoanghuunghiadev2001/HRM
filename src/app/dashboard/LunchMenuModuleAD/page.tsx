/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Card,
  Typography,
  message,
  DatePicker,
  Tag,
  Popconfirm,
  InputNumber,
  Divider,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CoffeeOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Cấu hình dayjs
dayjs.extend(weekOfYear);
dayjs.extend(customParseFormat);

const { Title, Text } = Typography;

export default function AdminLunchPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  // State quản lý thời gian đang xem
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const currentWeek = selectedDate.week();
  const currentYear = selectedDate.year();

  const [form] = Form.useForm();

  // 1. Hàm lấy dữ liệu từ API
  const fetchMenus = async (week: number, year: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lunch-menu?week=${week}&year=${year}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      message.error("Không thể tải dữ liệu thực đơn");
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetch khi mount hoặc khi đổi tuần
  useEffect(() => {
    fetchMenus(currentWeek, currentYear);
  }, [currentWeek, currentYear]);

  // 2. Xử lý Thêm/Sửa
  const onFinish = async (values: any) => {
    const url = editingRecord
      ? `/api/lunch-menu/${editingRecord.id}`
      : "/api/lunch-menu";
    const method = editingRecord ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          weekNumber: currentWeek,
          year: currentYear,
        }),
      });

      if (res.ok) {
        message.success(
          editingRecord ? "Cập nhật thành công" : "Đã thêm thực đơn mới"
        );
        setIsModalOpen(false);
        fetchMenus(currentWeek, currentYear);
      }
    } catch (e) {
      message.error("Lỗi hệ thống");
    }
  };

  // 3. Xử lý Xóa
  const handleDelete = async (id: number) => {
    await fetch(`/api/lunch-menu/${id}`, { method: "DELETE" });
    message.success("Đã xóa bản ghi");
    fetchMenus(currentWeek, currentYear);
  };

  // 4. Cấu hình bảng
  const columns = [
    {
      title: "Thứ",
      dataIndex: "dayOfWeek",
      key: "dayOfWeek",
      width: 120,
      render: (text: string) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Thực đơn món chính",
      key: "main",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>
            <Text type="danger" strong>
              Mặn:
            </Text>{" "}
            {record.salty}
          </Text>
          <Text>
            <Text type="success" strong>
              Chay:
            </Text>{" "}
            {record.vegetarian}
          </Text>
        </Space>
      ),
    },
    {
      title: "Món kèm",
      key: "side",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>
            <Text type="warning" strong>
              Xào:
            </Text>{" "}
            {record.stir}
          </Text>
          <Text>
            <Text type="secondary" strong>
              Canh:
            </Text>{" "}
            {record.soup}
          </Text>
        </Space>
      ),
    },
    {
      title: "Tráng miệng",
      dataIndex: "dessert",
      key: "dessert",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 110,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1677ff" }} />}
            onClick={() => {
              setEditingRecord(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="Chắc chắn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* HEADER SECTION */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <CoffeeOutlined style={{ marginRight: 12, color: "#e11d48" }} />
            Quản lý thực đơn ăn trưa
          </Title>
          <Text type="secondary">
            Quản lý và điều chỉnh danh sách món ăn hàng tuần cho nhân viên
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          style={{ background: "#e11d48", borderRadius: 8 }}
          onClick={() => {
            setEditingRecord(null);
            form.resetFields();
            // Gợi ý thứ dựa trên số lượng đã có
            const nextDay =
              data.length < 5
                ? `Thứ ${data.length + 2}`
                : `Thứ ${data.length + 2}`;
            form.setFieldsValue({ dayOfWeek: nextDay });
            setIsModalOpen(true);
          }}
        >
          Nhập món mới
        </Button>
      </div>

      {/* FILTER & STATS SECTION */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card variant="outlined" styles={{ body: { padding: "16px" } }}>
            <Space size="large">
              <Space direction="vertical" size={0}>
                <Text type="secondary">Chọn thời gian tra cứu:</Text>
                <DatePicker
                  picker="week"
                  value={selectedDate}
                  allowClear={false}
                  onChange={(date) => date && setSelectedDate(date)}
                  format="Tuần ww - YYYY"
                />
              </Space>

              <Divider type="vertical" style={{ height: "40px" }} />

              <Space>
                <Button
                  icon={<LeftOutlined />}
                  onClick={() =>
                    setSelectedDate(selectedDate.subtract(1, "week"))
                  }
                />
                <div style={{ textAlign: "center", minWidth: "100px" }}>
                  <Text strong>Tuần {currentWeek}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Năm {currentYear}
                  </Text>
                </div>
                <Button
                  icon={<RightOutlined />}
                  onClick={() => setSelectedDate(selectedDate.add(1, "week"))}
                />
              </Space>

              <Button
                icon={<SearchOutlined />}
                type="dashed"
                onClick={() => fetchMenus(currentWeek, currentYear)}
              >
                Làm mới
              </Button>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="outlined" styles={{ body: { padding: "16px" } }}>
            <Statistic
              title="Số ngày đã nhập"
              value={data.length}
              suffix="/ 6 ngày"
              valueStyle={{ color: data.length >= 5 ? "#3f8600" : "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* TABLE SECTION */}
      <Card styles={{ body: { padding: 0 } }} variant="outlined">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: `Chưa có dữ liệu cho Tuần ${currentWeek}` }}
        />
      </Card>

      {/* MODAL FORM */}
      <Modal
        title={
          editingRecord
            ? "Cập nhật món ăn"
            : `Nhập món mới cho Tuần ${currentWeek}`
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
        destroyOnClose
        okText="Lưu dữ liệu"
        cancelText="Bỏ qua"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20 }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dayOfWeek"
                label="Ngày trong tuần"
                rules={[{ required: true }]}
              >
                <Input placeholder="Thứ 2" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Tuần">
                <InputNumber
                  value={currentWeek}
                  disabled
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Năm">
                <InputNumber
                  value={currentYear}
                  disabled
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" plain>
            <Text type="secondary">Chi tiết mâm cơm</Text>
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="salty"
                label="Món mặn"
                rules={[{ required: true }]}
              >
                <Input placeholder="VD: Sườn kho" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vegetarian"
                label="Món chay"
                rules={[{ required: true }]}
              >
                <Input placeholder="VD: Nấm kho" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stir"
                label="Món xào"
                rules={[{ required: true }]}
              >
                <Input placeholder="VD: Rau muống xào" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="soup"
                label="Món canh"
                rules={[{ required: true }]}
              >
                <Input placeholder="VD: Canh rau dền" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dessert" label="Tráng miệng">
            <Input placeholder="VD: Dưa hấu, Chè đậu..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
