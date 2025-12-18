"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  message,
  Input,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface CompensatoryItem {
  employeeId: number;
  employeeCode: string;
  name: string;
  departmentName: string;
  attendanceDate: string;
  workingHours: number;
}

export default function CompensatoryLeavePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompensatoryItem[]>([]);
  const [sunday, setSunday] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [department, setDepartment] = useState<string | undefined>();
  const departments = Array.from(new Set(data.map((i) => i.departmentName)));

  const filteredData = data.filter((item) => {
    const matchName =
      item.name.toLowerCase().includes(keyword.toLowerCase()) ||
      item.employeeCode.toLowerCase().includes(keyword.toLowerCase());

    const matchDept = department ? item.departmentName === department : true;

    return matchName && matchDept;
  });
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/compensatory-leave", {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        message.error(json.message || "Không thể lấy dữ liệu");
        return;
      }

      setData(json.data || []);
      setSunday(json.sunday);
    } catch {
      message.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ⭐ FIX TYPE Ở ĐÂY
  const columns: ColumnsType<CompensatoryItem> = [
    {
      title: "Mã NV",
      dataIndex: "employeeCode",
      key: "employeeCode",
    },
    {
      title: "Tên nhân viên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phòng ban",
      dataIndex: "departmentName",
      key: "departmentName",
    },
    {
      title: "Ngày làm CN",
      dataIndex: "attendanceDate",
      key: "attendanceDate",
      render: (v) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Số giờ",
      dataIndex: "workingHours",
      key: "workingHours",
      align: "center", // ✅ giờ TS OK
      render: (v) => <Tag color={v >= 8 ? "green" : "orange"}>{v}h</Tag>,
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center", // ✅ OK
      render: () => <Tag color="blue">Được nghỉ bù</Tag>,
    },
  ];

  return (
    <Card>
      <Space
        style={{ width: "100%", justifyContent: "space-between" }}
        align="center"
      >
        <div>
          <Title level={4}>Danh sách nghỉ bù</Title>
          {sunday && (
            <Text type="secondary">
              Chủ nhật kiểm tra:{" "}
              <strong>{dayjs(sunday).format("DD/MM/YYYY")}</strong>
            </Text>
          )}
        </div>

        <Button onClick={fetchData} loading={loading} type="primary">
          Kiểm tra lại
        </Button>
      </Space>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Tìm theo tên hoặc mã NV"
          allowClear
          style={{ width: 260 }}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <Select
          allowClear
          placeholder="Phòng ban"
          style={{ width: 220 }}
          onChange={(v) => setDepartment(v)}
        >
          {departments.map((dept) => (
            <Select.Option key={dept} value={dept}>
              {dept}
            </Select.Option>
          ))}
        </Select>

        <Tag color="green">Tổng: {filteredData.length}</Tag>
      </Space>

      <Table<CompensatoryItem>
        rowKey="employeeId"
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        bordered
      />
    </Card>
  );
}
