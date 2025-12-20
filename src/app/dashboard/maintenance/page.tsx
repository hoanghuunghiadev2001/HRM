/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MailEditor from "@/components/MailEditor";
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { RangePicker } = DatePicker;

export default function NotificationAdminPage() {
  const [form] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { modal } = App.useApp();
  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/notifications");
    setData(await res.json());
  }

  async function submit(values: any) {
    setLoading(true);

    const payload: any = {
      title: values.title,
      message: values.message,
      type: values.type,
      sendMail: values.sendMail ?? false,
      sendApp: true,
    };

    if (values.type === "MAINTENANCE") {
      const [start, end] = values.time;
      payload.startTime = start.toISOString();
      payload.endTime = end.toISOString();
    }
    if (values.sendMail) {
      payload.mailContent = values.mailContent;
    }

    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    message.success("Đã tạo thông báo");
    setOpen(false);
    form.resetFields();
    setLoading(false);
    load();
  }

  async function toggle(id: number, value: boolean) {
    await fetch(`/api/notifications/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: value }),
    });
    load();
  }

  function confirmDelete(record: any) {
    modal.confirm({
      title: "Xác nhận xóa thông báo",
      content: (
        <>
          <p>Bạn có chắc chắn muốn xóa thông báo này?</p>
          <p>
            <strong>{record.title || "Không có tiêu đề"}</strong>
          </p>
        </>
      ),
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => deleteItem(record.id),
    });
  }

  async function deleteItem(id: number) {
    try {
      setDeletingId(id);
      await fetch(`/api/notifications/${id}/toggle`, {
        method: "DELETE",
      });
      message.success("Đã xóa thông báo");
      load();
    } catch {
      message.error("Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Quản lý thông báo</h2>
        <Button type="primary" onClick={() => setOpen(true)}>
          ➕ Thêm thông báo
        </Button>
      </div>

      {/* LIST */}
      <Card>
        <Table
          rowKey="id"
          dataSource={data}
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: "Loại",
              dataIndex: "type",
              render: (v) => <Tag>{v}</Tag>,
            },
            {
              title: "Nội dung",
              dataIndex: "message",
              ellipsis: true,
            },
            {
              title: "Thời gian",
              render: (_, r) =>
                r.startTime && r.endTime
                  ? `${dayjs(r.startTime).format("DD/MM HH:mm")} → ${dayjs(
                      r.endTime
                    ).format("DD/MM HH:mm")}`
                  : "-",
            },
            {
              title: "Trạng thái",
              render: (_, r) => {
                const now = dayjs();

                if (!r.isActive) return <Tag>Tắt</Tag>;
                if (r.startTime && now.isBefore(r.startTime))
                  return <Tag color="blue">Sắp tới</Tag>;
                if (r.endTime && now.isAfter(r.endTime))
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
            {
              title: "Hành động",
              width: 120,
              render: (_, r) => (
                <Button
                  danger
                  size="small"
                  loading={deletingId === r.id}
                  onClick={() => confirmDelete(r)}
                >
                  🗑️ Xóa
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {/* MODAL CREATE */}
      <Modal
        title="Tạo thông báo mới"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={loading}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          initialValues={{
            type: "SYSTEM",
            sendMail: false,
          }}
        >
          <Form.Item
            name="type"
            label="Loại thông báo"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "MAINTENANCE", label: "Bảo trì hệ thống" },
                { value: "SYSTEM", label: "Thông báo hệ thống" },
                { value: "HR", label: "Thông báo nhân sự" },
                { value: "SECURITY", label: "Bảo mật" },
                { value: "FEATURE", label: "Tính năng mới" },
              ]}
            />
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề">
            <Input />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          {/* Thời gian chỉ cho Maintenance */}
          <Form.Item shouldUpdate={(p, c) => p.type !== c.type}>
            {({ getFieldValue }) =>
              getFieldValue("type") === "MAINTENANCE" ? (
                <Form.Item
                  name="time"
                  label="Thời gian bảo trì"
                  rules={[{ required: true }]}
                >
                  <RangePicker showTime format="DD/MM/YYYY HH:mm" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="sendMail"
            label="Gửi email thông báo"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item dependencies={["sendMail"]}>
            {({ getFieldValue }) =>
              getFieldValue("sendMail") ? (
                <Form.Item
                  name="mailContent"
                  label="Nội dung email"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung email" },
                  ]}
                  getValueFromEvent={(content) => content}
                >
                  <MailEditor />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
