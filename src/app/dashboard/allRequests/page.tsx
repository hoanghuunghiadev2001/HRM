/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";

import React from "react";
import { Form, Input, message, Pagination, Space, Table } from "antd";
import type { TableProps, TreeSelectProps } from "antd";
import {
  AllRequests,
  approveLeaveRequest,
  fetchLeaveRequests,
  getApiAllRequestsNeedApprove,
  getUserFromLocalStorage,
  RequestLeave,
} from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { StatusLeave } from "@/components/function";
import ModalDetailLeave from "@/components/modalDetailLeave";
import { createStyles } from "antd-style";
import ModalNeedApproved from "@/components/modalNeedApproved";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TreeSelect } from "antd/lib";
import { Department } from "@/lib/interface";

// Extend plugin
dayjs.extend(utc);
dayjs.extend(timezone);

export interface dataNeedApprove {
  leaveRequest: LeaveRequestNeedApprove;
  approversWhoApproved: ApproversWhoApproved[];
}
export interface ApproversWhoApproved {
  name: string;
  employeeCode: string;
  approvedAt: string;
  stepLevel: number;
  departmentName: string;
  positionName: string;
}

export interface LeaveRequestNeedApprove {
  id: number;
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  reason: string;
  status: string;
  approvedBy: any;
  approvedAt: any;
  createdAt: string;
  approvalSteps: ApprovalStepNeedApprove[];
  employee: EmployeeNeedApprove;
}

export interface ApprovalStepNeedApprove {
  id: number;
  leaveRequestId: number;
  level: number;
  status: string;
  approvedAt: any;
  approvers: any[];
}

export interface EmployeeNeedApprove {
  id: number;
  name: string;
  employeeCode: string;
  workInfo: WorkInfoNeedApprove;
}

export interface WorkInfoNeedApprove {
  department: Department;
  position: PositionNeedApprove;
}

export interface DepartmentNeedApprove {
  id: number;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
  headId: any;
  directorId: any;
}

export interface PositionNeedApprove {
  id: number;
  name: string;
  level: number;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
}

interface DataType {
  key: string;
  id: number;
  MSNV: string;
  name: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  leaveType: string;
  status: string;
}

const useStyle = createStyles((utils) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { css, token } = utils as { css: any; token: { antCls?: string } };
  const antCls = token.antCls || ".ant";
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

export default function AllRequestPage() {
  const [allRequestsApproved, setAllRequestsApproved] = useState<AllRequests>();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalDetailLeave, setModalDetailLeave] = useState<boolean>(false);
  const [infoRequetLeave, setInfoRequestLeave] = useState<RequestLeave>();
  const [modalNeedApproved, setModalNeedApproved] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageTable, setPageTable] = useState(1);
  const [totalTable, setTotalTable] = useState();
  const [requestsNeedApprove, setRequestsNeedApprove] = useState<
    dataNeedApprove[]
  >([]);
  const localUser = getUserFromLocalStorage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setDepartment] = useState<string>();

  const onChangeSelectDepartment = (newValue: string) => {
    setDepartment(newValue);
    console.log(newValue);
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

  const getApiAllRequestsApproved = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const res = await fetchLeaveRequests({
        // page: page,
        // pageSize: pageSize,
        // name: filterName,
        // employeeCode: filterMSNV,
        // department: "IT",
        // status: "",

        page: page,
        pageSize: pageSize,
        role: localUser.role,
        department:
          localUser.role === "ADMIN"
            ? filterDepartment
            : localUser.workInfo.department,
        employeeCode: filterMSNV,
        name: filterName,

        status: "",
      });
      setAllRequestsApproved(res);
      setTotalTable(res.total);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Lỗi:", err);
    }
  };

  const getApiAllRequestsNeed = async () => {

    setLoading(true);
    try {
      const res = await getApiAllRequestsNeedApprove({
        role: localUser.role,
        department:
          localUser.role === "ADMIN" ? "" : localUser.workInfo.department,
        name: "",
        employeeCode: localUser.id,
      });

      const data = await res;

      setRequestsNeedApprove(data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  const { styles } = useStyle();

  //format và đưa dữ liệu ra table
  const formatted: DataType[] =
    allRequestsApproved?.data?.map((item, index) => ({
      key: (index + 1).toString(),
      id: item.id,
      MSNV: item.employee.employeeCode,
      name: item.employee.name,
      startDate: dayjs
        .utc(item?.startDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm"),
      endDate: dayjs
        .utc(item?.endDate)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm"),
      totalHours: item.totalHours.toString(),
      leaveType: item.leaveType,
      status: item.status,
      approvedBy: item.approvedBy,
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
      width: "170px",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Ngày nghỉ",
      dataIndex: "startDate",
      key: "age",
      width: "170px",
    },
    {
      title: "Loại phép",
      dataIndex: "leaveType",
      key: "leaveType",
      width: "100px",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "120px",
      render: (status) => <StatusLeave status={status} />,
    },

    {
      title: "Người phê duyệt",
      dataIndex: "approvedBy",
      key: "approvedBy",
      width: "170px",
    },

    {
      title: "Chi tiết",
      key: "action",
      width: "80px",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => DetailRequetsLeave(record.id)}>chi tiết</a>
        </Space>
      ),
    },
  ];

  //xem chi tiết đơn xin nghỉ
  const DetailRequetsLeave = (id: number) => {
    const item = allRequestsApproved?.data?.find((item) => item.id === id);
    setInfoRequestLeave(item);
    setModalDetailLeave(true);
  };

  // chức năng phê duyệt đơn xin nghỉ
  const putApprovedRequest = async (
    id: number | string,
    statusRequest: string
  ) => {
    setLoading(true);
    try {
      await approveLeaveRequest(id, statusRequest, localUser.name);
      getApiAllRequestsNeed();
      setLoading(false);
    } catch (err: any) {
      console.error("Lỗi:", err);
      messageApi.open({
        type: "error",
        content: `${err}`,
      });
      getApiAllRequestsNeed();
      setLoading(false);
    }
  };

  const onPageChange = (page: number, pageSizeEnter?: number) => {
    if (pageSizeEnter) {
      setPageSize(pageSizeEnter);
      getApiAllRequestsApproved(page, pageSizeEnter);
    } else {
      setPageTable(page);
      getApiAllRequestsApproved(page, pageSize);
    }
  };

  // lấy danh sách bộ phận
  const listDepartment = async () => {
    const res = await fetch("/api/departments");
    if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
    const departmentsData = await res.json(); //
    setDepartments(departmentsData);
  };

  useEffect(() => {
    getApiAllRequestsApproved(pageTable, pageSize);
    listDepartment();
    getApiAllRequestsNeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //style table scroll

  return (
    <div>
      <ModalNeedApproved
        onClose={() => {
          setModalNeedApproved(false);
          getApiAllRequestsApproved(pageTable, pageSize);
          getApiAllRequestsNeed();
        }}
        open={modalNeedApproved}
        allRequestsApproved={requestsNeedApprove}
        putApprovedRequest={putApprovedRequest}
      />
      <ModalDetailLeave
        infoRequetLeave={infoRequetLeave}
        onClose={() => setModalDetailLeave(false)}
        open={modalDetailLeave}
        title="Chi Tiết Đơn Xin Phép"
      />
      <ModalLoading isOpen={loading} />
      {contextHolder}
      <div className="w-full">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          Danh sách phiếu yêu cầu:
        </p>
      </div>
      <div className="w-full">
        <div className="flex justify-end mb-3  w-full">
          <button
            className="flex mt-4 relative  gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold"
            onClick={() => {
              setModalNeedApproved(true);
            }}
          >
            Phê duyệt
            <div
              className={`h-8 right-[-15px] top-[-20px] flex justify-center items-center w-8 rounded-[50%] bg-red-600 text-white font-semibold absolute ${
                requestsNeedApprove.length < 1 ? "hidden" : ""
              }`}
            >
              {requestsNeedApprove.length > 99
                ? "99+"
                : requestsNeedApprove.length}
            </div>
          </button>
        </div>
        <div className="grid grid-cols-2 md:flex flex-wrap items-center gap-4 mb-4 w-full">
          <p className="font-bold  text-2xl text-[#4a4a6a] hidden md:block">
            Lọc:
          </p>
          <div className="flex gap-2 items-center shrink-0">
            <Form.Item
              layout="horizontal"
              label={<p className="font-bold text-[#242424]">MSNV</p>}
            >
              <Input
                className="!w-[80px]"
                placeholder="MSNV"
                onChange={(e) => setFilterMSNV(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    getApiAllRequestsApproved(pageTable, pageSize);
                  }
                }}
              />
            </Form.Item>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            {/* <p className="text-sm text-[#4a4a6a] shrink-0">Tên NV:</p> */}
            <Form.Item
              layout="horizontal"
              label={<p className="font-bold text-[#242424]">Tên NV</p>}
            >
              <Input
                className="!w-[100%]"
                placeholder="Tên NV"
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    getApiAllRequestsApproved(pageTable, pageSize);
                  }
                }}
              />
            </Form.Item>
          </div>
          {localUser?.role === "ADMIN" && (
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
                  treeDefaultExpandAll={false}
                  onChange={onChangeSelectDepartment}
                  showCheckedStrategy="SHOW_ALL"
                  treeData={treeData}
                  onPopupScroll={onPopupScroll}
                />
              </Form.Item>
            </div>
          )}

          <button
            className="flex w-fit justify-center gap-2 items-center h-8 px-4 rounded-lg bg-gradient-to-r from-[#4c809e] to-[#001935] cursor-pointer text-white font-semibold shrink-0"
            onClick={() => getApiAllRequestsApproved(pageTable, pageSize)}
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
