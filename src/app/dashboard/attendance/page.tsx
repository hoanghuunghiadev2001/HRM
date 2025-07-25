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
} from "antd";
import type { TableProps } from "antd";
import { getUserFromLocalStorage } from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { formatDateTime } from "@/components/function";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import { fetchAttendances } from "@/lib/api";
import { AttendanceResponse, Department } from "@/lib/interface";
import Image from "next/image";
import { DownloadOutlined } from "@ant-design/icons";
import { TreeSelectProps } from "antd/lib";
import { useAppSelector } from "@/store/hook";

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
  const { role } = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageTable, setPageTable] = useState(1);
  const [totalTable, setTotalTable] = useState(0);
  const localUser = getUserFromLocalStorage();
  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>();
  const todayVN = getTodayVNDateString();

  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [listAttendance, setListAttendance] = useState<AttendanceResponse>();

  const [departments, setDepartments] = useState<Department[]>([]);
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
            quality={70} // giảm chất lượng xuống chút để nhẹ hơn
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
      name: filterName,
      department:
        role
          ? filterDepartment
          : localUser.workInfo.department,
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

  // //xem chi tiết đơn xin nghỉ
  // const DetailRequetsLeave = (id: number) => {
  //   const item = allRequestsApproved?.data?.find((item) => item.id === id);
  //   setInfoRequestLeave(item);
  //   setModalDetailLeave(true);
  // };

  // // chức năng phê duyệt đơn xin nghỉ
  // const putApprovedRequest = async (
  //   id: number | string,
  //   statusRequest: string
  // ) => {
  //   setLoading(true);
  //   try {
  //     await approveLeaveRequest(id, statusRequest, localUser.name);
  //     await getApiAllRequestsApproved(pageTable, pageSize);
  //     await getApiAllRequestsNeed();
  //     setLoading(false);
  //   } catch (err) {
  //     console.error("Lỗi:", err);
  //     setLoading(false);
  //   }
  // };

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
    const departmentsData = await res.json(); //
    setDepartments(departmentsData);
  };
  useEffect(() => {
    listDepartment();
    handleFetchAttendances(pageTable, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //style table scroll

  // const { data, isLoading, error } = useAttendances(
  //   {
  //     msnv: filterMSNV,
  //     name: filterName,
  //     deparment: role ? "" : localUser.deparment,
  //     fromDate: timeStart,
  //     toDate: timeEnd,
  //     page: pageTable,
  //     pageSize,
  //   },
  //   enabledSearch || initialLoad
  // );

  const formatted: DataType[] =
    listAttendance?.data.map((item, index) => ({
      key: (index + 1).toString(),
      employeeId: item.employeeId,
      employeeCode: item.employeeCode,
      avatar: item.avatar,
      employeeName: item.employeeName,
      department: item.department.name,
      position: item.position.name,
      date: formatDateTime(item.date),
      firstCheckIn: formatDateTime(item.firstCheckIn),
      lastCheckOut: item.lastCheckOut
        ? formatDateTime(item.lastCheckOut ?? "")
        : "",

      totalHours: item.totalHours,
    })) || [];

  const changeDate = (value: any, dateString: any) => {
    setTimeStart(dateString[0]);
    setTimeEnd(dateString[1]);
  };

  const handleExportExcel = async () => {
    const res = await fetch("/api/attendance/export", {
      method: "POST",
      body: JSON.stringify({
        week: todayVN, // Ngày bất kỳ trong tuần muốn xuất
        department: role ? "" : localUser.department, // Hoặc bỏ trống nếu xuất toàn bộ
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

  return (
    <div>
      <ModalLoading isOpen={loading} />

      <div className="w-full flex justify-between">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          Danh sách chấm công:
        </p>
        <Button
          onClick={handleExportExcel}
          type="primary"
          icon={<DownloadOutlined />}
        >
          <p className="hidden sm:block">Xuất file tuần này</p>
        </Button>
      </div>
      <div className="w-full">
        <p className="font-bold  text-xl text-[#4a4a6a]">Tìm kiếm:</p>
        <div className="grid grid-cols-2 md:flex md:items-center gap-4 mb-4 w-full mt-2 px-4 flex-wrap">
          <div className="flex gap-2 items-center">
            <Form.Item
              layout="horizontal"
              label={
                <p className="font-bold text-[#242424] hidden md:block">MSNV</p>
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
          <div className="flex gap-2 items-center ">
            {/* <p className="text-sm text-[#4a4a6a] shrink-0">Tên NV:</p> */}
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
                format={"DD/MM/YYYY"}
                className="w-full"
                lang="vn"
                onChange={changeDate}
                disabledDate={(current) => {
                  return current && current > maxDate;
                }}
              />
            </Form.Item>
          </div>
          {localUser?.role === "ADMIN" ? (
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
          ) : (
            ""
          )}
          <button
            className="flex shrink-0 gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold"
            onClick={() => {
              handleFetchAttendances(pageTable, pageSize);
            }}
          >
            Tìm kiếm
          </button>
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
