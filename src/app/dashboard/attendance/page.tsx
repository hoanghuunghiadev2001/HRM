/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import "../../globals.css";

import React from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Pagination,
  Select,
  Table,
} from "antd";
import type { TableProps } from "antd";
import { getUserFromLocalStorage } from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { formatDateTime } from "@/components/function";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import { fetchAttendances } from "@/lib/api";
import Image from "next/image";
import { UploadOutlined } from "@ant-design/icons";

interface DataType {
  key: string;
  employeeId: number;
  employeeCode: string;
  avatar: string;
  employeeName: string;
  department: string;
  position: string;
  date: string;
  firstCheckIn: string;
  lastCheckOut?: string;
  totalHours?: number;
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
  return now.toISOString().split("T")[0];
}

export default function AttendancePage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageTable, setPageTable] = useState(1);
  const [totalTable, setTotalTable] = useState(0);
  const [listAttendance, setListAttendance] = useState<any>();
  const localUser = getUserFromLocalStorage();

  // State tập trung filter
  const [filters, setFilters] = useState({
    name: "",
    msnv: "",
    department: "",
    dateRange: [null, null] as [string | null, string | null],
  });

  const todayVN = getTodayVNDateString();

  const { styles } = useStyle();

  // Hàm fetch dữ liệu
  const handleFetchAttendances = useCallback(
    async (page: number, size: number) => {
      setLoading(true);
      try {
        const res = await fetchAttendances({
          msnv: filters.msnv,
          name: filters.name,
          department:
            localUser.role === "ADMIN"
              ? filters.department
              : localUser.workInfo.department,
          fromDate: filters.dateRange[0],
          toDate: filters.dateRange[1],
          page,
          pageSize: size,
        });
        if (res.status === 1) {
          setListAttendance(res.data);
          setTotalTable(res.data?.total ?? 0);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [filters, localUser, pageSize]
  );

  // Gọi fetch khi component mount hoặc page, size thay đổi
  useEffect(() => {
    handleFetchAttendances(pageTable, pageSize);
  }, [handleFetchAttendances, pageTable, pageSize]);

  // Biến chuyển đổi dữ liệu table
  const listAttendanceFormat = useMemo(() => {
    return (listAttendance?.data || []).map((item: any, index: string) => ({
      key: (index + 1 + (pageTable - 1) * pageSize).toString(),
      employeeId: item.employeeId,
      employeeCode: item.employeeCode,
      avatar: item.avatar,
      employeeName: item.employeeName,
      department: item.department,
      position: item.position,
      date: formatDateTime(item.date),
      firstCheckIn: formatDateTime(item.firstCheckIn),
      lastCheckOut: item.lastCheckOut ? formatDateTime(item.lastCheckOut) : "",
      totalHours: item.totalHours,
    }));
  }, [listAttendance, pageTable, pageSize]);

  // Mảng columns cho Table
  const columns: TableProps<DataType>["columns"] = [
    {
      title: "STT",
      dataIndex: "key",
      rowScope: "row",
      width: "60px",
      render: (_, record) => <p>{record.key}</p>,
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
            loading="lazy"
            src={record.avatar ? record.avatar : "/storage/avt-default.png"}
            alt="avt"
            className="h-8 w-8 rounded-[50%]"
            width={32}
            height={32}
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

  // Xử lý bỏ qua
  const changeDate = (dates: any, dateStrings: any) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: [dateStrings[0], dateStrings[1]],
    }));
  };

  // Hàm tìm kiếm, refresh dữ liệu
  const handleSearch = () => {
    setPageTable(1); // reset trang về 1
    handleFetchAttendances(1, pageSize);
  };

  // Hàm đổi trang
  const onPageChange = (page: number, size?: number) => {
    if (size) setPageSize(size);
    setPageTable(page);
  };

  // Xuất excel
  const handleExportExcel = async () => {
    try {
      const res = await fetch("/api/attendance/export", {
        method: "POST",
        body: JSON.stringify({
          week: todayVN,
          department: localUser.role === "ADMIN" ? filters.department : "",
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error("Failed to export");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "employees.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <div>
      <ModalLoading isOpen={loading} />

      {/* Tiêu đề và export */}
      <div className="w-full flex justify-between mb-4">
        <p className="font-bold text-2xl text-[#4a4a6a]">
          Danh sách chấm công:
        </p>
        <Button
          onClick={handleExportExcel}
          type="primary"
          icon={<UploadOutlined />}
        >
          <p className="hidden sm:block">Xuất file tuần này</p>
        </Button>
      </div>

      {/* Bộ lọc */}
      <div className="w-full mb-4">
        <p className="font-bold text-xl text-[#4a4a6a] mb-2">Tìm kiếm:</p>
        <div className="grid grid-cols-2 md:flex md:items-center gap-4 mb-4 px-4">
          {/* MSNV */}
          <div className="flex gap-2 items-center">
            <Form.Item
              label={<p className="font-bold hidden md:block">MSNV</p>}
            >
              <Input
                placeholder="MSNV"
                className="w-full md:!w-[80px]"
                value={filters.msnv}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, msnv: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </Form.Item>
          </div>

          {/* Tên NV */}
          <div className="flex gap-2 items-center">
            <Form.Item
              label={<p className="font-bold hidden md:block">Tên NV</p>}
            >
              <Input
                placeholder="Tên NV"
                className="w-full md:!w-[100px]"
                value={filters.name}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, name: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </Form.Item>
          </div>

          {/* Theo ngày */}
          <div className="flex gap-2 items-center col-span-2">
            <Form.Item
              label={<p className="font-bold hidden md:block">Theo ngày</p>}
            >
              <DatePicker
                format={"DD/MM/YYYY"}
                style={{ width: "100%" }}
                onChange={changeDate}
                disabledDate={(current) => current && current > dayjs()}
                value={
                  filters.dateRange[0] && filters.dateRange[1]
                    ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
                    : []
                }
              />
            </Form.Item>
          </div>

          {/* Bộ phận nếu là admin */}
          {localUser?.role === "ADMIN" && (
            <div className="flex gap-2 items-center">
              <Form.Item
                label={<p className="font-bold hidden md:block">Bộ phận</p>}
              >
                <Select
                  placeholder="Bộ phận"
                  allowClear
                  style={{ width: "100%" }}
                  value={filters.department}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, department: value }))
                  }
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

          {/* Nút tìm */}
          <button
            className="flex shrink-0 gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold"
            onClick={handleSearch}
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Bảng */}
      <Table<DataType>
        className={styles.customTable}
        columns={columns}
        dataSource={listAttendanceFormat}
        scroll={{ y: "calc(100vh - 335px)", x: "100%" }}
        pagination={false}
      />

      {/* Phân trang */}
      <div className="flex justify-center mt-3">
        <Pagination
          current={pageTable}
          pageSize={pageSize}
          total={totalTable}
          onChange={onPageChange}
          showSizeChanger
          onShowSizeChange={onPageChange}
        />
      </div>
    </div>
  );
}
