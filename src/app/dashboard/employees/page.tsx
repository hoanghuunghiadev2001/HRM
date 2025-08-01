/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import React from "react";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  // Select,
  Table,
  TreeSelect,
  TreeSelectProps,
} from "antd";
import { TableProps } from "antd";
import {
  EmployeesSumary,
  fetchEmployeeSummary,
  getUserFromLocalStorage,
} from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { ListCollapse, PlusIcon } from "lucide-react";
import { createStyles } from "antd-style";
import ModalAddNewEmployee from "@/components/addNewEmployee";
import { fetchEmployeeByCode, updateEmployee } from "@/lib/api";
import { Department, InfoEmployee } from "@/lib/interface";
import ModalEditEmployee from "@/components/modalEditEmployee";
import Image from "next/image";
import { MenuProps } from "antd/lib";
import {
  DownloadOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { setUser } from "@/store/slices/userSlice";

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalEditEmployee, setModalEditEmployee] = useState<boolean>(false);
  const [workStatus, setWorkStatus] = useState<string>();
  const dispatch = useAppDispatch();
  const { role } = useAppSelector((state) => state.user);

  const [modal, contextHolder] = Modal.useModal();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [batchSize, setBatchSize] = useState(10);

  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setDepartment] = useState<string>();

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

  // const [value, setValue] = useState<string>();

  const onChangeSelectDepartment = (newValue: string) => {
    setDepartment(newValue);
  };

  const onPopupScroll: TreeSelectProps["onPopupScroll"] = (e) => {
    console.log("onPopupScroll", e);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [result, setResult] = useState<{
    success: number;
    updated: number;
    created: number;
    errors: Array<{ row: number; message: string }>;
    total: number;
  } | null>(null);

  const { styles } = useStyle();

  // lấy nhân viên
  const getEmployeeSumary = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const res = await fetchEmployeeSummary({
        workStatus: workStatus ?? "",
        role: role,
        department:
          role === "ADMIN"
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
      department: item.workInfo.department?.name ?? "",
      position: item.workInfo.position?.name ?? "",
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
      width: "200px",
      render: (_, record) => (
        <div
          className="flex gap-2 items-center"
          onClick={() => getInforEmployee(record.MSNV)}
        >
          <Image
            loading="lazy"
            src={record.avatar ? record.avatar : "/storage/avt-default.webp"}
            alt=""
            className="h-8 w-8 border-1 border-[#999999] rounded-[50%] shrink-0 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/storage/avt-default.webp";
            }}
            width={32}
            height={32}
            quality={70} // giảm chất lượng xuống chút để nhẹ hơn
            priority={false}
          />
          <a className="">{record.name}</a>
        </div>
      ),
    },
    {
      title: "Bộ phận",
      dataIndex: "department",
      key: "department",
      width: "100px",
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      width: "120px",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: "80px",
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
            key: "2",
            label: "Chi tiết",
            icon: <InfoCircleOutlined />,
            onClick: () => getInforEmployee(record.MSNV), // Giả sử bạn tạo state để lưu nhân viên đang thao tác,
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

  // //Xóa nhân sự
  // const handleDeleteEmployee = async (employeeCode: string) => {
  //   setLoading(true);
  //   const res = await deleteEmployeeApi(employeeCode);
  //   if (res.status === 1) {
  //     getEmployeeSumary(pageTable, pageSize);
  //     countDownDelete();
  //     setLoading(false);
  //   } else {
  //     setLoading(false);
  //   }
  // };

  //cập nhật nhân viên
  const handleUpdateEmployee = async (
    employeeCode: string,
    infoEmployee: any
  ) => {
    setLoading(true);
    const res = await updateEmployee(employeeCode, infoEmployee);
    if (res.status === 1) {
      dispatch(setUser({ name: infoEmployee.name, avatar: infoEmployee.avatar, employeeCode: infoEmployee.employeeCode, id: infoEmployee.id })) // nên là URL
      getEmployeeSumary(pageTable, pageSize);
      setModalEditEmployee(false);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const addEmployeeErr = () => {
    let secondsToGo = 3;

    const instance = modal.error({
      title: "Thêm nhân sự không thành công",
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  const addEmployeeSuccess = () => {
    let secondsToGo = 3;

    const instance = modal.success({
      title: "Thêm nhân sự thành công",
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  // const countDownDelete = () => {
  //   let secondsToGo = 3;

  //   const instance = modal.success({
  //     title: "Xóa nhân sự thành công",
  //   });

  //   const timer = setInterval(() => {
  //     secondsToGo -= 1;
  //   }, 1000);

  //   setTimeout(() => {
  //     clearInterval(timer);
  //     instance.destroy();
  //   }, secondsToGo * 1000);
  // };

  //show modal thành công
  // const countDown = () => {
  //   let secondsToGo = 3;

  //   const instance = modal.success({
  //     title: "Đổi mật khẩu thành công",
  //   });

  //   const timer = setInterval(() => {
  //     secondsToGo -= 1;
  //   }, 1000);

  //   setTimeout(() => {
  //     clearInterval(timer);
  //     instance.destroy();
  //   }, secondsToGo * 1000);
  // };

  //Đổi mật khẩu cho nhân viên
  // const handleChangePassword = async (newPassword: string) => {
  //   setLoading(true);
  //   const result = await changeEmployeePassword(
  //     employeeCodeChoose,
  //     newPassword
  //   );

  //   if (result.status === 1) {
  //     setLoading(false);
  //     setModalChangePassEmployee(false);
  //     countDown();
  //   } else {
  //     setLoading(false);
  //     form.setFields([
  //       {
  //         name: "newPassword",
  //         errors: ["Không thành công"],
  //       },
  //       {
  //         name: "renewPassword",
  //         errors: ["Không thành công"],
  //       },
  //     ]);
  //   }
  // };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setLoading(true);

    try {
      // Process the file in chunks on the client side
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array", cellDates: true });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];

          // Get all data as an array of arrays
          const rawData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
            header: 1,
            defval: null,
            raw: false,
          });

          // Find header row and process data
          const { jsonData, headerRowIndex } = processExcelData(rawData);

          // Process in batches of 10 rows at a time
          const result = {
            success: 0,
            updated: 0,
            created: 0,
            errors: [] as Array<{ row: number; message: string }>,
            total: jsonData.length,
          };

          for (let i = 0; i < jsonData.length; i += batchSize) {
            const batch = jsonData.slice(i, i + batchSize);

            // Send batch to server
            const formData = new FormData();
            formData.append("batch", JSON.stringify(batch));
            formData.append("headerRowIndex", headerRowIndex.toString());

            const batchResult = await fetch("/api/employees/import-batch", {
              method: "POST",
              body: formData,
            }).then((res) => res.json());

            // Update progress and results
            result.success += batchResult.success;
            result.updated += batchResult.updated;
            result.created += batchResult.created;
            result.errors = [...result.errors, ...batchResult.errors];
          }

          addEmployeeSuccess();
          setResult(result);
        } catch (error) {
          addEmployeeErr();
          console.error("Processing failed:", error);
          setResult({
            success: 0,
            updated: 0,
            created: 0,
            errors: [{ row: 0, message: "Có lỗi xảy ra khi xử lý file" }],
            total: 0,
          });
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(e.target.files?.[0]);
    } catch (error) {
      console.error("Upload failed:", error);
      addEmployeeErr();
      setResult({
        success: 0,
        updated: 0,
        created: 0,
        errors: [{ row: 0, message: "Có lỗi xảy ra khi xử lý file" }],
        total: 0,
      });
      setLoading(false);
    }
  };

  // hàm processExcell
  const processExcelData = (rawData: any[][]) => {
    // Find the row with headers - look for key identifiable columns
    let headerRowIndex = -1;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && row.length > 0) {
        // Convert row to string and check for key headers
        const rowString = row.join("|").toLowerCase();

        // Look for multiple possible header indicators
        const hasPositionHeader =
          rowString.includes("chức vụ") || rowString.includes("position");
        const hasDateHeader =
          rowString.includes("ngày vào") || rowString.includes("joined");
        const hasNameHeader =
          rowString.includes("tên") ||
          rowString.includes("name") ||
          rowString.includes("họ tên");
        const hasCodeHeader =
          rowString.includes("mã nv") ||
          rowString.includes("employee") ||
          rowString.includes("code");

        // If we find at least 2 key headers, this is likely the header row
        const headerCount = [
          hasPositionHeader,
          hasDateHeader,
          hasNameHeader,
          hasCodeHeader,
        ].filter(Boolean).length;

        if (headerCount >= 2) {
          headerRowIndex = i;
          console.log(
            `Found header row at index ${headerRowIndex} with headers:`,
            row
          );
          break;
        }
      }
    }
    if (headerRowIndex === -1) {
      // If we can't find headers automatically, let's try a different approach
      // Look for the first row that has substantial content and isn't just numbers
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i];
        if (row && row.length > 5) {
          const hasText = row.some(
            (cell) =>
              cell &&
              typeof cell === "string" &&
              cell.length > 2 &&
              isNaN(Number(cell))
          );

          if (hasText && !row.every((cell) => !isNaN(Number(cell)))) {
            headerRowIndex = i;
            console.log(
              `Using row ${headerRowIndex} as header row (fallback):`,
              row
            );
            break;
          }
        }
      }
    }

    if (headerRowIndex === -1) {
      throw new Error(
        "Could not identify header row in Excel file. Please ensure your file has proper column headers."
      );
    }

    // Use the identified row as headers
    const headers = rawData[headerRowIndex];

    // Skip the header row and the next row (column numbers), start from the data rows
    const dataRows = rawData
      .slice(headerRowIndex + 2)
      .filter((row) => row && row.length > 0 && row.some((cell) => cell));

    // Convert to objects using the headers
    const jsonData = dataRows.map((row, index) => {
      const obj: Record<string, any> = {};
      headers.forEach((header, headerIndex) => {
        if (header && headerIndex < row.length) {
          obj[header.toString()] = row[headerIndex];
        }
      });

      // Add row index for debugging
      obj["_rowIndex"] = headerRowIndex + 3 + index;

      return obj;
    });

    return { jsonData, headerRowIndex };
  };
  // lấy danh sách bộ phận
  const listDepartment = async () => {
    const res = await fetch("/api/departments");
    if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
    const departmentsData = await res.json(); //
    setDepartments(departmentsData);
  };

  useEffect(() => {
    getEmployeeSumary(1, 10);
  }, [workStatus]);

  useEffect(() => {
    getEmployeeSumary(pageTable, pageSize);
    listDepartment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <ModalLoading isOpen={loading} />
      <ModalEditEmployee
        department={departments ?? []}
        handleUpdateEmployee={handleUpdateEmployee}
        employeeInfo={infoEmployee}
        onClose={() => {
          setModalEditEmployee(false);
          getEmployeeSumary(pageTable, pageSize);
        }}
        open={modalEditEmployee}
      />
      <ModalAddNewEmployee
        department={departments ?? []}
        onClose={() => { setModalAddEmployee(false); getEmployeeSumary(pageTable, pageSize); }}
        open={modalAddEmployee}
      />
      <ModalLoading isOpen={loading} />
      {contextHolder}
      <div className="w-full flex justify-between items-center">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          Danh sách nhân viên{" "}
          {workStatus === "OFFICIAL"
            ? "chính thức"
            : workStatus === "PROBATION"
              ? "học việc"
              : workStatus === "RESIGNED"
                ? "nghỉ việc"
                : "đang làm việc"}{" "}
          :
        </p>

        <Select
          showSearch
          placeholder="Trạng thái"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          allowClear
          onChange={(e) => {
            setWorkStatus(e);
          }}
          options={[
            { value: "OFFICIAL", label: "Chính thức" },
            { value: "PROBATION", label: "Học việc" },
            { value: "RESIGNED", label: "Nghỉ việc" },
          ]}
        />
      </div>
      <div className="w-full  mt-4 ">
        <div className="flex justify-end items-start mb-3 gap-4  w-full flex-wrap">
          {localUser?.role === "ADMIN" && (
            <Button onClick={handleExportExcel} icon={<DownloadOutlined />}>
              <p className="hidden sm:block">Download</p>
            </Button>
          )}

          {localUser?.role === "ADMIN" && (
            <label htmlFor="file-upload" className="relative inline-block">
              <Button icon={<UploadOutlined />}>
                <p className="hidden sm:block">Upload</p>
              </Button>
              <input
                type="file"
                id="file-upload"
                className="opacity-0 absolute z-10 w-full h-full top-0 right-0"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
              />
            </label>
          )}

          <Button
            className="flex relative  gap-2 items-center h-8 px-4 rounded-lg !bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer !text-white font-semibold"
            onClick={() => {
              setModalAddEmployee(true);
            }}
          >
            <PlusIcon />
            <p className="hidden sm:block">Thêm nhân sự</p>
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
                allowClear
                onChange={(e) => setFilterMSNV(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    getEmployeeSumary(pageTable, pageSize);
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
                <p className="font-bold text-[#242424] hidden sm:block">
                  Tên NV
                </p>
              }
            >
              <Input
                className="w-full md:!w-[100px]"
                placeholder="Tên NV"
                allowClear
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    getEmployeeSumary(pageTable, pageSize);
                  }
                }}
              />
            </Form.Item>
          </div>
          {localUser?.role === "ADMIN" && (
            <div className="!flex gap-2 items-center ">
              <Form.Item
                className=""
                layout="horizontal"
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
          )}

          <div className="flex items-start w-fit">
            <Button
              className="w-full sm:w-fit flex  gap-2 items-center h-8 px-4 rounded-lg justify-center !bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer !text-white font-semibold"
              onClick={() => getEmployeeSumary(pageTable, pageSize)}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
        <Table<DataType>
          className={styles.customTable}
          columns={columns}
          dataSource={formatted ?? []}
          scroll={{ y: "calc(100vh - 335px)", x: "100%" }}
          pagination={false}
          size="small"
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
