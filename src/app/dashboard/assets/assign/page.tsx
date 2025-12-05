/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  message,
  Modal,
  InputNumber,
  Avatar,
  Tag,
  Space,
  Spin,
} from "antd";

const { Search } = Input;

export default function AssetAssignPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [assets, setAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [assignData, setAssignData] = useState<Record<number, number>>({});
  const [assignLoading, setAssignLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // ==========================
  // 🔹 Lấy danh sách nhân viên
  // ==========================
  const fetchEmployees = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoadingEmployees(true);
      const params = new URLSearchParams({
        workStatus: "true",
        name: searchName,
        employeeCode: searchCode,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      const res = await fetch(`/api/employees/summary?${params.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      setEmployees(json.data || []);
      setTotalEmployees(json.total || 0);
    } catch (error) {
      message.error("Không tải được danh sách nhân viên");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees(page, pageSize);
  }, [page, pageSize]);

  // ==========================
  // 🔹 Lấy danh sách tài sản
  // ==========================
  const fetchAssets = async () => {
    try {
      setLoadingAssets(true);
      const res = await fetch(`/api/assets`, { credentials: "include" });
      const json = await res.json();
      setAssets(json.assets || []);
    } catch (error) {
      message.error("Không tải được danh sách tài sản");
    } finally {
      setLoadingAssets(false);
    }
  };

  // ==========================
  // 🔹 Mở modal cấp tài sản
  // ==========================
  const openAssignModal = async (employee: any) => {
    setSelectedEmployee(employee);
    setOpenModal(true);
    setLoadingAssets(true);

    try {
      // 1️⃣ Lấy danh sách tài sản
      const res = await fetch(`/api/assets`, { credentials: "include" });
      const assetJson = await res.json();
      setAssets(assetJson.assets || []);

      // 2️⃣ Lấy số lượng tài sản đã cấp cho nhân viên
      const assignedRes = await fetch(
        `/api/assets/by-employee?employeeId=${employee.id}`,
        { credentials: "include" }
      );
      const assignedJson = await assignedRes.json(); // [{assetId, quantity, ...}]

      // 3️⃣ Khởi tạo assignData
      const assignedData: Record<number, number> = {};
      assetJson.assets.forEach((a: any) => {
        const assigned = assignedJson.assets.find(
          (x: any) => x.assetId === a.id
        );
        assignedData[a.id] = assigned ? assigned.quantity : 0;
      });
      setAssignData(assignedData);
    } catch (err) {
      message.error("Không tải được dữ liệu tài sản");
    } finally {
      setLoadingAssets(false);
    }
  };

  // ==========================
  // 🔹 Cập nhật số lượng nhập
  // ==========================
  const updateQuantity = (assetId: number, value: number) => {
    setAssignData((prev) => ({
      ...prev,
      [assetId]: value,
    }));
  };

  // ==========================
  // 🔹 Gửi API cấp tài sản
  // ==========================
  const handleAssign = async () => {
    if (!selectedEmployee) return;

    try {
      setAssignLoading(true);
      const items = Object.keys(assignData).map((assetId) => ({
        assetId: Number(assetId),
        employeeId: selectedEmployee.id,
        quantity: assignData[Number(assetId)],
        note: "",
      }));

      for (const item of items) {
        await fetch(`/api/assets/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(item),
        });
      }

      message.success("Cấp tài sản thành công");
      setOpenModal(false);
      fetchEmployees(page, pageSize);
    } catch (error) {
      message.error("Lỗi cấp tài sản");
    } finally {
      setAssignLoading(false);
    }
  };

  // ==========================
  // 🔹 Cột bảng nhân viên
  // ==========================
  const employeeColumns = [
    { title: "Mã NV", dataIndex: "employeeCode" },
    { title: "Tên nhân viên", dataIndex: "name" },
    {
      title: "Phòng ban",
      render: (record: any) =>
        record.workInfo?.department?.name || <Tag>Chưa có</Tag>,
    },
    {
      title: "Chức vụ",
      render: (record: any) =>
        record.workInfo?.position?.name || <Tag>Chưa có</Tag>,
    },
    {
      title: "Hành động",
      render: (employee: any) => (
        <Button type="primary" onClick={() => openAssignModal(employee)}>
          Cấp tài sản
        </Button>
      ),
    },
  ];

  // ==========================
  // 🔹 Cột bảng tài sản trong modal
  // ==========================
  const assetColumns = [
    { title: "Tên tài sản", dataIndex: "name" },
    { title: "Đơn vị", dataIndex: "unit" },
    {
      title: "Số lượng cấp",
      render: (record: any) => (
        <InputNumber
          min={0}
          max={record.assignments?.quantity || 1000}
          value={assignData[record.id] || 0}
          onChange={(val) => updateQuantity(record.id, val || 0)}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card title="Cấp tài sản cho nhân viên">
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Input
            placeholder="Tìm theo Mã NV"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            style={{ width: 150 }}
            allowClear
          />
          <Button
            type="primary"
            onClick={() => {
              setPage(1);
              fetchEmployees(1, pageSize);
            }}
          >
            Tìm
          </Button>
        </Space>

        <Table
          rowKey="id"
          columns={employeeColumns}
          dataSource={employees}
          loading={loadingEmployees}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalEmployees,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      {/* Modal cấp tài sản */}
      <Modal
        title="Cấp tài sản"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleAssign}
        confirmLoading={assignLoading}
        width={800}
      >
        {selectedEmployee && (
          <Card>
            <Space align="center">
              <Avatar size={60} src={selectedEmployee.avatar} />
              <div>
                <div>
                  <b>{selectedEmployee.name}</b>
                </div>
                <div>Mã NV: {selectedEmployee.employeeCode}</div>
              </div>
            </Space>
          </Card>
        )}

        <div className="mt-4">
          {loadingAssets ? (
            <Spin />
          ) : (
            <Table
              rowKey="id"
              columns={assetColumns}
              dataSource={assets}
              size="small"
              pagination={false}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
