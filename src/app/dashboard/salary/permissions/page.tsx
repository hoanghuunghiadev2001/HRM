/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
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
  Tooltip,
  Transfer,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  PlusOutlined,
  SearchOutlined,
  UnlockOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [permRes, empRes] = await Promise.all([
        fetch("/api/salary/permissions"),
        fetch("/api/salary/permissions?viewerId=0"), // chỉ cần allEmployees — dùng endpoint khác nếu có
      ]);

      if (!permRes.ok) throw new Error();
      const json: AllData = await permRes.json();
      setData(json);

      // Lấy tất cả employee để dùng cho Transfer và Select
      // (Dùng API employees nội bộ của bạn — thay bằng endpoint thực tế)
      const empJson = await fetch("/api/employees/allStaff").then((r) =>
        r.ok ? r.json() : { data: [] },
      );
      setAllEmployees(empJson.data || []);
    } catch {
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Cấp quyền ──────────────────────────────────────────────────────────
  const handleGrant = async () => {
    if (!grantViewer || grantTargetKeys.length === 0) {
      message.warning("Chọn người xem và ít nhất 1 nhân viên");
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
      message.success(json.message);
      setGrantModal(false);
      setGrantViewer(null);
      setGrantTargetKeys([]);
      setGrantNote("");
      await fetchData();
    } catch (e: any) {
      message.error(e.message || "Lỗi cấp quyền");
    } finally {
      setGrantSaving(false);
    }
  };

  // ── Toggle active ────────────────────────────────────────────────────────
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

  // ── Xóa quyền ────────────────────────────────────────────────────────────
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
      message.error("Thao tác thất bại");
    }
  };

  // ── Transfer datasource ─────────────────────────────────────────────────
  const transferSource = allEmployees
    .filter((e) => e.id !== grantViewer)
    .map((e) => ({
      key: String(e.id),
      title: `${e.employeeCode} – ${e.name}`,
      description: `${e.department ?? ""} | ${e.position ?? ""}`,
    }));

  const filtered = (data?.viewers ?? []).filter(
    (v) =>
      !search ||
      v.viewer.name.toLowerCase().includes(search.toLowerCase()) ||
      v.viewer.employeeCode.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Người được cấp quyền",
      key: "viewer",
      width: 240,
      render: (_: any, r: ViewerGroup) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ background: "#1677ff" }}
          />
          <div>
            <div className="font-semibold text-sm">{r.viewer.name}</div>
            <Text type="secondary" className="text-xs">
              {r.viewer.employeeCode} · {r.viewer.department ?? "—"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      key: "role",
      width: 100,
      render: (_: any, r: ViewerGroup) => {
        const color: Record<string, string> = {
          ADMIN: "red",
          MANAGER: "blue",
          USER: "default",
        };
        return (
          <Tag color={color[r.viewer.role] ?? "default"}>{r.viewer.role}</Tag>
        );
      },
    },
    {
      title: "Được xem lương của",
      key: "targets",
      render: (_: any, r: ViewerGroup) => {
        const active = r.targets.filter((t) => t.isActive);
        const inactive = r.targets.filter((t) => !t.isActive);
        return (
          <div className="flex flex-wrap gap-1">
            {active.slice(0, 4).map((t) => (
              <Tag key={t.permissionId} color="green" className="text-xs">
                {t.target.name}
              </Tag>
            ))}
            {inactive.slice(0, 2).map((t) => (
              <Tag
                key={t.permissionId}
                color="default"
                className="text-xs line-through opacity-50"
              >
                {t.target.name}
              </Tag>
            ))}
            {r.targets.length > 6 && (
              <Tag color="processing">+{r.targets.length - 6} khác</Tag>
            )}
            {r.targets.length === 0 && (
              <Text type="secondary" className="text-xs italic">
                Chưa có quyền nào
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Đang hoạt động",
      key: "activeCount",
      width: 120,
      render: (_: any, r: ViewerGroup) => (
        <Badge
          count={r.activeCount}
          showZero
          color={r.activeCount > 0 ? "#52c41a" : "#d9d9d9"}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_: any, r: ViewerGroup) => (
        <Space>
          <Tooltip title="Xem & quản lý chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailViewer(r)}
            />
          </Tooltip>
          <Tooltip title="Cấp thêm quyền cho người này">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<PlusOutlined />}
              onClick={() => {
                setGrantViewer(r.viewer.id);
                const existing = r.targets
                  .filter((t) => t.isActive)
                  .map((t) => String(t.target.id));
                setGrantTargetKeys(existing);
                setGrantModal(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <LockOutlined className="text-white text-lg" />
            </div>
            <div>
              <Title level={4} className="!mb-0">
                Phân quyền Xem Lương
              </Title>
              <Text type="secondary" className="text-sm">
                Cấp quyền độc lập với role — bất kỳ nhân viên nào cũng có thể
                được cấp quyền xem lương người khác
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setGrantViewer(null);
              setGrantTargetKeys([]);
              setGrantNote("");
              setGrantModal(true);
            }}
          >
            Cấp quyền mới
          </Button>
        </div>

        {/* Stats */}
        {data && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card size="small" className="border-indigo-100 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {data.viewers.length}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Người có quyền xem
              </div>
            </Card>
            <Card size="small" className="border-green-100 text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.viewers.reduce((s, v) => s + v.activeCount, 0)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Quyền đang hoạt động
              </div>
            </Card>
            <Card size="small" className="border-gray-100 text-center">
              <div className="text-2xl font-bold text-gray-500">
                {data.total}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Tổng số quyền (kể cả tắt)
              </div>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Tìm người được cấp quyền..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="w-72"
          />
        </div>

        {/* Table */}
        <Card className="shadow-sm">
          <Spin spinning={loading}>
            <Table
              dataSource={filtered}
              columns={columns}
              rowKey={(r) => r.viewer.id}
              size="middle"
              pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} người` }}
            />
          </Spin>
        </Card>
      </div>

      {/* Modal: Cấp quyền */}
      <Modal
        title={
          <>
            <PlusOutlined className="mr-2 text-indigo-500" />
            Cấp quyền xem lương
          </>
        }
        open={grantModal}
        onCancel={() => setGrantModal(false)}
        onOk={handleGrant}
        okText="Cấp quyền"
        cancelText="Hủy"
        confirmLoading={grantSaving}
        width={800}
        destroyOnClose
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Người được cấp quyền xem
          </label>
          <Select
            showSearch
            className="w-full"
            placeholder="Chọn nhân viên..."
            optionFilterProp="label"
            value={grantViewer}
            onChange={setGrantViewer}
          >
            {allEmployees.map((e) => (
              <Option
                key={e.id}
                value={e.id}
                label={`${e.employeeCode} ${e.name}`}
              >
                <span className="font-medium">{e.name}</span>
                <Text type="secondary" className="text-xs ml-2">
                  {e.employeeCode} · {e.department} · <Tag>{e.role}</Tag>
                </Text>
              </Option>
            ))}
          </Select>
          <Text type="secondary" className="text-xs mt-1 block">
            Không giới hạn role — USER, MANAGER hay ADMIN đều có thể được cấp
            quyền.
          </Text>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Được phép xem lương của ai
          </label>
          <Transfer
            dataSource={transferSource}
            titles={["Tất cả nhân viên", "Được xem lương"]}
            targetKeys={grantTargetKeys}
            onChange={(keys) => setGrantTargetKeys(keys as string[])}
            render={(item) => (
              <span>
                <span className="font-medium text-xs">{item.title}</span>
                <span className="text-gray-400 text-xs ml-2">
                  {item.description}
                </span>
              </span>
            )}
            listStyle={{ width: 320, height: 360 }}
            showSearch
            filterOption={(input, item) =>
              (item.title ?? "").toLowerCase().includes(input.toLowerCase()) ||
              (item.description ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Ghi chú (tuỳ chọn)
          </label>
          <Input
            placeholder="VD: Trưởng phòng kế toán phụ trách tổ 3"
            value={grantNote}
            onChange={(e) => setGrantNote(e.target.value)}
            maxLength={200}
          />
        </div>
      </Modal>

      {/* Modal: Chi tiết quyền của 1 viewer */}
      <Modal
        title={
          <Space>
            <EyeOutlined className="text-indigo-500" />
            <span>
              Quyền của: <strong>{detailViewer?.viewer.name}</strong>
            </span>
            <Tag>{detailViewer?.viewer.role}</Tag>
          </Space>
        }
        open={!!detailViewer}
        onCancel={() => setDetailViewer(null)}
        footer={null}
        width={700}
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
                title: "Nhân viên được xem",
                key: "target",
                render: (_: any, t: TargetEntry) => (
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <div>
                      <div className="text-sm font-medium">{t.target.name}</div>
                      <Text type="secondary" className="text-xs">
                        {t.target.employeeCode} · {t.target.department ?? "—"}
                      </Text>
                    </div>
                  </Space>
                ),
              },
              {
                title: "Trạng thái",
                key: "isActive",
                width: 110,
                render: (_: any, t: TargetEntry) => (
                  <Switch
                    size="small"
                    checked={t.isActive}
                    checkedChildren={<UnlockOutlined />}
                    unCheckedChildren={<LockOutlined />}
                    onChange={(v) => handleToggle(t.permissionId, v)}
                  />
                ),
              },
              {
                title: "Cấp bởi",
                key: "grantedBy",
                width: 140,
                render: (_: any, t: TargetEntry) => (
                  <Text className="text-xs">{t.grantedBy.name}</Text>
                ),
              },
              {
                title: "Ghi chú",
                dataIndex: "note",
                key: "note",
                render: (v: string) => (
                  <Text type="secondary" className="text-xs">
                    {v ?? "—"}
                  </Text>
                ),
              },
              {
                title: "",
                key: "del",
                width: 50,
                render: (_: any, t: TargetEntry) => (
                  <Popconfirm
                    title="Xóa quyền này?"
                    description="Không thể hoàn tác. Cân nhắc dùng tắt tạm thay thế."
                    onConfirm={() => handleDelete([t.permissionId])}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
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
