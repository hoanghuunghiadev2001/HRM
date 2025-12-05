/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Space,
  Tag,
  message,
  Card,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

interface Asset {
  id: number;
  name: string;
  description?: string;
  unit?: string; // 🟩 THÊM FIELD ĐƠN VỊ
  assignments: { id: number }[];
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newAsset, setNewAsset] = useState({
    name: "",
    description: "",
    unit: "", // 🟩 THÊM VÀO STATE
  });

  const [editAsset, setEditAsset] = useState<Asset | null>(null);

  // Load danh sách
  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/assets");
      const data = await res.json();
      setAssets(data.assets || []);
    } catch {
      message.error("Không thể tải danh sách tài sản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // ---------- CREATE ----------
  const createAsset = async () => {
    if (!newAsset.name.trim()) {
      return message.warning("Tên tài sản không được để trống");
    }

    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAsset), // 🟩 Gửi thêm unit
    });

    const data = await res.json();

    if (!data.success) return message.error(data.message || "Thêm thất bại");

    message.success("Thêm tài sản thành công");
    setOpen(false);
    loadAssets();
  };

  // ---------- UPDATE ----------
  const updateAsset = async () => {
    if (!editAsset) return;

    const res = await fetch("/api/assets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editAsset.id,
        name: editAsset.name,
        description: editAsset.description,
        unit: editAsset.unit, // 🟩 Gửi thêm đơn vị
      }),
    });

    const data = await res.json();

    if (!data.success)
      return message.error(data.message || "Cập nhật thất bại");

    message.success("Cập nhật tài sản thành công");
    setEditOpen(false);
    loadAssets();
  };

  // ---------- DELETE ----------
  const deleteAsset = async (id: number) => {
    const res = await fetch(`/api/assets?id=${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!data.success) {
      return message.error(data.message || "Không thể xóa");
    }

    message.success("Đã xóa tài sản");
    loadAssets();
  };

  const columns = [
    {
      title: "Tên tài sản",
      dataIndex: "name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Đơn vị", // 🟩 THÊM CỘT ĐƠN VỊ
      dataIndex: "unit",
      width: 120,
      render: (text: string) => text || <i>—</i>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: "35%",
      render: (text: string) => text || <i>Không có mô tả</i>,
    },
    {
      title: "Số lần cấp",
      width: 120,
      render: (_: any, row: Asset) => (
        <Tag color="blue">{row.assignments?.length || 0}</Tag>
      ),
    },
    {
      title: "Hành động",
      width: 260,
      render: (_: any, asset: Asset) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditAsset(asset);
              setEditOpen(true);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Bạn chắc muốn xóa tài sản này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteAsset(asset.id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Quản lý tài sản"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadAssets}>
              Tải lại
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
            >
              Thêm tài sản
            </Button>
          </Space>
        }
      >
        <Table
          loading={loading}
          dataSource={assets}
          rowKey="id"
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal thêm */}
      <Modal
        open={open}
        title="Thêm tài sản"
        okText="Lưu"
        cancelText="Hủy"
        onOk={createAsset}
        onCancel={() => setOpen(false)}
      >
        <Input
          placeholder="Tên tài sản"
          className="!mb-2"
          onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
        />

        <Input
          placeholder="Đơn vị (ví dụ: cái, bộ, chiếc...)"
          className="mb-2"
          onChange={(e) => setNewAsset({ ...newAsset, unit: e.target.value })}
        />

        <Input.TextArea
          rows={4}
          placeholder="Mô tả"
          className="!mt-4"
          onChange={(e) =>
            setNewAsset({ ...newAsset, description: e.target.value })
          }
        />
      </Modal>

      {/* Modal sửa */}
      <Modal
        open={editOpen}
        title="Sửa tài sản"
        okText="Cập nhật"
        cancelText="Hủy"
        onOk={updateAsset}
        onCancel={() => setEditOpen(false)}
      >
        <Input
          placeholder="Tên tài sản"
          className="!mb-2"
          value={editAsset?.name}
          onChange={(e) =>
            setEditAsset((a) => (a ? { ...a, name: e.target.value } : a))
          }
        />

        <Input
          placeholder="Đơn vị"
          className="mb-2"
          value={editAsset?.unit}
          onChange={(e) =>
            setEditAsset((a) => (a ? { ...a, unit: e.target.value } : a))
          }
        />

        <Input.TextArea
          rows={4}
          placeholder="Mô tả"
          value={editAsset?.description}
          className="!mt-4"
          onChange={(e) =>
            setEditAsset((a) => (a ? { ...a, description: e.target.value } : a))
          }
        />
      </Modal>
    </div>
  );
}
