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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [batchSize, setBatchSize] = useState(10);

  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setDepartment] = useState("");

  const [file, setFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [result, setResult] = useState<{
    success: number;
    updated: number;
    created: number;
    errors: Array<{ row: number; message: string }>;
    total: number;
  } | null>(null);

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
      getEmployeeSumary(pageTable, pageSize);
      addEmployeeSuccess();
      setLoading(false);
      message.success("Tải file thành công");

      // Nếu cần gửi request xoá file trên server thì làm ở đây
      // await fetch(`/api/employees/deletefile?filename=${file.name}`, { method: "DELETE" });
    },
    onerror: async () => {
      addEmployeeErr();
      setLoading(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
    handleUpload();
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    console.log(10);

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

          console.log(30);

          // Find header row and process data
          const { jsonData, headerRowIndex } = processExcelData(rawData);

          console.log(50);

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

            const batchResult = await fetch("/api/employees/upfile", {
              method: "POST",
              body: formData,
            }).then((res) => res.json());

            // Update progress and results
            result.success += batchResult.success;
            result.updated += batchResult.updated;
            result.created += batchResult.created;
            result.errors = [...result.errors, ...batchResult.errors];

            console.log(50 + Math.floor((i / jsonData.length) * 50));
          }

          console.log(100);
          setResult(result);
        } catch (error) {
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

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Upload failed:", error);
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
          {localUser.role === "ADMIN" && (
            <Button onClick={handleExportExcel} icon={<DownloadOutlined />}>
              Download
            </Button>
          )}
          {localUser.role === "ADMIN" && (
            <Upload {...props} action="/api/employees/upfile">
              <Button type="primary" icon={<UploadOutlined />}>
                Upload
              </Button>
            </Upload>
          )}

          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
          />

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
          {localUser.role === "ADMIN" && (
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
          )}

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
