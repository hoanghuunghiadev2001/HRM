/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal, Form, Input, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";

interface KPI {
  id: number;
  name: string;
  createdAt: string;
  employeeCount: number;
}

export default function KPIList() {
  const [data, setData] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/kpi");
      if (!res.ok) throw new Error("Lấy danh sách KPI thất bại");
      const result = await res.json();
      setData(result);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  // Xử lý tạo KPI mới
  const onCreateKPI = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        createdAt: values.createdAt.format("YYYY-MM-DD"),
      };

      const res = await fetch("/api/kpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Tạo KPI thất bại");
      message.success("Tạo KPI thành công");
      setModalVisible(false);
      form.resetFields();
      fetchKPIs(); // tải lại danh sách KPI
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const columns: ColumnsType<KPI> = [
    {
      title: "Tên KPI",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tháng/Năm tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
        });
      },
    },
    {
      title: "Số lượng nhân viên",
      dataIndex: "employeeCount",
      key: "employeeCount",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => alert(`Xem chi tiết KPI ${record.name}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => setModalVisible(true)}
      >
        Tạo KPI mới
      </Button>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title="Tạo KPI mới"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onCreateKPI}>
          <Form.Item
            name="name"
            label="Tên KPI"
            rules={[{ required: true, message: "Vui lòng nhập tên KPI" }]}
          >
            <Input placeholder="Ví dụ: KPI Doanh thu quý 2" />
          </Form.Item>

          <Form.Item
            name="createdAt"
            label="Tháng/Năm tạo"
            rules={[{ required: true, message: "Vui lòng chọn tháng và năm" }]}
          >
            <DatePicker
              picker="month"
              style={{ width: "100%" }}
              format="MM/YYYY"
              placeholder="Chọn tháng/năm"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo KPI
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
