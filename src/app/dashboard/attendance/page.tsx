/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";

import React from "react";
import { DatePicker, Form, Input, Pagination, Select, Table } from "antd";
import type { TableProps } from "antd";
import { getUserFromLocalStorage } from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { formatDateTime } from "@/components/function";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import { fetchAttendances } from "@/lib/api";
import { AttendanceResponse } from "@/lib/interface";
import Image from "next/image";

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
export default function AttendancePage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageTable, setPageTable] = useState(1);
  const [totalTable, setTotalTable] = useState(0);
  const localUser = getUserFromLocalStorage();
  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [listAttendance, setListAttendance] = useState<AttendanceResponse>();

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
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Image
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
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Giờ vào",
      dataIndex: "firstCheckIn",
      key: "firstCheckIn",
    },
    {
      title: "Giờ ra",
      dataIndex: "lastCheckOut",
      key: "lastCheckOut",
    },
    {
      title: "Tổng giờ",
      dataIndex: "totalHours",
      key: "totalHours",
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
        localUser.role === "ADMIN"
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

  useEffect(() => {
    handleFetchAttendances(pageTable, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //style table scroll

  // const { data, isLoading, error } = useAttendances(
  //   {
  //     msnv: filterMSNV,
  //     name: filterName,
  //     deparment: localUser.role === "ADMIN" ? "" : localUser.deparment,
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
      department: item.department,
      position: item.position,
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

  return (
    <div>
      <ModalLoading isOpen={loading} />

      <div className="w-full">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          Danh sách phiếu yêu cầu:
        </p>
      </div>
      <div className="w-full">
        <p className="font-bold  text-xl text-[#4a4a6a]">Tìm kiếm:</p>
        <div className="flex items-center gap-4 mb-4 w-full mt-2 px-4">
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
              name="range-picker"
              label={<p className="font-bold text-[#242424]">Theo ngày</p>}
            >
              <RangePicker
                format={"DD/MM/YYYY"}
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
                label={<p className="font-bold text-[#242424]">Bộ phận</p>}
              >
                <Select
                  onChange={(e) => setFilterDepartment(e)}
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
          ) : (
            ""
          )}
          <button
            className="flex flex-shrink-0 gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold"
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
