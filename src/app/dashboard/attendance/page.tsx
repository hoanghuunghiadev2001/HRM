/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import "../../globals.css";

import React from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Pagination,
  Table,
  TreeSelect,
  Tabs,
  Upload,
  message,
  Popconfirm,
} from "antd";
import type { TableProps } from "antd";
import ModalLoading from "@/components/modalLoading";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import { fetchAttendances } from "@/lib/api";
import { AttendanceResponse2, Department } from "@/lib/interface";
import Image from "next/image";
import {
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { TreeSelectProps } from "antd/lib";
import { useAppSelector } from "@/store/hook";
import { formatDateTime } from "@/utils/formatDateTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";


dayjs.extend(utc);
dayjs.extend(timezone);

interface DataType {
  key: string;
  employeeId: number;
  employeeCode: string;
  avatar: string;
  employeeName?: string;
  department: string;
  position: string;
  date: string;
  firstCheckIn: string;
  lastCheckOut?: string;
  totalHours?: number;
}

interface ImportHistory {
  id: number;
  fileName: string;
  importedBy: string;
  importedAt: string;
  recordCount: number;
}

const useStyle = createStyles((utils) => {
  const { css, token } = utils;
  const antCls = (token as any).antCls || ".ant";

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

// utils/getTodayVN.ts
function getTodayVNDateString() {
  const now = new Date();
  const vietnamOffset = 7 * 60; // UTC+7
  const localOffset = now.getTimezoneOffset();
  const diff = vietnamOffset + localOffset;
  now.setMinutes(now.getMinutes() + diff);
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
}

export default function AttendancePage() {
  const { role, department, departmentID, name } = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageTable, setPageTable] = useState(1);
  const [totalTable, setTotalTable] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>();
  const todayVN = getTodayVNDateString();

  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [listAttendance, setListAttendance] = useState<AttendanceResponse2>();

  const [departments, setDepartments] = useState<Department[]>([]);

  // ===== Thêm state lịch sử import =====
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);

  const onChangeSelectDepartment = (newValue: string) => {
    setFilterDepartment(newValue);
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

  const onPopupScroll: TreeSelectProps["onPopupScroll"] = (e) => {
    console.log("onPopupScroll", e);
  };

  const { RangePicker } = DatePicker;
  const maxDate = dayjs();
  const { styles } = useStyle();

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
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: "80px",
    },
    {
      title: "Tên NV",
      dataIndex: "employeeName",
      key: "employeeName",
      width: "200px",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Image
            src={record.avatar ? record.avatar : "/storage/avt-default.webp"}
            alt="avt"
            className="h-8 w-8 rounded-[50%] object-cover"
            width={32}
            height={32}
            quality={70}
            priority={false}
          />
          <a>{record.employeeName}</a>
        </div>
      ),
    },
    {
      title: "Bộ phận",
      dataIndex: "department",
      key: "department",
      width: "80px",
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      width: "120px",
    },
    {
      title: "Giờ vào",
      dataIndex: "firstCheckIn",
      key: "firstCheckIn",
      width: "120px",
    },
    {
      title: "Giờ ra",
      dataIndex: "lastCheckOut",
      key: "lastCheckOut",
      width: "120px",
    },
    {
      title: "Tổng giờ",
      dataIndex: "totalHours",
      key: "totalHours",
      width: "80px",
    },
  ];

  const handleFetchAttendances = async (
    pageTable: number,
    pageSize: number
  ) => {
    setLoading(true);
    const res = await fetchAttendances({
      msnv: filterMSNV,
      name: role === "USER" ? name ?? '' : filterName,
      department:
        role === "ADMIN" ? filterDepartment : departmentID ?? '',
      fromDate: timeStart,
      toDate: timeEnd,
      page: pageTable,
      pageSize,
    });
    if (res.status === 1) {
      setListAttendance(res.data);
      setTotalTable(res.data?.total ?? 1);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const onPageChange = (page: number, pageSizeEnter?: number) => {
    if (pageSizeEnter) {
      setPageSize(pageSizeEnter);
      handleFetchAttendances(page, pageSizeEnter);
    } else {
      setPageTable(page);
      handleFetchAttendances(page, pageSize);
    }
  };

  const listDepartment = async () => {
    const res = await fetch("/api/departments");
    if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
    const departmentsData = await res.json();
    setDepartments(departmentsData);
  };

  // ===== Thêm fetch lịch sử import =====
  const fetchImportHistory = async () => {
    const res = await fetch("/api/attendance/import");
    if (res.ok) {
      setImportHistory(await res.json());
    }
    setLoading(false);
  };

  const deleteImportHistory = async (id: number) => {
    setLoading(true);
    const res = await fetch(`/api/attendance/import/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setLoading(false);
      message.success("Xóa lịch sử thành công");
      fetchImportHistory();
    } else {
      setLoading(false);
      message.error("Xóa thất bại");
    }
    setLoading(false);
  };

  // ===== Upload Excel =====
  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx,.xls",
    action: "/api/attendance/upload",
    showUploadList: false,
    onChange(info: any) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} tải lên thành công`);
        fetchImportHistory();
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} tải lên thất bại`);
      }
    },
  };

  useEffect(() => {
    listDepartment();
    handleFetchAttendances(pageTable, pageSize);
    fetchImportHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatted: DataType[] =
    listAttendance?.data.map((item, index) => ({
      key: (index + 1).toString(),
      employeeId: item.employeeId,
      employeeCode: item.employeeCode,
      avatar: item.avatar,
      employeeName: item.employeeName,
      department: item.department,
      position: item.position,
      date: formatDateTime(item.date),
      firstCheckIn: formatDateTime(item.firstCheckIn),
      lastCheckOut: item.lastCheckOut
        ? formatDateTime(item.lastCheckOut ?? "")
        : "",
      totalHours: item.totalHours,
    })) || [];
  const formatToVNDate = (date: Date) => {
    return dayjs(date).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
  };
  const changeDate = (dates: any, dateStrings: [string, string]) => {
    if (!dates || dates.length !== 2) return;

    // Chuyển từ VN timezone sang UTC
    const startUTC = dates[0].tz("Asia/Ho_Chi_Minh").utc().format("YYYY-MM-DD");
    const endUTC = dates[1].tz("Asia/Ho_Chi_Minh").utc().format("YYYY-MM-DD");

    setTimeStart(startUTC);
    setTimeEnd(endUTC);

    console.log("Start:", startUTC, "End:", endUTC);
  };


  const handleExportExcel = async () => {
    const res = await fetch("/api/attendance/export", {
      method: "POST",
      body: JSON.stringify({
        week: todayVN,
        department: role ? "" : department ?? '',
      }),
      headers: { "Content-Type": "application/json" },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===== Table lịch sử import =====
  const historyColumns: TableProps<ImportHistory>["columns"] = [
    { title: "ID", dataIndex: "id", width: "60px" },
    { title: "Tên file", dataIndex: "fileName", width: "200px" },
    { title: "Người import", dataIndex: "importedBy", width: "150px" },
    { title: "Ngày import", dataIndex: "importedAt", width: "180px" },
    { title: "Số bản ghi", dataIndex: "recordCount", width: "100px" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc muốn xóa?"
          onConfirm={() => deleteImportHistory(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <ModalLoading isOpen={loading} />

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Danh sách chấm công",
            children: (
              <div>
                <div className="w-full flex justify-between">
                  <p className="font-bold  text-2xl text-[#4a4a6a]">
                    Danh sách chấm công:
                  </p>
                  {role === "ADMIN" ? (
                    <div className="flex gap-2">
                      <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Upload Excel</Button>
                      </Upload>
                      <Button
                        onClick={handleExportExcel}
                        type="primary"
                        icon={<DownloadOutlined />}
                      >
                        <p className="hidden sm:block">Xuất file tuần này</p>
                      </Button>
                    </div>
                  ) : ''}

                </div>

                {/* Bộ lọc + bảng danh sách giữ nguyên code cũ */}
                <div className="w-full">
                  <p className="font-bold  text-xl text-[#4a4a6a]">Tìm kiếm:</p>
                  <div className="grid grid-cols-2 md:flex md:items-center gap-4 mb-4 w-full mt-2 pl-0 md:px-4 flex-wrap">
                    {/* MSNV */}
                    <div className={`${role === "USER" ? 'hidden' : ''} flex gap-2 items-center`}>
                      <Form.Item
                        layout="horizontal"
                        label={
                          <p className="font-bold text-[#242424] hidden md:block">
                            MSNV
                          </p>
                        }
                      >
                        <Input
                          className=" w-full md:!w-[80px]"
                          placeholder="MSNV"
                          onChange={(e) => setFilterMSNV(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleFetchAttendances(pageTable, pageSize);
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                    {/* Tên NV */}
                    <div className={`${role === "USER" ? 'hidden' : ''} flex gap-2 items-center`}>
                      <Form.Item
                        layout="horizontal"
                        label={
                          <p className="font-bold text-[#242424] hidden md:block">
                            Tên NV
                          </p>
                        }
                      >
                        <Input
                          className="w-full md:!w-[100px]"
                          placeholder="Tên NV"
                          onChange={(e) => setFilterName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleFetchAttendances(pageTable, pageSize);
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                    {/* Ngày */}
                    <div className="!flex gap-2 items-center col-span-2">
                      <Form.Item
                        layout="horizontal"
                        name="range-picker"
                        className="w-full"
                        label={
                          <p className="font-bold text-[#242424] hidden md:block">
                            Theo ngày
                          </p>
                        }
                      >
                        <RangePicker
                          format="DD/MM/YYYY"
                          onChange={changeDate}
                        />
                      </Form.Item>
                    </div>
                    {/* Bộ phận */}
                    {role === "ADMIN" ? (
                      <div className="!flex gap-2 items-center ">
                        <Form.Item
                          layout="horizontal"
                          label={
                            <p className="font-bold text-[#242424] hidden md:block">
                              Bộ phận
                            </p>
                          }
                        >
                          <TreeSelect
                            showSearch
                            style={{ minWidth: "150px", maxWidth: "200px" }}
                            value={filterDepartment}
                            styles={{
                              popup: {
                                root: { maxHeight: 400, overflow: "auto" },
                              },
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
                    ) : (
                      ""
                    )}
                    <button
                      className="flex ml-4 md:ml-0 shrink-0 gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold"
                      onClick={() => {
                        handleFetchAttendances(pageTable, pageSize);
                      }}
                    >
                      Tìm kiếm
                    </button>
                  </div>

                  {/* Bảng danh sách chấm công */}
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
                    pageSize={pageSize}
                    total={totalTable}
                    onChange={onPageChange}
                    showSizeChanger
                    onShowSizeChange={onPageChange}
                    className="!mt-3"
                  />
                </div>
              </div>
            ),
          },
          ...(role === "ADMIN"
            ? [
              {
                key: "2",
                label: "Lịch sử import",
                children: (
                  <Table<ImportHistory>
                    rowKey="id"
                    columns={historyColumns}
                    dataSource={importHistory}
                    pagination={false}
                    size="small"
                  />
                ),
              },
            ]
            : []),
        ]}
      />
    </div>
  );
}
