/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Table, Switch, Button, message, Typography, Spin } from "antd";

message.config({
  top: 80,
  duration: 3,
});

const { Title } = Typography;

type Employee = {
  id: number;
  employeeCode: string;
  name: string;
  isActive: boolean;
  department: string | null;
  position: string | null;
};

export default function EmployeeList() {
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const messError = () => {
    messageApi.open({
      type: "error",
      content: "Nhân viên chưa có thông tin email.",
    });
  };

  useEffect(() => {
    fetchEmployees(isActiveFilter);
  }, [isActiveFilter]);

  async function fetchEmployees(active: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/user?isActive=${active}`);
      if (!res.ok) throw new Error("Lấy danh sách nhân viên thất bại");
      const data: Employee[] = await res.json();
      setEmployees(data);
    } catch (error: any) {
      const msg =
        error?.message ||
        (typeof error === "string"
          ? error
          : "Lấy danh sách nhân viên thất bại");
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(empId: number, currentActive: boolean) {
    setLoadingId(empId);
    try {
      const res = await fetch(`/api/user/activeUser`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: empId, isActive: !currentActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Tạo một lỗi mới, đính kèm cả message và status từ response
        const error = new Error(data.message || "Cập nhật thất bại");
        console.log(data.status);
        if (data.status === 2) {
          messError();
        }
        throw error;
      }
      message.success("Cập nhật thành công");
      fetchEmployees(isActiveFilter);
      console.log(res.status);
    } catch (error: any) {
      const msg =
        error?.message ||
        (typeof error === "string" ? error : "Cập nhật thất bại");
      message.error(msg);
    } finally {
      setLoadingId(null);
    }
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Mã nhân viên",
      dataIndex: "employeeCode",
      key: "employeeCode",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Bộ phận",
      dataIndex: "department",
      key: "department",
      render: (text: string | null) => text || "-",
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      render: (text: string | null) => text || "-",
    },
    {
      title: "Kích hoạt",
      dataIndex: "isActive",
      key: "isActive",
      render: (_: any, record: Employee) => (
        <Switch
          checked={record.isActive}
          onChange={() => toggleActive(record.id, record.isActive)}
          loading={loadingId === record.id}
        />
      ),
      width: 100,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <div className="flex justify-between items-center">
        <Title level={2}>Danh sách nhân viên</Title>
        <Button
          style={{ marginBottom: 16 }}
          onClick={() => setIsActiveFilter((prev) => !prev)}
        >
          Hiển thị nhân viên{" "}
          {isActiveFilter ? "chưa kích hoạt" : "đã kích hoạt"}
        </Button>
      </div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={employees}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
}
