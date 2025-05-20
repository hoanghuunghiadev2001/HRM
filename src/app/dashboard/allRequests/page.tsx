"use client";
import { useEffect, useState } from "react";

import React from "react";
import {
  Form,
  Input,
  message,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { TableProps } from "antd";
import {
  AllRequests,
  approveLeaveRequest,
  fetchLeaveRequests,
  getApiAllRequestsNeedApprove,
  getUserFromLocalStorage,
  ListRequestLeave,
  RequestLeave,
} from "@/components/api";
import ModalLoading from "@/components/modalLoading";
import { formatDateTime, StatusLeave } from "@/components/function";
import ModalDetailLeave from "@/components/modalDetailLeave";
import { Plus } from "lucide-react";
import ModalCreateNewRequest from "@/components/modalCreateNewRequest";
import { createStyles, FullToken } from "antd-style";
import ModalNeedApproved from "@/components/modalNeedApproved";

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
    RequestLeave[]
  >([]);
  const localUser = getUserFromLocalStorage();

  const [filterName, setFilterName] = useState("");
  const [filterMSNV, setFilterMSNV] = useState("");
  const [filterDepartment, setDepartment] = useState("");

  const getApiAllRequestsApproved = async (page: number, pageSize: number) => {
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
    } catch (err) {
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
        employeeCode: "",
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
      startDate: formatDateTime(item.startDate),
      endDate: formatDateTime(item.endDate),
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
      render: (_, record) => <p>{_}</p>,
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
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Ngày nghỉ",
      dataIndex: "startDate",
      key: "age",
    },
    {
      title: "Loại phép",
      dataIndex: "leaveType",
      key: "leaveType",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusLeave status={status} />,
    },

    {
      title: "Người phê duyệt",
      dataIndex: "approvedBy",
      key: "approvedBy",
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
      await getApiAllRequestsApproved(pageTable, pageSize);
      await getApiAllRequestsNeed();
      setLoading(false);
    } catch (err) {
      console.error("Lỗi:", err);
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

  useEffect(() => {
    getApiAllRequestsApproved(pageTable, pageSize);
    getApiAllRequestsNeed();
  }, []);

  //style table scroll

  return (
    <div>
      <ModalNeedApproved
        onClose={() => setModalNeedApproved(false)}
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
            <div className="h-8 right-[-15px] top-[-20px] flex justify-center items-center w-8 rounded-[50%] bg-red-600 text-white font-semibold absolute">
              {requestsNeedApprove.length > 99
                ? "99+"
                : requestsNeedApprove.length}
            </div>
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
            onClick={() => getApiAllRequestsApproved(pageTable, pageSize)}
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
