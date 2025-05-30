/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Space,
  Typography,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { fetchEmployeeSummary, getUserFromLocalStorage } from "./api";
import axios from "axios";

interface Employee {
  idKPI: number;
  name: string;
  id: string;
  employeeCode: string;
}
interface Detail {
  idKPI: number;
  employee: Employee;
  targetRevenue: number;
  targetVehicleCount: number;
}
interface KpiDetailModalPageProps {
  show: boolean;
  dismis: () => void;
  idKPI: number;
}

export default function KpiDetailModalPage({
  dismis,
  idKPI,
  show,
}: KpiDetailModalPageProps) {
  const [recordName, setRecordName] = useState<string>("");
  const [recordPeriod, setRecordPeriod] = useState<string>("");
  const [details, setDetails] = useState<Detail[]>([]);
  const [emps, setEmps] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const localUser = getUserFromLocalStorage();
  const [idEmployeesAdded, setIdEmployeesAdded] = useState<string[]>([]);

  //danh sách nhân viên
  const getEmployeeSumary = async () => {
    setLoading(true);
    try {
      const res = await fetchEmployeeSummary({
        role: localUser.role,

        page: undefined,
        pageSize: undefined,
      });
      setEmps(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi:", err);
      setLoading(false);
    }
  };

  // Load detail + employee list
  const fetchDetail = async () => {
    setLoading(true);
    const res = await fetch(`/api/kpis/${idKPI}`);
    if (res.ok) {
      const data = await res.json();
      setRecordName(data.name);
      setRecordPeriod(data.period);
      setDetails(data.employees);

      // Set employeeIds mặc định
      setIdEmployeesAdded(data.employees.map((item: any) => item.id));
    } else {
      message.error("Tải detail thất bại");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (show) {
      fetchDetail();
      getEmployeeSumary();
      form.resetFields(); // Reset form mỗi lần mở
    }
  }, [idKPI, show]);

  // Thêm nhân viên
  const onAdd = async (vals: any) => {
    try {
      await fetch(`/api/kpis/${idKPI}/add-employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vals),
      });
      message.success("Đã thêm");
      form.resetFields();
      fetchDetail();
    } catch {
      message.error("Lỗi thêm");
    }
  };
  // Cập nhật target
  const onSave = async (rec: Detail) => {
    await fetch(`/api/kpis/${idKPI}/update-target`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetId: rec.idKPI,
        targetRevenue: rec.targetRevenue,
        targetVehicleCount: rec.targetVehicleCount,
      }),
    });
    message.success("Đã cập nhật");
    fetchDetail();
  };
  // Xóa nhân viên
  const onRemove = async (empId: number) => {
    await fetch(`/api/kpis/${idKPI}/delete-employee`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: empId }),
    });
    message.success("Đã xóa");
    fetchDetail();
  };

  const handleUpdate = async (record: any) => {
    // updateKPIEmployee.ts
    console.log(record);

    const res = await fetch(`/api/kpis/${idKPI}/update-employee`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: record.id,
        targetRevenue: record.targetRevenue,
        achievedRevenue: record.achievedRevenue,
        targetVehicleCount: record.targetVehicleCount,
        achievedVehicleCount: record.achievedVehicleCount,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to update KPI employee");
    }

    return res.json();
  };

  // Cập nhật giá trị của một trường trong details
  const handleFieldChange = (idKPI: number, field: string, value: number) => {
    setDetails((prevDetails) =>
      prevDetails.map((item) =>
        item.idKPI === idKPI ? { ...item, [field]: value } : item
      )
    );
  };

  const columns = [
    {
      title: "Tên nhân viên",
      dataIndex: ["name"],
      key: "employeeName",
      fixed: "left" as const,
    },
    {
      title: "Chỉ tiêu Doanh thu",
      dataIndex: "targetRevenue",
      key: "targetRevenue",
      render: (text: number, record: any) => (
        <InputNumber
          min={0}
          defaultValue={record.targetRevenue}
          onChange={(value) =>
            handleFieldChange(record.idKPI, "targetRevenue", value || 0)
          }
        />
      ),
    },
    {
      title: "Doanh thu đạt",
      dataIndex: "achievedRevenue",
      key: "achievedRevenue",
      render: (text: number, record: any) => (
        <InputNumber
          min={0}
          defaultValue={record.achievedRevenue}
          onChange={(value) =>
            handleFieldChange(record.idKPI, "achievedRevenue", value || 0)
          }
        />
      ),
    },
    {
      title: "Chỉ tiêu Lượt xe",
      dataIndex: "targetVehicleCount",
      key: "targetVehicleCount",
      render: (text: number, record: any) => (
        <InputNumber
          min={0}
          defaultValue={record.targetVehicleCount}
          onChange={(value) =>
            handleFieldChange(record.idKPI, "targetVehicleCount", value || 0)
          }
        />
      ),
    },
    {
      title: "Lượt xe đạt",
      dataIndex: "achievedVehicleCount",
      key: "achievedVehicleCount",
      render: (text: number, record: any) => (
        <InputNumber
          min={0}
          defaultValue={record.achievedVehicleCount}
          onChange={(value) =>
            handleFieldChange(record.idKPI, "achievedVehicleCount", value || 0)
          }
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button onClick={() => handleUpdate(record)}>Cập nhật</Button>

          <Button color="danger">
            <Popconfirm
              className="h-full flex items-center"
              title="Xóa nhân viên này khỏi KPI?"
              onConfirm={() => onRemove(record.id)}
            >
              <a>Xóa</a>
            </Popconfirm>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={`KPI: ${recordName} — ${recordPeriod}`}
      open={show}
      width={"80vw"}
      onCancel={dismis}
      footer={null}
    >
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => form.submit()}>
          Thêm nhân viên
        </Button>
      </Space>

      <Table
        key={""}
        dataSource={details}
        columns={columns}
        loading={loading}
        rowKey={(rec) => rec.idKPI}
        scroll={{ x: 700 }}
        pagination={false}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onAdd}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="employeeIds"
          label="Chọn nhân viên"
          rules={[{ required: true, message: "Chọn nhân viên" }]}
        >
          <Select
            showSearch
            placeholder="Chọn..."
            mode="multiple"
            allowClear
            options={emps.map((e, i) => ({
              key: i + "select-employee",
              label: e.name + "-" + e.employeeCode,
              value: e.id,
              disabled: idEmployeesAdded.includes(e.id),
            }))}
          />
        </Form.Item>
        <Form.Item
          name="targetRevenue"
          label="Target Doanh thu"
          initialValue={0}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
        <Form.Item
          name="targetVehicleCount"
          label="Target Lượt xe"
          initialValue={0}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
