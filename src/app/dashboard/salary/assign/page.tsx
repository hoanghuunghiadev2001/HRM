/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Tag,
  Select,
  Modal,
  Transfer,
  message,
  Tooltip,
  Badge,
  Typography,
  Space,
  Card,
  Popconfirm,
  Spin,
  Input,
  Avatar,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  SwapOutlined,
  UserSwitchOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface EmployeeInfo {
  id: number;
  employeeCode: string;
  name: string;
  role: string;
  managerId?: number | null;
  department?: string | null;
  position?: string | null;
}

interface ManagerGroup {
  manager: EmployeeInfo;
  subordinates: EmployeeInfo[];
}

interface ApiData {
  managers: ManagerGroup[];
  unassigned: EmployeeInfo[];
  allEmployees: EmployeeInfo[];
}

export default function ManagerAssignPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<EmployeeInfo | null>(
    null,
  );
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [promoteModal, setPromoteModal] = useState<{
    open: boolean;
    employee: EmployeeInfo | null;
  }>({ open: false, employee: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/salary/manager/assign");
      if (!res.ok) throw new Error("Lỗi tải dữ liệu");
      const json: ApiData = await res.json();
      setData(json);
    } catch {
      message.error("Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAssignModal = (mgr: EmployeeInfo) => {
    setSelectedManager(mgr);
    const current = data?.managers.find((m) => m.manager.id === mgr.id);
    setTargetKeys(current?.subordinates.map((s) => String(s.id)) || []);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedManager) return;
    setSaving(true);
    try {
      // 1. Gán những nhân viên mới vào manager
      const res = await fetch("/api/salary/manager/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerId: selectedManager.id,
          employeeIds: targetKeys.map(Number),
        }),
      });

      if (!res.ok) throw new Error("Lỗi lưu");

      // 2. Gỡ những nhân viên đã bị xóa khỏi danh sách của manager này
      const current = data?.managers.find(
        (m) => m.manager.id === selectedManager.id,
      );
      const removedIds = (current?.subordinates || [])
        .map((s) => s.id)
        .filter((id) => !targetKeys.includes(String(id)));

      if (removedIds.length > 0) {
        await fetch("/api/salary/manager/assign", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeIds: removedIds }),
        });
      }

      message.success("Cập nhật thành công!");
      setModalOpen(false);
      await fetchData();
    } catch {
      message.error("Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  const handleSetManager = async (emp: EmployeeInfo, makeManager: boolean) => {
    try {
      const res = await fetch("/api/salary/manager/assign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: emp.id,
          setAsManager: makeManager,
        }),
      });
      if (!res.ok) throw new Error();
      message.success(
        makeManager
          ? `Đã nâng ${emp.name} lên Quản lý`
          : `Đã hạ ${emp.name} xuống Nhân viên`,
      );
      await fetchData();
    } catch {
      message.error("Thao tác thất bại");
    } finally {
      setPromoteModal({ open: false, employee: null });
    }
  };

  const handleRemoveSubordinate = async (employeeId: number) => {
    try {
      const res = await fetch("/api/salary/manager/assign", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeIds: [employeeId] }),
      });
      if (!res.ok) throw new Error();
      message.success("Đã gỡ khỏi quản lý");
      await fetchData();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  // Transfer data source: chỉ USER, không phải manager đang chọn
  const transferDataSource = (data?.allEmployees || [])
    .filter((e) => e.role === "USER" && e.id !== selectedManager?.id)
    .map((e) => ({
      key: String(e.id),
      title: `${e.employeeCode} - ${e.name}`,
      description: `${e.department || ""} | ${e.position || ""}`,
      disabled: false,
    }));

  const filteredManagers = (data?.managers || []).filter(
    (m) =>
      !search ||
      m.manager.name.toLowerCase().includes(search.toLowerCase()) ||
      m.manager.employeeCode.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      title: "Quản lý",
      key: "manager",
      width: 280,
      render: (_: any, record: ManagerGroup) => (
        <Space>
          <Avatar
            style={{
              background:
                record.manager.role === "ADMIN" ? "#f5222d" : "#1677ff",
            }}
            icon={
              record.manager.role === "ADMIN" ? (
                <CrownOutlined />
              ) : (
                <UserSwitchOutlined />
              )
            }
          />
          <div>
            <div className="font-semibold text-sm">{record.manager.name}</div>
            <Text type="secondary" className="text-xs">
              {record.manager.employeeCode} · {record.manager.department || "—"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      key: "role",
      width: 110,
      render: (_: any, record: ManagerGroup) => (
        <Tag color={record.manager.role === "ADMIN" ? "red" : "blue"}>
          {record.manager.role}
        </Tag>
      ),
    },
    {
      title: "Nhân viên phụ trách",
      key: "subordinates",
      render: (_: any, record: ManagerGroup) => (
        <div className="flex flex-wrap gap-1">
          {record.subordinates.length === 0 ? (
            <Text type="secondary" className="text-xs italic">
              Chưa có nhân viên
            </Text>
          ) : (
            record.subordinates.slice(0, 5).map((sub) => (
              <Tooltip
                key={sub.id}
                title={
                  <span>
                    {sub.employeeCode} · {sub.department} · {sub.position}
                    <br />
                    <Button
                      size="small"
                      danger
                      type="link"
                      onClick={() => handleRemoveSubordinate(sub.id)}
                    >
                      Gỡ khỏi quản lý
                    </Button>
                  </span>
                }
              >
                <Tag className="cursor-pointer" color="default">
                  {sub.name}
                </Tag>
              </Tooltip>
            ))
          )}
          {record.subordinates.length > 5 && (
            <Tag color="processing">+{record.subordinates.length - 5} khác</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Tổng",
      key: "count",
      width: 80,
      render: (_: any, record: ManagerGroup) => (
        <Badge count={record.subordinates.length} showZero color="#1677ff" />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 160,
      render: (_: any, record: ManagerGroup) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<SwapOutlined />}
            onClick={() => openAssignModal(record.manager)}
          >
            Phân công
          </Button>
          {record.manager.role === "MANAGER" && (
            <Popconfirm
              title="Hạ xuống nhân viên?"
              description="Người này sẽ mất quyền xem lương của cấp dưới."
              onConfirm={() => handleSetManager(record.manager, false)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <TeamOutlined className="text-white text-lg" />
            </div>
            <div>
              <Title level={4} className="!mb-0">
                Phân công Quản lý Lương
              </Title>
              <Text type="secondary" className="text-sm">
                Thiết lập quản lý và gán nhân viên để cấp quyền xem lương
              </Text>
            </div>
          </div>
        </div>

        {/* Stats */}
        {data && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="text-center border-blue-100" size="small">
              <div className="text-2xl font-bold text-blue-600">
                {data.managers.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Quản lý / Admin</div>
            </Card>
            <Card className="text-center border-green-100" size="small">
              <div className="text-2xl font-bold text-green-600">
                {data.managers.reduce(
                  (sum, m) => sum + m.subordinates.length,
                  0,
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">Đã phân công</div>
            </Card>
            <Card className="text-center border-orange-100" size="small">
              <div className="text-2xl font-bold text-orange-500">
                {data.unassigned.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Chưa phân công</div>
            </Card>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Tìm quản lý..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setPromoteModal({ open: true, employee: null })}
          >
            Nâng lên Quản lý
          </Button>
        </div>

        {/* Main table */}
        <Card className="shadow-sm">
          <Spin spinning={loading}>
            <Table
              dataSource={filteredManagers}
              columns={columns}
              rowKey={(r) => r.manager.id}
              pagination={{
                pageSize: 10,
                showTotal: (t) => `Tổng ${t} quản lý`,
              }}
              size="middle"
            />
          </Spin>
        </Card>

        {/* Unassigned employees */}
        {(data?.unassigned?.length || 0) > 0 && (
          <Card
            className="mt-4 border-orange-200 bg-orange-50 shadow-sm"
            title={
              <span className="text-orange-600 font-semibold">
                <ExclamationCircleOutlined className="mr-2" />
                Nhân viên chưa có quản lý ({data!.unassigned.length})
              </span>
            }
            size="small"
          >
            <div className="flex flex-wrap gap-2">
              {data!.unassigned.map((emp) => (
                <Tag key={emp.id} color="orange">
                  {emp.employeeCode} · {emp.name}
                </Tag>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Modal: Gán nhân viên */}
      <Modal
        title={
          <span>
            <SwapOutlined className="mr-2 text-blue-500" />
            Phân công nhân viên cho: <strong>{selectedManager?.name}</strong>
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="Lưu phân công"
        cancelText="Hủy"
        confirmLoading={saving}
        width={780}
      >
        <p className="text-gray-500 text-sm mb-4">
          Chọn nhân viên bên trái → chuyển sang bên phải để gán cho quản lý này.
          Quản lý sẽ có thể xem và xuất lương của những nhân viên được chọn.
        </p>
        <Transfer
          dataSource={transferDataSource}
          titles={["Nhân viên", "Được phân công"]}
          targetKeys={targetKeys}
          onChange={(keys) => setTargetKeys(keys as string[])}
          render={(item) => (
            <span>
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-gray-400 ml-2">
                {item.description}
              </span>
            </span>
          )}
          listStyle={{ width: 320, height: 380 }}
          showSearch
          filterOption={(input, item) =>
            (item.title || "").toLowerCase().includes(input.toLowerCase()) ||
            (item.description || "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </Modal>

      {/* Modal: Nâng lên quản lý */}
      <Modal
        title="Nâng cấp nhân viên lên Quản lý"
        open={promoteModal.open}
        onCancel={() => setPromoteModal({ open: false, employee: null })}
        footer={null}
        width={460}
      >
        <p className="text-gray-500 text-sm mb-4">
          Chọn nhân viên để nâng lên vai trò Quản lý. Sau khi nâng cấp, bạn có
          thể phân công nhân viên cho họ.
        </p>
        <Select
          showSearch
          className="w-full"
          placeholder="Tìm nhân viên..."
          optionFilterProp="label"
          onChange={(val) => {
            const emp = data?.allEmployees.find((e) => e.id === val);
            setPromoteModal((p) => ({ ...p, employee: emp || null }));
          }}
          value={promoteModal.employee?.id}
        >
          {(data?.allEmployees || [])
            .filter((e) => e.role === "USER")
            .map((e) => (
              <Option
                key={e.id}
                value={e.id}
                label={`${e.employeeCode} ${e.name}`}
              >
                <div>
                  <span className="font-medium">{e.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {e.employeeCode} · {e.department}
                  </span>
                </div>
              </Option>
            ))}
        </Select>
        {promoteModal.employee && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Space>
              <Avatar
                icon={<UserOutlined />}
                style={{ background: "#1677ff" }}
              />
              <div>
                <div className="font-semibold">
                  {promoteModal.employee.name}
                </div>
                <Text type="secondary" className="text-xs">
                  {promoteModal.employee.employeeCode} ·{" "}
                  {promoteModal.employee.department} ·{" "}
                  {promoteModal.employee.position}
                </Text>
              </div>
            </Space>
            <div className="mt-3 flex gap-2">
              <Button
                type="primary"
                icon={<CrownOutlined />}
                onClick={() => handleSetManager(promoteModal.employee!, true)}
              >
                Nâng lên Quản lý
              </Button>
              <Button
                onClick={() => setPromoteModal({ open: false, employee: null })}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
