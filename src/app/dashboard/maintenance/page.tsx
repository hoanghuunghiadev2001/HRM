/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Switch,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function MaintenanceAdminPage() {
  const [form] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/maintenance");
    setData(await res.json());
  }

  async function submit(values: any) {
    const [start, end] = values.time;

    setLoading(true);
    await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        message: values.message,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      }),
    });

    message.success("Đã thêm lịch bảo trì");
    form.resetFields();
    setLoading(false);
    load();
  }

  async function toggle(id: number, value: boolean) {
    await fetch(`/api/maintenance/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: value }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      {/* FORM THÊM MỚI */}
      <Card title="Thêm lịch bảo trì">
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item name="title" label="Tiêu đề">
            <Input placeholder="Bảo trì hệ thống HRM" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung thông báo"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="time"
            label="Thời gian bảo trì"
            rules={[{ required: true }]}
          >
            <DatePicker.RangePicker showTime format="DD/MM/YYYY HH:mm" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Thêm mới
          </Button>
        </Form>
      </Card>

      {/* DANH SÁCH */}
      <Card title="Danh sách lịch bảo trì">
        <Table
          rowKey="id"
          dataSource={data}
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: "Nội dung",
              dataIndex: "message",
            },
            {
              title: "Thời gian",
              render: (_, r) =>
                `${dayjs(r.startTime).format("DD/MM HH:mm")} → ${dayjs(
                  r.endTime
                ).format("DD/MM HH:mm")}`,
            },
            {
              title: "Trạng thái",
              render: (_, r) => {
                const now = dayjs();
                if (!r.isActive) return <Tag color="default">Tắt</Tag>;
                if (now.isBefore(r.startTime))
                  return <Tag color="blue">Sắp tới</Tag>;
                if (now.isAfter(r.endTime))
                  return <Tag color="red">Hết hạn</Tag>;
                return <Tag color="green">Đang hiển thị</Tag>;
              },
            },
            {
              title: "Hiển thị",
              render: (_, r) => (
                <Switch
                  checked={r.isActive}
                  onChange={(v) => toggle(r.id, v)}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
