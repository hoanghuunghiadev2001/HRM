/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Divider,
  Typography,
  Transfer,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  PlusOutlined,
  SearchOutlined,
  UnlockOutlined,
  UserOutlined,
  FilterOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option, OptGroup } = Select;

// --- Interfaces ---
interface EmpInfo {
  id: number;
  employeeCode: string;
  name: string;
  role: string;
  department?: string | null;
  position?: string | null;
}

interface TargetEntry {
  permissionId: number;
  isActive: boolean;
  note?: string | null;
  createdAt: string;
  grantedBy: { id: number; name: string; employeeCode: string };
  target: EmpInfo;
}

interface ViewerGroup {
  viewer: EmpInfo;
  targets: TargetEntry[];
  activeCount: number;
}

interface AllData {
  total: number;
  viewers: ViewerGroup[];
}

export default function SalaryPermissionsPage() {
  const [data, setData] = useState<AllData | null>(null);
  const [allEmployees, setAllEmployees] = useState<EmpInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal cấp quyền mới
  const [grantModal, setGrantModal] = useState(false);
  const [grantViewer, setGrantViewer] = useState<number | null>(null);
  const [grantTargetKeys, setGrantTargetKeys] = useState<string[]>([]);
  const [grantNote, setGrantNote] = useState("");
  const [grantSaving, setGrantSaving] = useState(false);

  // Modal xem chi tiết viewer
  const [detailViewer, setDetailViewer] = useState<ViewerGroup | null>(null);

  // --- Logic xử lý dữ liệu nhân viên ---
  const employeesByDept = useMemo(() => {
    const groups: Record<string, EmpInfo[]> = {};
    allEmployees.forEach((emp) => {
      const dept = emp.department || "Phòng ban khác";
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(emp);
    });
    return groups;
  }, [allEmployees]);

  const departments = useMemo(
    () => Object.keys(employeesByDept).sort(),
    [employeesByDept],
  );

  const transferSource = useMemo(() => {
    return allEmployees
      .filter((e) => e.id !== grantViewer)
      .map((e) => ({
        key: String(e.id),
        title: e.name,
        code: e.employeeCode,
        position: e.position ?? "Nhân viên",
        dept: e.department ?? "N/A",
      }));
  }, [allEmployees, grantViewer]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [permRes, empRes] = await Promise.all([
        fetch("/api/salary/permissions"),
        fetch("/api/employees/allStaff"), // Giả định endpoint lấy toàn bộ NV của bạn
      ]);

      if (permRes.ok) {
        const json: AllData = await permRes.json();
        setData(json);
      }

      if (empRes.ok) {
        const empJson = await empRes.json();
        setAllEmployees(empJson.data || []);
      }
    } catch {
      message.error("Không thể tải dữ liệu hệ thống");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Actions ---
  const handleSelectDept = (deptName: string) => {
    const deptEmpKeys = (employeesByDept[deptName] || [])
      .filter((e) => e.id !== grantViewer)
      .map((e) => String(e.id));
    const newKeys = Array.from(new Set([...grantTargetKeys, ...deptEmpKeys]));
    setGrantTargetKeys(newKeys);
    message.success(`Đã thêm nhân viên ${deptName}`);
  };

  const handleGrant = async () => {
    if (!grantViewer || grantTargetKeys.length === 0) {
      message.warning(
        "Vui lòng chọn người xem và ít nhất 1 nhân viên mục tiêu",
      );
      return;
    }
    setGrantSaving(true);
    try {
      const res = await fetch("/api/salary/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          viewerId: grantViewer,
          targetIds: grantTargetKeys.map(Number),
          note: grantNote || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      message.success("Cấp quyền thành công");

      // 2. Reset toàn bộ dữ liệu nhập liệu về trạng thái ban đầu
      setGrantViewer(null);
      setGrantTargetKeys([]);
      setGrantNote("");
      setGrantSaving(false);
      setGrantModal(false);
      await fetchData();
    } catch (e: any) {
      message.error(e.message || "Lỗi cấp quyền");
    } finally {
      setGrantSaving(false);
    }
  };

  const handleToggle = async (permissionId: number, isActive: boolean) => {
    try {
      const res = await fetch("/api/salary/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionId, isActive }),
      });
      if (!res.ok) throw new Error();
      message.success(isActive ? "Đã kích hoạt" : "Đã tạm khóa");
      await fetchData();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const handleDelete = async (permissionIds: number[]) => {
    try {
      const res = await fetch("/api/salary/permissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds }),
      });
      if (!res.ok) throw new Error();
      message.success("Đã xóa quyền");
      if (detailViewer) {
        setDetailViewer((prev) =>
          prev
            ? {
                ...prev,
                targets: prev.targets.filter(
                  (t) => !permissionIds.includes(t.permissionId),
                ),
              }
            : null,
        );
      }
      await fetchData();
    } catch {
      message.error("Xóa quyền thất bại");
    }
  };

  const filteredViewers = (data?.viewers ?? []).filter(
    (v) =>
      !search ||
      v.viewer.name.toLowerCase().includes(search.toLowerCase()) ||
      v.viewer.employeeCode.toLowerCase().includes(search.toLowerCase()),
  );

  // --- Table Columns ---
  const mainColumns = [
    {
      title: "Người được cấp quyền",
      key: "viewer",
      width: 300,
      render: (_: any, r: ViewerGroup) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-indigo-600" />
          <div>
            <div className="font-semibold text-sm">
              {r.viewer.name}{" "}
              <Text type="secondary" className="font-normal">
                ({r.viewer.position || "N/A"})
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {r.viewer.employeeCode} · {r.viewer.department || "—"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: ["viewer", "role"],
      key: "role",
      width: 100,
      render: (role: string) => (
        <Tag
          color={
            role === "ADMIN" ? "red" : role === "MANAGER" ? "blue" : "default"
          }
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Được xem lương của",
      key: "targets",
      render: (_: any, r: ViewerGroup) => {
        const active = r.targets.filter((t) => t.isActive);
        return (
          <div className="flex flex-wrap gap-1">
            {active.slice(0, 3).map((t) => (
              <Tag key={t.permissionId} color="green" className="text-xs">
                {t.target.name} ({t.target.position})
              </Tag>
            ))}
            {active.length > 3 && (
              <Tag color="processing">+{active.length - 3} khác</Tag>
            )}
            {active.length === 0 && (
              <Text type="secondary" className="italic text-xs">
                Chưa có quyền
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Hoạt động",
      key: "active",
      width: 100,
      align: "center" as const,
      render: (_: any, r: ViewerGroup) => (
        <Badge count={r.activeCount} showZero color="#52c41a" />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 110,
      render: (_: any, r: ViewerGroup) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setDetailViewer(r)}
          />
          <Button
            size="small"
            type="primary"
            ghost
            icon={<PlusOutlined />}
            onClick={() => {
              setGrantViewer(r.viewer.id);
              setGrantModal(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Space size="middle">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <LockOutlined className="text-white text-xl" />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Phân quyền Xem Lương
              </Title>
              <Text type="secondary">
                Quản lý quyền truy cập dữ liệu lương độc lập theo từng cá nhân
              </Text>
            </div>
          </Space>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setGrantModal(true)}
          >
            Cấp quyền mới
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card size="small" bordered={false} className="shadow-sm">
            <Text type="secondary" className="text-xs uppercase font-bold">
              Người có quyền
            </Text>
            <div className="text-2xl font-bold text-indigo-600">
              {data?.viewers.length || 0}
            </div>
          </Card>
          <Card size="small" bordered={false} className="shadow-sm">
            <Text type="secondary" className="text-xs uppercase font-bold">
              Quyền đang bật
            </Text>
            <div className="text-2xl font-bold text-green-600">
              {data?.viewers.reduce((a, b) => a + b.activeCount, 0) || 0}
            </div>
          </Card>
          <Card size="small" bordered={false} className="shadow-sm">
            <Text type="secondary" className="text-xs uppercase font-bold">
              Tổng số bản ghi
            </Text>
            <div className="text-2xl font-bold text-gray-400">
              {data?.total || 0}
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-4 flex justify-between">
          <Input
            placeholder="Tìm theo tên hoặc mã nhân viên..."
            prefix={<SearchOutlined />}
            className="w-80 shadow-sm"
            allowClear
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Main Table */}
        <Card bodyStyle={{ padding: 0 }} className="shadow-sm overflow-hidden">
          <Table
            dataSource={filteredViewers}
            columns={mainColumns}
            rowKey={(r) => r.viewer.id}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      {/* Modal: Grant Permissions */}
      <Modal
        title={<b>CẤP QUYỀN XEM LƯƠNG</b>}
        open={grantModal}
        onCancel={() => {
          // 1. Đóng modal
          setGrantModal(false);

          // 2. Reset toàn bộ dữ liệu nhập liệu về trạng thái ban đầu
          setGrantViewer(null);
          setGrantTargetKeys([]);
          setGrantNote("");
          setGrantSaving(false);

          // Lưu ý: Nếu bạn có dùng search input bên trong các Select
          // thì destroyOnClose bên dưới sẽ tự lo phần đó.
        }}
        onOk={handleGrant}
        width={900}
        confirmLoading={grantSaving}
        okText="Xác nhận cấp quyền"
        // Thuộc tính này cực kỳ quan trọng để clear các input search tạm thời của Antd
        destroyOnClose
      >
        <div className="space-y-6 py-2">
          {/* Người xem */}
          <section>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              1. Người được cấp quyền
            </label>
            <Select
              showSearch
              className="w-full"
              size="large"
              placeholder="Tìm nhân viên (tên, mã, chức vụ...)"
              value={grantViewer}
              onChange={setGrantViewer}
              // Thay đổi ở đây:
              filterOption={(input, option) => {
                // Tìm kiếm trong thuộc tính 'label' của Option
                const label = (option?.label ?? "").toString().toLowerCase();
                return label.includes(input.toLowerCase());
              }}
            >
              {Object.entries(employeesByDept).map(([dept, emps]) => (
                <OptGroup label={dept} key={dept}>
                  {emps.map((e) => (
                    <Option
                      key={e.id}
                      value={e.id}
                      // Thêm thuộc tính label chứa text thuần để search
                      label={`${e.name} ${e.employeeCode} ${e.position} ${dept}`}
                    >
                      <Space
                        style={{
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          <b>{e.name}</b>{" "}
                          <Text type="secondary">({e.position})</Text>
                        </span>
                        <Tag style={{ margin: 0 }}>{e.employeeCode}</Tag>
                      </Space>
                    </Option>
                  ))}
                </OptGroup>
              ))}
            </Select>
          </section>

          {/* Đối tượng xem */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">
                2. Phạm vi được xem lương
              </label>
              <Space>
                <FilterOutlined className="text-gray-400" />
                <Select
                  placeholder="Chọn nhanh theo phòng ban"
                  style={{ width: 250 }}
                  size="small"
                  onChange={handleSelectDept}
                >
                  {departments.map((d) => (
                    <Option key={d} value={d}>
                      {d}
                    </Option>
                  ))}
                </Select>
              </Space>
            </div>
            <Transfer
              dataSource={transferSource}
              titles={["Nhân viên hệ thống", "Đã chọn"]}
              targetKeys={grantTargetKeys}
              onChange={(keys) => setGrantTargetKeys(keys as string[])}
              showSearch
              listStyle={{ width: "100%", height: 350 }}
              render={(item: any) => (
                <div className="flex flex-col line-tight py-1">
                  <span className="font-medium text-sm">
                    {item.title}{" "}
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      ({item.position})
                    </Text>
                  </span>
                  <span className="text-gray-400" style={{ fontSize: 10 }}>
                    {item.code} · {item.dept}
                  </span>
                </div>
              )}
              filterOption={(input, item) =>
                item.title.toLowerCase().includes(input.toLowerCase()) ||
                item.code.toLowerCase().includes(input.toLowerCase()) ||
                item.dept.toLowerCase().includes(input.toLowerCase())
              }
            />
          </section>

          {/* Ghi chú */}
          <section>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              3. Ghi chú
            </label>
            <Input
              placeholder="VD: Quản lý xem lương tổ kỹ thuật..."
              value={grantNote}
              onChange={(e) => setGrantNote(e.target.value)}
            />
          </section>
        </div>
      </Modal>

      {/* Modal: Detail Table */}
      <Modal
        title={
          <Space>
            <TeamOutlined className="text-indigo-600" />
            <span>
              Chi tiết quyền: <b>{detailViewer?.viewer.name}</b>
            </span>
            <Tag color="blue">{detailViewer?.viewer.position}</Tag>
          </Space>
        }
        open={!!detailViewer}
        onCancel={() => setDetailViewer(null)}
        footer={null}
        width={800}
      >
        {detailViewer && (
          <Table
            dataSource={detailViewer.targets}
            rowKey="permissionId"
            size="small"
            pagination={false}
            scroll={{ y: 400 }}
            columns={[
              {
                title: "Nhân viên",
                key: "target",
                render: (_: any, t: TargetEntry) => (
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <div>
                      <div className="text-sm font-medium">
                        {t.target.name}{" "}
                        <Text type="secondary" className="font-normal">
                          ({t.target.position})
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {t.target.employeeCode}
                      </Text>
                    </div>
                  </Space>
                ),
              },
              {
                title: "Trạng thái",
                key: "status",
                width: 100,
                render: (_: any, t: TargetEntry) => (
                  <Switch
                    size="small"
                    checked={t.isActive}
                    onChange={(val) => handleToggle(t.permissionId, val)}
                  />
                ),
              },
              {
                title: "Người cấp",
                dataIndex: ["grantedBy", "name"],
                width: 150,
              },
              {
                title: "Thao tác",
                key: "del",
                width: 60,
                render: (_: any, t: TargetEntry) => (
                  <Popconfirm
                    title="Xóa quyền này?"
                    onConfirm={() => handleDelete([t.permissionId])}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
