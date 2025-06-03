/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Space } from "antd";
import ModalLoading from "@/components/modalLoading";

interface Department {
  id: number;
  name: string;
  abbreviation: string;
}

interface Position {
  id: number;
  name: string;
  departmentId: number;
}

export default function DepartmentPositionCRUD() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"department" | "position">(
    "department"
  );
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentDeptIdForPos, setCurrentDeptIdForPos] = useState<number | null>(
    null
  );
  const [modalConfirm, setModalConfirm] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [modal, contextHolder] = Modal.useModal();

  const [form] = Form.useForm();

  // --- Lấy dữ liệu từ API khi component mount ---
  useEffect(() => {
    fetchDepartmentsAndPositions();
  }, []);

  // Sửa phần fetchDepartmentsAndPositions
  async function fetchDepartmentsAndPositions() {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
      const departmentsData = await res.json(); // Trả về mảng phòng ban

      // Tách phòng ban và positions
      setDepartments(departmentsData);
      const allPositions = departmentsData.flatMap((d: any) =>
        d.positions.map((p: any) => ({
          ...p,
          departmentId: d.id, // Đảm bảo có field departmentId
        }))
      );
      setPositions(allPositions);
      setLoading(false);
    } catch (error) {
      message.error("Không thể tải dữ liệu phòng ban và chức vụ");
      setLoading(false);
    }
  }

  // --- Các hàm mở modal ---
  const openAddDepartment = () => {
    setModalType("department");
    setModalMode("add");
    setEditItemId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditDepartment = (dept: Department) => {
    setModalType("department");
    setModalMode("edit");
    setEditItemId(dept.id);
    form.setFieldsValue({ name: dept.name, abbreviation: dept.abbreviation });
    setModalOpen(true);
  };

  const openAddPosition = (departmentId: number) => {
    setModalType("position");
    setModalMode("add");
    setCurrentDeptIdForPos(departmentId);
    setEditItemId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditPosition = (pos: Position) => {
    setModalType("position");
    setModalMode("edit");
    setCurrentDeptIdForPos(pos.departmentId);
    setEditItemId(pos.id);
    form.setFieldsValue({ name: pos.name });
    setModalOpen(true);
  };

  const openDeleteDepartment = (dept: Department) => {
    setModalType("department");
    setEditItemId(dept.id);
    setModalConfirm(true);
  };

  const openDeletePosition = (pos: Position) => {
    setModalType("position");
    setCurrentDeptIdForPos(pos.departmentId);
    setEditItemId(pos.id);
    form.setFieldsValue({ name: pos.name });
    setModalConfirm(true);
  };

  // --- Xử lý xác nhận modal (thêm/sửa) gọi API ---
  const onModalOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const newName = values.name.trim();

      if (modalType === "department") {
        const newAbbreviation = values.abbreviation.trim();

        if (modalMode === "add") {
          // Gọi API thêm phòng ban
          const res = await fetch("/api/departments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: newName,
              abbreviation: newAbbreviation,
            }),
          });
          if (!res.ok) {
            setLoading(false);
            throw new Error("Thêm phòng ban thất bại");
          }
          message.success("Thêm phòng ban thành công");
          setLoading(false);
        } else if (modalMode === "edit" && editItemId !== null) {
          // Gọi API sửa phòng ban
          const res = await fetch(`/api/departments/${editItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: newName,
              abbreviation: newAbbreviation,
            }),
          });
          if (!res.ok) {
            setLoading(false);

            throw new Error("Cập nhật phòng ban thất bại");
          }
          message.success("Cập nhật phòng ban thành công");
          setLoading(false);
        }
      } else if (modalType === "position") {
        if (!currentDeptIdForPos) {
          message.error("Phòng ban không hợp lệ");
          return;
        }
        if (modalMode === "add") {
          // Gọi API thêm chức vụ
          const res = await fetch(
            `/api/departments/${currentDeptIdForPos}/positions`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: newName,
              }),
            }
          );
          if (!res.ok) {
            setLoading(false);
            throw new Error("Thêm chức vụ thất bại");
          }
          message.success("Thêm chức vụ thành công");
          setLoading(false);
        } else if (modalMode === "edit" && editItemId !== null) {
          // Gọi API sửa chức vụ
          const res = await fetch(`/api/positions/?posId=${editItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName }),
          });
          if (!res.ok) {
            setLoading(false);
            throw new Error("Cập nhật chức vụ thất bại");
          }
          message.success("Cập nhật chức vụ thành công");
          setLoading(false);
        }
      }

      setModalOpen(false);
      // Reload lại dữ liệu sau khi thêm/sửa
      fetchDepartmentsAndPositions();
      setLoading(false);
    } catch (error: any) {
      message.error(error.message || "Lỗi xảy ra");
      setLoading(false);
    }
  };

  const onModalCancel = () => {
    setModalOpen(false);
  };

  // --- Xóa phòng ban ---

  // --- Xóa chức vụ ---
  const onDeletePosition = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/positions/${editItemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setLoading(false);
        throw new Error("Xóa chức vụ thất bại");
      }
      message.success("Xóa chức vụ thành công");
      fetchDepartmentsAndPositions();
      setLoading(false);
    } catch (error: any) {
      message.error(error.message || "Lỗi xảy ra");
      setLoading(false);
    }
  };

  const onDeleteDepartment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/departments/${editItemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setLoading(false);
        throw new Error("Xóa phòng ban thất bại");
      }
      message.success("Xóa phòng ban thành công");
      fetchDepartmentsAndPositions();
      setModalConfirm(false);
      setLoading(false);
    } catch (error: any) {
      message.error(error.message || "Lỗi xảy ra");
      setLoading(false);
    }
  };

  const deptColumns = [
    {
      title: "STT",
      key: "stt",
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mã phòng ban",
      dataIndex: "abbreviation",
      key: "abbreviation",
      width: 130,
    },
    { title: "Tên phòng ban", dataIndex: "name", key: "name" },

    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_: any, record: Department) => (
        <Space>
          <Button size="small" onClick={() => openEditDepartment(record)}>
            Sửa
          </Button>
          <Button
            danger
            size="small"
            onClick={() => openDeleteDepartment(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const positionColumns = [
    {
      title: "STT",
      key: "stt",
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    { title: "Tên chức vụ", dataIndex: "name", key: "name" },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_: any, record: Position) => (
        <Space>
          <Button size="small" onClick={() => openEditPosition(record)}>
            Sửa
          </Button>
          <Button
            danger
            size="small"
            onClick={() => openDeletePosition(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const onExpandedRowsChange = (expandedKeys: readonly React.Key[]) => {
    setExpandedRowKeys(expandedKeys as number[]);
  };

  return (
    <div className="p-4">
      <ModalLoading isOpen={loading} />

      <div className="flex justify-between">
        <h2>Quản lý Phòng ban & Chức vụ</h2>
        <Button
          type="primary"
          onClick={openAddDepartment}
          style={{ marginBottom: 16 }}
        >
          Thêm Phòng ban
        </Button>
      </div>

      <Table
        className="table-department"
        dataSource={departments}
        columns={deptColumns}
        rowKey="id"
        pagination={false}
        expandable={{
          expandedRowRender: (record) => {
            const relatedPositions = positions.filter(
              (pos) => pos.departmentId === record.id
            );

            return (
              <div>
                <Button
                  size="small"
                  type="dashed"
                  onClick={() => openAddPosition(record.id)}
                  style={{ marginBottom: 8 }}
                >
                  Thêm chức vụ
                </Button>
                <div className="pl-20">
                  <Table
                    className="table-position"
                    dataSource={relatedPositions}
                    columns={positionColumns}
                    pagination={false}
                    rowKey="id"
                    size="small"
                  />
                </div>
              </div>
            );
          },
          expandedRowKeys,
          onExpandedRowsChange,
          rowExpandable: () => true,
        }}
      />

      <Modal
        title={
          modalMode === "add"
            ? modalType === "department"
              ? "Thêm Phòng ban"
              : "Thêm Chức vụ"
            : modalType === "department"
            ? "Sửa Phòng ban"
            : "Sửa Chức vụ"
        }
        open={modalOpen}
        onOk={onModalOk}
        onCancel={onModalCancel}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" name="modalForm">
          <Form.Item
            label={modalType === "department" ? "Tên phòng ban" : "Tên chức vụ"}
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input
              placeholder={
                modalType === "department"
                  ? "Nhập tên phòng ban"
                  : "Nhập tên chức vụ"
              }
              autoFocus
            />
          </Form.Item>
          {modalType === "department" && (
            <Form.Item
              label={"Viết tắt"}
              name="abbreviation"
              className="!mt-3"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder={"Nhập tên viết tắt phòng ban"} />
            </Form.Item>
          )}
        </Form>
      </Modal>
      <Modal
        title={modalType === "department" ? "Xóa Phòng ban" : "Xóa chức vụ"}
        open={modalConfirm}
        onOk={
          modalType === "department" ? onDeleteDepartment : onDeletePosition
        }
        // confirmLoading={confirmLoading}
        onCancel={() => setModalConfirm(false)}
      >
        <p>Bạn có chắc chắn </p>
      </Modal>
    </div>
  );
}
