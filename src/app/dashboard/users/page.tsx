/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  Switch,
  Button,
  message,
  Typography,
  Spin,
  Dropdown,
  Modal,
} from "antd";
import { MenuProps } from "antd/lib";
import { DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { ListCollapse } from "lucide-react";
import { deleteEmployeeApi } from "@/lib/api";
import ModalLoading from "@/components/modalLoading";

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

  const countDownDelete = () => {
    let secondsToGo = 3;

    const instance = Modal.success({
      title: "Xóa nhân sự thành công",
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  const handleDeleteEmployee = async (employeeCode: string) => {
    setLoading(true);
    const res = await deleteEmployeeApi(employeeCode);
    if (res.status === 1) {
      countDownDelete();
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

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
    }
  }

  async function resetPassword(employeeCode: string) {
    try {
      const res = await fetch("/api/user/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeCode }),
      });
      if (res.ok) {
        messageApi.open({
          type: "success",
          content: "Reset mật khẩu thành công!.",
        });
      }
      const data = await res.json();

      if (!res.ok) {
        messageApi.open({
          type: "error",
          content: "Reset mật khẩu thất bại.",
        });
        throw new Error(data.error || "Reset failed");
      }
    } catch (error: any) {
      messageApi.open({
        type: "error",
        content: "Reset mật khẩu thất bại.",
      });
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
      title: "Tùy chọn",
      key: "action",
      width: "100px",
      render: (_: any, record: Employee) => {
        // Tạo items menu với callback có thể dùng record
        const items: MenuProps["items"] = [
          {
            key: "1",
            label: "Reset mật khẩu",
            icon: <InfoCircleOutlined />,
            onClick: () => resetPassword(record.employeeCode), // Giả sử bạn tạo state để lưu nhân viên đang thao tác,
          },
          {
            key: "2",
            label: "Xóa nhân sự",
            icon: <DeleteOutlined />,
            onClick: () => handleDeleteEmployee(record.employeeCode), // Giả sử bạn tạo state để lưu nhân viên đang thao tác,
          },
          {
            key: "3",
            label: "Tắt hoạt động",
            icon: <DeleteOutlined />,
            onClick: () => toggleActive(record.id, record.isActive), // Giả sử bạn tạo state để lưu nhân viên đang thao tác,
          },
        ];

        return (
          <Dropdown menu={{ items }}>
            <div
              className="flex items-center gap-3 cursor-pointer justify-center"
              onClick={(e) => e.preventDefault()}
            >
              <ListCollapse className="text-blue-500" />
            </div>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <ModalLoading isOpen={loading} />
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

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
