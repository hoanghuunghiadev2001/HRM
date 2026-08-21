/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";

import React from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Pagination,
  Row,
  Table,
  Tabs,
  Upload,
  TreeSelect,
  message,
  Popconfirm,
} from "antd";
import type { TableProps } from "antd";
import {
  CalendarOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilterOutlined,
  HistoryOutlined,
  IdcardOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import ModalLoading from "@/components/modalLoading";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import { fetchAttendances } from "@/lib/api";
import { AttendanceResponse2, Department } from "@/lib/interface";
import Image from "next/image";
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

export interface ImportHistory {
  id: number;
  filename: string;
  importedAt: string;
  recordCount: number;
  importedBy: ImportedBy | null;
}

export interface ImportedBy {
  code: string;
  name: string;
}

const BRAND_GRADIENT = "linear-gradient(135deg, #4c809e 0%, #001935 100%)";

const useStyle = createStyles((utils) => {
  const { css, token } = utils;
  const antCls = (token as any).antCls || ".ant";

  return {
    customTable: css`
      ${antCls}-table {
        border-radius: 0 !important;

        ${antCls}-table-thead > tr > th {
          background: #f8fafc !important;
          color: #475569;
          font-weight: 600;
          font-size: 13px;
          border-bottom: 1px solid #eef0f3 !important;
        }

        ${antCls}-table-thead
        > tr
          > th:not(:last-child):not(${antCls}-table-selection-column)::before {
          display: none;
        }

        ${antCls}-table-tbody > tr > td {
          font-size: 13.5px;
          color: #1f2937;
        }

        ${antCls}-table-tbody > tr:hover > td {
          background: #f6f9fc !important;
        }

        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #d9dee5 transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
    filterCard: css`
      ${antCls}-card-body {
        padding: 20px 24px;
      }
      ${antCls}-form-item-label > label {
        font-weight: 600;
        color: #374151;
        font-size: 13px;
      }
    `,
    tabs: css`
      ${antCls}-tabs-nav::before {
        border-bottom: 1px solid #eef0f3;
      }
      ${antCls}-tabs-tab {
        font-weight: 600;
        color: #6b7280;
        padding: 10px 4px !important;
      }
      ${antCls}-tabs-tab-active ${antCls}-tabs-tab-btn {
        color: #001935 !important;
      }
      ${antCls}-tabs-ink-bar {
        background: ${BRAND_GRADIENT};
        height: 3px !important;
      }
    `,
  };
});

export default function AttendancePage() {
  const { role, department, departmentID, name, id } = useAppSelector(
    (state) => state.user,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageTable, setPageTable] = useState(1);
  const [totalTable, setTotalTable] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>();

  // 🆕 Mặc định khoảng ngày = tháng hiện tại, khớp với default phía server
  const defaultStart = dayjs().tz("Asia/Ho_Chi_Minh").startOf("month");
  const defaultEnd = dayjs().tz("Asia/Ho_Chi_Minh");

  const [timeStart, setTimeStart] = useState(defaultStart.format("YYYY-MM-DD"));
  const [timeEnd, setTimeEnd] = useState(defaultEnd.format("YYYY-MM-DD"));
  const [rangeValue, setRangeValue] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    defaultStart,
    defaultEnd,
  ]);

  const [listAttendance, setListAttendance] = useState<AttendanceResponse2>();
  const [uploading, setUploading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
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

  const onPopupScroll: TreeSelectProps["onPopupScroll"] = (e) => {};

  const { RangePicker } = DatePicker;
  const maxDate = dayjs();
  const { styles } = useStyle();

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "STT",
      dataIndex: "key",
      rowScope: "row",
      width: "56px",
      align: "center",
      render: (_) => <span className="text-[#94a3b8]">{_}</span>,
    },
    {
      title: "MSNV",
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: "90px",
      render: (text) => <span className="font-medium">{text}</span>,
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
            className="h-8 w-8 rounded-full object-cover ring-1 ring-[#eef0f3]"
            width={32}
            height={32}
            quality={70}
            priority={false}
          />
          <a className="font-medium text-[#1e4f6e] hover:text-[#4c809e]">
            {record.employeeName}
          </a>
        </div>
      ),
    },
    {
      title: "Bộ phận",
      dataIndex: "department",
      key: "department",
      width: "110px",
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      width: "130px",
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      width: "110px",
      render: (date: string) => {
        if (!date) return "-";

        // Truyền định dạng gốc của API vào tham số thứ 2
        const parsedDate = dayjs(date, "HH:mm DD-MM-YYYY");

        return parsedDate.isValid()
          ? parsedDate.format("DD/MM/YYYY")
          : "Invalid Date";
      },
    },
    {
      title: "Giờ vào",
      dataIndex: "firstCheckIn",
      key: "firstCheckIn",
      width: "130px",
      render: (v) => v || <span className="text-[#cbd5e1]">—</span>,
    },
    {
      title: "Giờ ra",
      dataIndex: "lastCheckOut",
      key: "lastCheckOut",
      width: "130px",
      render: (v) => v || <span className="text-[#cbd5e1]">—</span>,
    },
    {
      title: "Tổng giờ",
      dataIndex: "totalHours",
      key: "totalHours",
      width: "90px",
      render: (v) => (
        <span className="font-semibold text-[#1f2937]">{v ?? 0}h</span>
      ),
    },
  ];

  const handleFetchAttendances = async (
    pageTable: number,
    pageSize: number,
  ) => {
    setLoading(true);
    const res = await fetchAttendances({
      msnv: filterMSNV,
      name: role === "USER" ? (name ?? "") : filterName,
      department: role === "ADMIN" ? filterDepartment : (departmentID ?? ""),
      fromDate: timeStart,
      toDate: timeEnd,
      page: pageTable,
      pageSize,
    });
    if (res.status === 1) {
      setListAttendance(res.data);
      setTotalTable(res.data?.total ?? 0);
    }
    setLoading(false);
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

  const fetchImportHistory = async () => {
    const res = await fetch("/api/attendance/import");
    if (res.ok) {
      setImportHistory(await res.json());
    }
  };

  const deleteImportHistory = async (id: number) => {
    setLoading(true);
    const res = await fetch(`/api/attendance/import/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      message.success("Xóa lịch sử thành công");
      fetchImportHistory();
    } else {
      message.error("Xóa thất bại");
    }
    setLoading(false);
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx,.xls",
    action: "/api/attendance/upload",
    showUploadList: false,
    data: { importedById: id },
    onChange(info: any) {
      if (info.file.status === "uploading") {
        setUploading(true);
      } else if (info.file.status === "done") {
        setUploading(false);
        message.success(`${info.file.name} tải lên thành công`);
        fetchImportHistory();
        handleFetchAttendances(pageTable, pageSize);
      } else if (info.file.status === "error") {
        setUploading(false);
        message.error(`${info.file.name} tải lên thất bại`);
      }
    },
  };

  useEffect(() => {
    listDepartment();
    handleFetchAttendances(pageTable, pageSize);
    if (role === "ADMIN") fetchImportHistory();
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

  const changeDate = (dates: any, dateStrings: [string, string]) => {
    if (!dates || dates.length !== 2) {
      setRangeValue(null as any);
      setTimeStart("");
      setTimeEnd("");
      return;
    }
    const startDate = dayjs(dates[0])
      .tz("Asia/Ho_Chi_Minh")
      .format("YYYY-MM-DD");
    const endDate = dayjs(dates[1]).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");

    setRangeValue(dates);
    setTimeStart(startDate);
    setTimeEnd(endDate);
  };

  const handleExportExcel = async () => {
    const todayVN = dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
    const res = await fetch("/api/attendance/export", {
      method: "POST",
      body: JSON.stringify({
        week: todayVN,
        department: role ? "" : (department ?? ""),
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

  const handleResetFilters = () => {
    setFilterMSNV("");
    setFilterName("");
    setFilterDepartment(undefined);
    setRangeValue([defaultStart, defaultEnd]);
    setTimeStart(defaultStart.format("YYYY-MM-DD"));
    setTimeEnd(defaultEnd.format("YYYY-MM-DD"));
    setPageTable(1);
    setTimeout(() => handleFetchAttendances(1, pageSize), 0);
  };

  const hasActiveFilters = !!filterMSNV || !!filterName || !!filterDepartment;

  const historyColumns: TableProps<ImportHistory>["columns"] = [
    { title: "ID", dataIndex: "id", width: "60px" },
    { title: "Tên file", dataIndex: "filename", width: "220px" },
    {
      title: "Người import",
      dataIndex: "importedBy",
      width: "220px",
      render: (importedBy) =>
        importedBy ? `${importedBy.name} (${importedBy.code})` : "N/A",
    },
    {
      title: "Ngày import",
      dataIndex: "importedAt",
      width: "180px",
      render: (value) =>
        dayjs(value).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm"),
    },
    { title: "Số bản ghi", dataIndex: "recordCount", width: "110px" },
    {
      title: "Hành động",
      key: "action",
      width: "100px",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc muốn xóa?"
          onConfirm={() => deleteImportHistory(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-[#f7f8fa] -m-4 p-4 md:-m-6 md:p-6">
      <ModalLoading isOpen={loading} />

      {/* ===== Page header ===== */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
        <div>
          <span className="inline-block text-[11px] font-bold tracking-wider text-[#4c809e] uppercase mb-1">
            Chấm công
          </span>
          <h1 className="text-[22px] leading-tight font-bold text-[#1f2937] m-0">
            Danh sách chấm công
          </h1>
        </div>

        {role === "ADMIN" && (
          <div className="flex gap-2">
            <Upload {...uploadProps}>
              <Button
                icon={<UploadOutlined />}
                loading={uploading}
                disabled={uploading}
                size="large"
                className="!rounded-lg"
              >
                Upload Excel
              </Button>
            </Upload>
            <Button
              onClick={handleExportExcel}
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              className="!border-none !font-semibold !shadow-[0_4px_10px_rgba(0,25,53,0.25)] !rounded-lg"
              style={{ background: BRAND_GRADIENT }}
            >
              <span className="hidden sm:inline">Xuất file tuần này</span>
            </Button>
          </div>
        )}
      </div>

      <Card
        bordered={false}
        className="!rounded-2xl !shadow-[0_1px_2px_rgba(16,24,40,0.06)] !border !border-[#e8eaee] !overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          className={`${styles.tabs} px-5 pt-3`}
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: (
                <span className="flex items-center gap-2">
                  <TeamOutlined /> Danh sách chấm công
                </span>
              ),
              children: (
                <div className="px-5 pb-5">
                  {/* ===== Filter bar ===== */}
                  <Card
                    bordered={false}
                    className={`!mb-4 !mt-2 !rounded-xl !bg-[#fbfcfd] !border !border-[#eef0f3] ${styles.filterCard}`}
                  >
                    <Row gutter={[16, 12]} align="bottom">
                      {role !== "USER" && (
                        <Col xs={24} sm={12} md={4}>
                          <Form.Item label="MSNV" className="!mb-0">
                            <Input
                              prefix={
                                <IdcardOutlined className="text-[#9aa4b2]" />
                              }
                              placeholder="Mã số NV"
                              allowClear
                              value={filterMSNV}
                              onChange={(e) => setFilterMSNV(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleFetchAttendances(pageTable, pageSize);
                              }}
                            />
                          </Form.Item>
                        </Col>
                      )}

                      {role !== "USER" && (
                        <Col xs={24} sm={12} md={5}>
                          <Form.Item label="Tên NV" className="!mb-0">
                            <Input
                              prefix={
                                <UserOutlined className="text-[#9aa4b2]" />
                              }
                              placeholder="Tên nhân viên"
                              allowClear
                              value={filterName}
                              onChange={(e) => setFilterName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleFetchAttendances(pageTable, pageSize);
                              }}
                            />
                          </Form.Item>
                        </Col>
                      )}

                      <Col xs={24} sm={12} md={7}>
                        <Form.Item label="Theo ngày" className="!mb-0">
                          <RangePicker
                            className="!w-full"
                            format="DD/MM/YYYY"
                            value={rangeValue as any}
                            suffixIcon={
                              <CalendarOutlined className="text-[#9aa4b2]" />
                            }
                            onChange={changeDate}
                          />
                        </Form.Item>
                      </Col>

                      {role === "ADMIN" && (
                        <Col xs={24} sm={12} md={4}>
                          <Form.Item label="Bộ phận" className="!mb-0">
                            <TreeSelect
                              showSearch
                              className="!w-full"
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
                        </Col>
                      )}

                      <Col
                        xs={24}
                        md={role === "USER" ? 24 : 4}
                        className="flex justify-end"
                      >
                        <Form.Item className="!mb-0 w-full">
                          <div className="flex gap-2 justify-end flex-wrap">
                            <Button
                              icon={<ReloadOutlined />}
                              disabled={!hasActiveFilters}
                              onClick={handleResetFilters}
                            >
                              Xóa lọc
                            </Button>
                            <Button
                              type="primary"
                              icon={<SearchOutlined />}
                              className="!border-none !font-semibold !shadow-[0_2px_6px_rgba(0,25,53,0.2)]"
                              style={{ background: BRAND_GRADIENT }}
                              onClick={() =>
                                handleFetchAttendances(pageTable, pageSize)
                              }
                            >
                              Tìm kiếm
                            </Button>
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* ===== Data table ===== */}
                  <div className="rounded-xl border border-[#eef0f3] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#eef0f3] bg-white">
                      <span className="text-[13px] text-[#6b7280]">
                        Tổng cộng{" "}
                        <span className="font-semibold text-[#1f2937]">
                          {totalTable ?? 0}
                        </span>{" "}
                        lượt chấm công
                      </span>
                    </div>

                    <Table<DataType>
                      className={styles.customTable}
                      columns={columns}
                      dataSource={formatted ?? []}
                      scroll={{ y: "calc(100vh - 460px)", x: "100%" }}
                      pagination={false}
                      size="small"
                    />

                    <div className="px-4 py-2.5 border-t border-[#eef0f3] bg-white">
                      <Pagination
                        align="end"
                        pageSize={pageSize}
                        total={totalTable}
                        onChange={onPageChange}
                        showSizeChanger
                        onShowSizeChange={onPageChange}
                      />
                    </div>
                  </div>
                </div>
              ),
            },
            ...(role === "ADMIN"
              ? [
                  {
                    key: "2",
                    label: (
                      <span className="flex items-center gap-2">
                        <HistoryOutlined /> Lịch sử import
                      </span>
                    ),
                    children: (
                      <div className="px-5 pb-5 pt-2">
                        <div className="rounded-xl border border-[#eef0f3] overflow-hidden">
                          <Table<ImportHistory>
                            className={styles.customTable}
                            rowKey="id"
                            columns={historyColumns}
                            dataSource={importHistory}
                            pagination={false}
                            size="small"
                          />
                        </div>
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>
    </div>
  );
}
