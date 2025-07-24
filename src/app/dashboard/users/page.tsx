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
  Form,
  Input,
  TreeSelect,
  TreeSelectProps,
  Pagination,
} from "antd";
import { MenuProps } from "antd/lib";
import { DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { ListCollapse } from "lucide-react";
import {
  deleteEmployeeApi,
  fetchEmployeeByCode,
  updateEmployee,
} from "@/lib/api";
import ModalLoading from "@/components/modalLoading";
import { Department, InfoEmployee } from "@/lib/interface";
import ModalEditEmployee from "@/components/modalEditEmployee";
import { setUser } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/hook";

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
  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setDepartment] = useState<string>();
  const [pageSize, setPageSize] = useState(10);
  const [pageTable, setPageTable] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [totalTable, setTotalTable] = useState();
  const [infoEmployee, setInfoEmployee] = useState<InfoEmployee>();
  const [modalEditEmployee, setModalEditEmployee] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const messError = () => {
    messageApi.open({
      type: "error",
      content: "Nhân viên chưa có thông tin email.",
    });
  };

  const listDepartment = async () => {
    const res = await fetch("/api/departments");
    if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
    const departmentsData = await res.json(); //
    setDepartments(departmentsData);
  };

  const treeData = departments.map((dept) => ({
    value: dept.id.toString(),
    title: dept.name.toString(),
    key: dept.id,
    children: dept.positions.map((pos: any) => ({
      value: `${dept.id}-${pos.id}`,
      title: ` ${pos.name}`,
      key: `${dept.id}-${pos.id}`,
    })),
  }));

  const onPageChange = (page: number, pageSizeEnter?: number) => {
    if (pageSizeEnter) {
      setPageSize(pageSizeEnter);
      fetchEmployees(page, pageSizeEnter);
    } else {
      setPageTable(page);
      fetchEmployees(page, pageSize);
    }
  };

  useEffect(() => {
    fetchEmployees(pageSize, pageTable);
    listDepartment();
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

  const onChangeSelectDepartment = (newValue: string) => {
    setDepartment(newValue);
  };

  const onPopupScroll: TreeSelectProps["onPopupScroll"] = (e) => {
    console.log("onPopupScroll", e);
  };

  async function fetchEmployees(pageSize?: number, page?: number) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        isActive: String(isActiveFilter),
        employeeCode: filterMSNV,
        name: filterName,
        department: filterDepartment ?? "",
        page: String(page) ?? "",
        pageSize: String(pageSize) ?? "",
      });

      const res = await fetch(`/api/user?${params.toString()}`);

      if (!res.ok) throw new Error("Lấy danh sách nhân viên thất bại");

      const json = await res.json();

      // Ví dụ phản hồi: { data: Employee[], total: number, page: number, pageSize: number }
      setEmployees(json.data);
      setTotalTable(json.total); // Nếu bạn cần hiển thị phân trang
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
        if (data.status === 2) {
          messError();
        }
        throw error;
      }
      message.success("Cập nhật thành công");
      fetchEmployees(pageSize, pageTable);
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
      title: "MSNV",
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: "80px",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: "150px",
      render: (_: any, record: Employee) => (
        <p
          className="text-blue-600 cursor-pointer"
          onClick={() => getInforEmployee(record.employeeCode)}
        >
          {record.name}
        </p>
      ),
    },
    {
      title: "Bộ phận",
      dataIndex: "department",
      key: "department",
      render: (text: string | null) => text || "-",
      width: "120px",
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      render: (text: string | null) => text || "-",
      width: "120px",
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
            label: "Chi tiết",
            icon: <InfoCircleOutlined />,
            onClick: () => getInforEmployee(record.employeeCode), // Giả sử bạn tạo state để lưu nhân viên đang thao tác,
          },
          {
            key: "2",
            label: "Reset mật khẩu",
            icon: <InfoCircleOutlined />,
            onClick: () => resetPassword(record.employeeCode), // Giả sử bạn tạo state để lưu nhân viên đang thao tác,
          },
          {
            key: "3",
            label: "Xóa nhân sự",
            icon: <DeleteOutlined />,
            onClick: () => handleDeleteEmployee(record.employeeCode), // Giả sử bạn tạo state để lưu nhân viên đang thao tác,
          },
          {
            key: "4",
            label: isActiveFilter ? "Tắt hoạt động" : "Bật hoạt động",
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

  const getInforEmployee = async (employeeCode: string) => {
    setLoading(true);
    const res = await fetchEmployeeByCode(employeeCode);
    if (res.status === 1) {
      setInfoEmployee(res.data);
      setModalEditEmployee(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async (
    employeeCode: string,
    infoEmployee: any
  ) => {
    setLoading(true);
    const res = await updateEmployee(employeeCode, infoEmployee);
    if (res.status === 1) {
    dispatch(setUser({ name:infoEmployee.name, avatar: infoEmployee.avatar, employeeCode: infoEmployee.employeeCode, id: infoEmployee.id })) // nên là URL

      fetchEmployees(pageSize, pageTable);
      setModalEditEmployee(false);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ModalEditEmployee
        department={departments ?? []}
        handleUpdateEmployee={handleUpdateEmployee}
        employeeInfo={infoEmployee}
        onClose={() => {
          setModalEditEmployee(false);
        }}
        open={modalEditEmployee}
      />
      <ModalLoading isOpen={loading} />
      {contextHolder}
      <div className="flex justify-between items-center flex-wrap">
        <Title level={2}>
          Danh sách nhân viên{" "}
          {isActiveFilter ? "đã kích hoạt" : " chưa kích hoạt"}
        </Title>
        <Button
          style={{ marginBottom: 16 }}
          onClick={() => setIsActiveFilter((prev) => !prev)}
        >
          Hiển thị nhân viên{" "}
          {isActiveFilter ? "chưa kích hoạt" : "đã kích hoạt"}
        </Button>
      </div>
      <div className="grid grid-cols-2 md:flex md:items-center gap-4 mb-4 w-full flex-wrap">
        <p className="font-bold  text-2xl text-[#4a4a6a] hidden md:block">
          Lọc:
        </p>
        <div className="flex gap-2 items-center flex-wrap">
          <Form.Item
            layout="horizontal"
            label={
              <p className="font-bold text-[#242424] hidden sm:block">MSNV</p>
            }
          >
            <Input
              className="w-full md:!w-[100px]"
              placeholder="MSNV"
              onChange={(e) => setFilterMSNV(e.target.value)}
              allowClear
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchEmployees(pageSize, pageTable);
                }
              }}
            />
          </Form.Item>
        </div>
        <div className="flex gap-2 items-center ">
          {/* <p className="text-sm text-[#4a4a6a] shrink-0">Tên NV:</p> */}
          <Form.Item
            layout="horizontal"
            label={
              <p className="font-bold text-[#242424] hidden sm:block">Tên NV</p>
            }
          >
            <Input
              className="w-full md:!w-[100px]"
              placeholder="Tên NV"
              allowClear
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchEmployees(pageSize, pageTable);
                }
              }}
            />
          </Form.Item>
        </div>

        <div className="!flex gap-2 items-center ">
          <Form.Item
            layout="horizontal"
            className=""
            label={
              <p className="font-bold text-[#242424] hidden sm:block">
                Bộ phận
              </p>
            }
          >
            <TreeSelect
              showSearch
              style={{ minWidth: "150px", maxWidth: "200px" }}
              value={filterDepartment}
              styles={{
                popup: { root: { maxHeight: 400, overflow: "auto" } },
              }}
              placeholder="Phòng ban"
              allowClear
              listItemScrollOffset={200}
              onChange={onChangeSelectDepartment}
              showCheckedStrategy="SHOW_ALL"
              treeData={treeData}
              onPopupScroll={onPopupScroll}
            />
          </Form.Item>
        </div>

        <div className="flex items-center w-fit">
          <Button
            className="w-full sm:w-fit flex  gap-2 items-center h-8 px-4 rounded-lg justify-center !bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer !text-white font-semibold"
            onClick={() => fetchEmployees(pageSize, pageTable)}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ y: "100%" }}
      />
      <Pagination
        align="center"
        // current={pageTable}
        pageSize={pageSize}
        total={totalTable}
        onChange={onPageChange}
        showSizeChanger
        onShowSizeChange={onPageChange}
        className="!mt-3"
      />
    </div>
  );
}
