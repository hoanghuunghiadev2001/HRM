/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";

import React from "react";
import { Form, Input, Pagination, Select, Space, Table } from "antd";
import type { TableProps } from "antd";
import {
  EmployeesSumary,
  fetchEmployeeSummary,
  getUserFromLocalStorage,
} from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { PlusIcon } from "lucide-react";
import { createStyles } from "antd-style";
import ModalAddNewEmployee from "@/components/addNewEmployee";
import { fetchEmployeeByCode, updateEmployee } from "@/lib/api";
import { InfoEmployee } from "@/lib/interface";
import ModalEditEmployee from "@/components/modalEditEmployee";
import Image from "next/image";

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

  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setDepartment] = useState("");

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

  const { styles } = useStyle();

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
            className="h-8 w-8 border-1 border-[#999999] rounded-[50%] flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/storage/avt-default.png";
            }}
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
      title: "Chi tiết",
      key: "action",
      width: "80px",
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              getInforEmployee(record.MSNV);
            }}
          >
            chi tiết
          </a>
        </Space>
      ),
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

  const handleUpdateEmployee = async (
    employeeCode: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  useEffect(() => {
    getEmployeeSumary(pageTable, pageSize);
  }, []);

  return (
    <div>
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

      <div className="w-full">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          Danh sách nhân viên:
        </p>
      </div>
      <div className="w-full">
        <div className="flex justify-end mb-3  w-full">
          <button
            className="flex mt-4 relative  gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold"
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
