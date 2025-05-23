/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";

import React from "react";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Table,
  Upload,
} from "antd";
import { TableProps, message } from "antd";
import {
  EmployeesSumary,
  fetchEmployeeSummary,
  getUserFromLocalStorage,
} from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { ListCollapse, PlusIcon } from "lucide-react";
import { createStyles } from "antd-style";
import ModalAddNewEmployee from "@/components/addNewEmployee";
import {
  changeEmployeePassword,
  deleteEmployeeApi,
  fetchEmployeeByCode,
  updateEmployee,
} from "@/lib/api";
import { InfoEmployee } from "@/lib/interface";
import ModalEditEmployee from "@/components/modalEditEmployee";
import Image from "next/image";
import { MenuProps } from "antd/lib";
import {
  DeleteOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  LockOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import ModalChangePassEmployee from "@/components/modalChangePassEmployee";

interface DataType {
  key: string;
  id: string;
  MSNV: string;
  name: string;
  department: string;
  position: string;
  gender: string;
  avatar: string;
}

const useStyle = createStyles((utils) => {
  const { css, token } = utils;
  const antCls = (token as any).antCls || ".ant"; // fallback nếu token.antCls không tồn tại

  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});
export default function EmployeesPage() {
  const [employeesSumary, setEmployeesSumary] = useState<EmployeesSumary[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalAddEmployee, setModalAddEmployee] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageTable, setPageTable] = useState(1);
  const [totalTable, setTotalTable] = useState();
  const [infoEmployee, setInfoEmployee] = useState<InfoEmployee>();
  const localUser = getUserFromLocalStorage();
  const [modalEditEmployee, setModalEditEmployee] = useState<boolean>(false);
  const [modalChangePassEmployee, setModalChangePassEmployee] =
    useState<boolean>(false);
  const [employeeCodeChoose, setEmployeeCodeChoose] = useState("");
  const [modal, contextHolder] = Modal.useModal();

  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setDepartment] = useState("");

  const [form] = Form.useForm();

  const { styles } = useStyle();

  const props = {
    accept: ".xls,.xlsx", // chỉ cho phép file excel
    showUploadList: false,
    beforeUpload: (file: any) => {
      setLoading(true);
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";
      if (!isExcel) {
        message.error("Bạn chỉ có thể tải lên file Excel (.xls hoặc .xlsx)!");
      }
      return isExcel || Upload.LIST_IGNORE; // nếu ko phải file excel thì ko cho upload
    },
    onChange: (info: any) => {
      if (info.file.status === "done") {
        message.success(`${info.file.name} tải lên thành công.`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} tải lên thất bại.`);
      }
    },
    onSuccess: async () => {
      setLoading(false);
      message.success("Tải file thành công");

      // Nếu cần gửi request xoá file trên server thì làm ở đây
      // await fetch(`/api/employees/deletefile?filename=${file.name}`, { method: "DELETE" });
    },
    multiple: false, // nếu muốn upload nhiều file thì đổi thành true
  };

  // lấy nhân viên
  const getEmployeeSumary = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const res = await fetchEmployeeSummary({
        role: localUser.role,
        department:
          localUser.role === "ADMIN"
            ? filterDepartment
            : localUser.workInfo.department,
        name: filterName,
        employeeCode: filterMSNV,
        page: page,
        pageSize: pageSize,
      });
      setEmployeesSumary(res.data);
      setTotalTable(res.total);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi:", err);
      setLoading(false);
    }
  };

  //format và đưa dữ liệu ra table
  const formatted: DataType[] =
    employeesSumary?.map((item, index) => ({
      key: (index + 1).toString(),
      id: item.id,
      MSNV: item.employeeCode,
      name: item.name,
      department: item.workInfo.department,
      position: item.workInfo.position,
      gender: item.gender,
      avatar: item.avatar,
    })) || [];

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "STT",
      dataIndex: "key",
      rowScope: "row",
      width: "60px",
      render: (_) => <p>{_}</p>,
    },
    {
      title: "MSNV",
      dataIndex: "MSNV",
      width: "80px",
    },
    {
      title: "Tên NV",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div className="flex gap-2 items-center">
          <Image
            src={record.avatar ? record.avatar : "/storage/avt-default.png"}
            alt=""
            className="h-8 w-8 border-1 border-[#999999] rounded-[50%] flex-shrink-0 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/storage/avt-default.png";
            }}
            width={32}
            height={32}
          />
          <a className="">{record.name}</a>
        </div>
      ),
    },
    {
      title: "Bộ phận",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (text) => (text === "MALE" ? "Nam" : "Nữ"),
    },
    {
      title: "Tùy chọn",
      key: "action",
      width: "100px",
      render: (_, record) => {
        // Tạo items menu với callback có thể dùng record
        const items: MenuProps["items"] = [
          {
            key: "1",
            label: "Đổi mật khẩu",
            icon: <LockOutlined />,
            onClick: () => {
              // Ví dụ: bạn dùng record để mở modal đổi mật khẩu của nhân viên này
              setEmployeeCodeChoose(record.MSNV);
              setModalChangePassEmployee(true);
            },
          },
          {
            key: "2",
            label: "Chi tiết",
            icon: <InfoCircleOutlined />,
            onClick: () => getInforEmployee(record.MSNV), // Giả sử bạn tạo state để lưu nhân viên đang thao tác,
          },
          {
            key: "3",
            label: "Xóa nhân sự",
            icon: <DeleteOutlined />,
            onClick: () => handleDeleteEmployee(record.MSNV), // Giả sử bạn tạo state để lưu nhân viên đang thao tác,
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

  const onPageChange = (page: number, pageSizeEnter?: number) => {
    if (pageSizeEnter) {
      setPageSize(pageSizeEnter);
      getEmployeeSumary(page, pageSizeEnter);
    } else {
      setPageTable(page);
      getEmployeeSumary(page, pageSize);
    }
  };

  //Xem thông tin nhân viên api
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

  //Xóa nhân sự
  const handleDeleteEmployee = async (employeeCode: string) => {
    setLoading(true);
    const res = await deleteEmployeeApi(employeeCode);
    if (res.status === 1) {
      getEmployeeSumary(pageTable, pageSize);
      countDownDelete();
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  //cập nhật nhân viên
  const handleUpdateEmployee = async (
    employeeCode: string,
    infoEmployee: any
  ) => {
    setLoading(true);
    const res = await updateEmployee(employeeCode, infoEmployee);
    if (res.status === 1) {
      getEmployeeSumary(pageTable, pageSize);
      setModalEditEmployee(false);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const countDownDelete = () => {
    let secondsToGo = 3;

    const instance = modal.success({
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

  //show modal thành công
  const countDown = () => {
    let secondsToGo = 3;

    const instance = modal.success({
      title: "Đổi mật khẩu thành công",
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  //Đổi mật khẩu cho nhân viên
  const handleChangePassword = async (newPassword: string) => {
    setLoading(true);
    const result = await changeEmployeePassword(
      employeeCodeChoose,
      newPassword
    );

    if (result.status === 1) {
      setLoading(false);
      setModalChangePassEmployee(false);
      countDown();
    } else {
      setLoading(false);
      form.setFields([
        {
          name: "newPassword",
          errors: ["Không thành công"],
        },
        {
          name: "renewPassword",
          errors: ["Không thành công"],
        },
      ]);
    }
  };

  //Tải danh sách nhân viên
  const handleExportExcel = async () => {
    const res = await fetch("/api/employees/downloadfile");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    getEmployeeSumary(pageTable, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <ModalChangePassEmployee
        handleChangPass={handleChangePassword}
        onClose={() => setModalChangePassEmployee(false)}
        open={modalChangePassEmployee}
      />
      <ModalLoading isOpen={loading} />
      <ModalEditEmployee
        handleUpdateEmployee={handleUpdateEmployee}
        employeeInfo={infoEmployee}
        onClose={() => {
          setModalEditEmployee(false);
        }}
        open={modalEditEmployee}
      />
      <ModalAddNewEmployee
        onClose={() => setModalAddEmployee(false)}
        open={modalAddEmployee}
      />
      <ModalLoading isOpen={loading} />
      {contextHolder}
      <div className="w-full">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          Danh sách nhân viên:
        </p>
      </div>
      <div className="w-full  mt-4 ">
        <div className="flex justify-end items-start mb-3 gap-4  w-full">
          <Button onClick={handleExportExcel} icon={<DownloadOutlined />}>
            Download
          </Button>
          <Upload {...props} action="/api/employees/upfile">
            <Button type="primary" icon={<UploadOutlined />}>
              Upload
            </Button>
          </Upload>
          <button
            className="flex relative  gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold"
            onClick={() => {
              setModalAddEmployee(true);
            }}
          >
            <PlusIcon />
            Thêm nhân sự
          </button>
        </div>
        <div className="flex items-center gap-4 mb-4 w-full">
          <p className="font-bold  text-2xl text-[#4a4a6a]">Lọc:</p>
          <div className="flex gap-2 items-center">
            <Form.Item label={<p className="font-bold text-[#242424]">MSNV</p>}>
              <Input
                className="!w-[80px]"
                placeholder="MSNV"
                onChange={(e) => setFilterMSNV(e.target.value)}
              />
            </Form.Item>
          </div>
          <div className="flex gap-2 items-center ">
            {/* <p className="text-sm text-[#4a4a6a] flex-shrink-0">Tên NV:</p> */}
            <Form.Item
              label={<p className="font-bold text-[#242424]">Tên NV</p>}
            >
              <Input
                className="!w-[100px]"
                placeholder="Tên NV"
                onChange={(e) => setFilterName(e.target.value)}
              />
            </Form.Item>
          </div>
          <div className="!flex gap-2 items-center ">
            <Form.Item
              label={<p className="font-bold text-[#242424]">Bộ phận</p>}
            >
              <Select
                onChange={(e) => setDepartment(e)}
                style={{ width: "100px" }}
                placeholder={"Bộ phận"}
                allowClear
                options={[
                  { value: "KD", label: "KD" },
                  { value: "SCC", label: "SCC" },
                  { value: "ĐS", label: "ĐS" },
                  { value: "HC", label: "HC" },
                  { value: "CV", label: "CV" },
                  { value: "PT", label: "PT" },
                  { value: "KT", label: "KT" },
                  { value: "IT", label: "IT" },
                  { value: "CS", label: "CS" },
                ]}
              />
            </Form.Item>
          </div>
          <button
            className="flex  gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold"
            onClick={() => getEmployeeSumary(pageTable, pageSize)}
          >
            Tìm kiếm
          </button>
        </div>
        <Table<DataType>
          className={styles.customTable}
          columns={columns}
          dataSource={formatted ?? []}
          scroll={{ y: "calc(100vh - 335px)" }}
          pagination={false}
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
    </div>
  );
}
