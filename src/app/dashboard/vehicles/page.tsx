/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, message } from "antd";
import type { ColumnsType } from "antd/es/table";

type Vehicle = {
  id: number;
  code: string;
  name: string;
  plateNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form] = Form.useForm();

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch (err) {
      message.error("Lấy danh sách xe thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      form.setFieldsValue(vehicle);
    } else {
      setEditingVehicle(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Xác nhận xóa xe",
      content: "Bạn có chắc muốn xóa xe này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await fetch(`/api/vehicles?id=${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            message.success("Xóa thành công");
            fetchVehicles();
          } else {
            const error = await res.json();
            message.error(error.message || "Xóa thất bại");
          }
        } catch (err) {
          message.error("Xóa thất bại");
        }
      },
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const method = editingVehicle ? "PUT" : "POST";
      const body = editingVehicle
        ? { ...values, id: editingVehicle.id }
        : values;

      const res = await fetch("/api/vehicles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        message.success(
          editingVehicle ? "Cập nhật thành công" : "Thêm xe thành công"
        );
        setIsModalOpen(false);
        fetchVehicles();
      } else {
        const error = await res.json();
        message.error(error.message || "Lỗi");
      }
    } catch (err) {
      // validation failed
    }
  };

  const columns: ColumnsType<Vehicle> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Mã xe",
      dataIndex: "code",
    },
    {
      title: "Tên xe",
      dataIndex: "name",
    },
    {
      title: "Biển số",
      dataIndex: "plateNumber",
      render: (text) => text || "-",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => openModal(record)}>
            Sửa
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Quản lý Xe</h1>
      <Button type="primary" className="mb-4" onClick={() => openModal()}>
        Thêm xe
      </Button>
      <Table
        dataSource={vehicles}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
      />

      <Modal
        title={editingVehicle ? "Cập nhật xe" : "Thêm xe"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText={editingVehicle ? "Cập nhật" : "Thêm"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã xe"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập mã xe" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tên xe"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên xe" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Biển số" name="plateNumber">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
