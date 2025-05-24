"use client";

import { Table } from "antd";
import { createStyles } from "antd-style";
import { useEffect, useState, useMemo } from "react";
import { StatusLeave } from "./function";

// Định nghĩa kiểu dữ liệu
interface LeaveRequest {
  id: number;
  employee?: {
    name: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface DataType {
  name: string | undefined;
  startDate: string;
  endDate: string;

  leaveType: string;
  status: string;
}

const useStyle = createStyles((utils) => {
  const { css, token } = utils;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export function RecentLeaveRequests({
  leaveRequests: initialLeaveRequests = [],
}) {
  const { styles } = useStyle();

  const [leaveRequests, setLeaveRequests] =
    useState<LeaveRequest[]>(initialLeaveRequests);
  const [loading, setLoading] = useState(initialLeaveRequests.length === 0);

  // Dữ liệu mẫu khi API chưa trả về kết quả - định nghĩa bên ngoài useEffect
  const sampleData = useMemo<LeaveRequest[]>(
    () => [
      {
        id: 1,
        employee: { name: "Nguyễn Văn A" },
        leaveType: "PN",
        startDate: "2023-05-15",
        endDate: "2023-05-16",
        status: "approved",
      },
      {
        id: 2,
        employee: { name: "Trần Thị B" },
        leaveType: "NB",
        startDate: "2023-05-17",
        endDate: "2023-05-17",
        status: "pending",
      },
      {
        id: 3,
        employee: { name: "Lê Văn C" },
        leaveType: "PB",
        startDate: "2023-05-18",
        endDate: "2023-05-20",
        status: "pending",
      },
      {
        id: 4,
        employee: { name: "Phạm Thị D" },
        leaveType: "Cgt",
        startDate: "2023-05-21",
        endDate: "2023-05-23",
        status: "approved",
      },
      {
        id: 5,
        employee: { name: "Hoàng Văn E" },
        leaveType: "PC",
        startDate: "2023-05-25",
        endDate: "2023-05-27",
        status: "rejected",
      },
    ],
    []
  );

  useEffect(() => {
    if (initialLeaveRequests.length > 0) {
      setLeaveRequests(initialLeaveRequests);
      return;
    }

    async function fetchLeaveRequests() {
      try {
        const response = await fetch("/api/report/leave-requests?limit=5");
        const data = await response.json();

        if (data && data.data) {
          setLeaveRequests(data.data);
        } else {
          // Nếu không có dữ liệu, sử dụng dữ liệu mẫu
          setLeaveRequests(sampleData);
        }
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        // Use sample data if API fails
        setLeaveRequests(sampleData);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaveRequests();
  }, [initialLeaveRequests, sampleData]);

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  }

  const formatted: DataType[] =
    leaveRequests?.map((item) => ({
      name: item.employee?.name,
      startDate: formatDate(item.startDate),
      endDate: formatDate(item.endDate),
      leaveType: item.leaveType,
      status: item.status,
    })) || [];

  return (
    <Table<DataType>
      dataSource={formatted}
      columns={[
        {
          title: "Tên nhân viên",
          dataIndex: "name",
          key: "name",
          render: (text) => <strong>{text}</strong>,
        },
        {
          title: "Loại phép",
          dataIndex: "leaveType",
          key: "leaveType",
        },
        {
          title: "Từ ngày",
          dataIndex: "startDate",
          key: "startDate",
        },
        {
          title: "Đến ngày",
          dataIndex: "endDate",
          key: "endDate",
        },
        {
          title: "Trạng thái",
          dataIndex: "status",
          key: "status",
          render: (_, record) => <StatusLeave status={record.status} />,
        },
      ]}
      pagination={{ pageSize: 10 }}
      locale={{
        emptyText: "Không có dữ liệu",
      }}
      className={styles.customTable}
      // columns={columns}
      // dataSource={formatted ?? []}
      // pagination={{ pageSize: 12 }}
      scroll={{ y: "calc(100vh - 305px)" }}
    />
    // <Table>
    //   <TableHeader>
    //     <TableRow>
    //       <TableHead>Nhân viên</TableHead>
    //       <TableHead>Loại phép</TableHead>
    //       <TableHead>Từ ngày</TableHead>
    //       <TableHead>Đến ngày</TableHead>
    //       <TableHead>Trạng thái</TableHead>
    //     </TableRow>
    //   </TableHeader>
    //   <TableBody>
    //     {leaveRequests.map((request) => (
    //       <TableRow key={request.id}>
    //         <TableCell className="font-medium">
    //           {request.employee?.name || "N/A"}
    //         </TableCell>
    //         <TableCell>{request.leaveType}</TableCell>
    //         <TableCell>{formatDate(request.startDate)}</TableCell>
    //         <TableCell>{formatDate(request.endDate)}</TableCell>
    //         <TableCell>
    //           <Badge
    //             variant={
    //               request.status === "approved"
    //                 ? "success"
    //                 : request.status === "rejected"
    //                 ? "destructive"
    //                 : "outline"
    //             }
    //           >
    //             {request.status === "approved"
    //               ? "Đã duyệt"
    //               : request.status === "rejected"
    //               ? "Từ chối"
    //               : "Chờ duyệt"}
    //           </Badge>
    //         </TableCell>
    //       </TableRow>
    //     ))}
    //   </TableBody>
    // </Table>
  );
}
