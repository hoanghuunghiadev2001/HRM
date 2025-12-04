/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Tabs,
  message,
  Input,
  Select,
  DatePicker,
} from "antd";
import {
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";

import ModalLoading from "@/components/modalLoading";
import { useAppSelector } from "@/store/hook";

const { Title, Text } = Typography;
const { TabPane } = Tabs as any;
const { Search } = Input;

interface Proposal {
  id: number;
  name: string;
  title: string;
  description?: string;
  status: string;
  proposalType?: string;
  createdAt: string;
  proposer: {
    id: number;
    name: string;
    employeeCode: string;
  };
  file?: {
    id: number;
    filename: string;
    mimeType: string;
    fileSize: number;
    createdAt: string;
  };
  signers: Array<{
    signer: {
      id: number;
      name: string;
      employeeCode: string;
    };
    status: string;
  }>;
  approvers: Array<{
    approver: {
      id: number;
      name: string;
      employeeCode: string;
    };
    status: string;
  }>;
}

interface resultData {
  data: Proposal[];
  total: number;
}

export default function MyProposalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdProposals, setCreatedProposals] = useState<resultData>({
    data: [],
    total: 0,
  });
  const [pendingSignatures, setPendingSignatures] = useState<resultData>({
    data: [],
    total: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState<resultData>({
    data: [],
    total: 0,
  });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [proposalTypeFilter, setProposalTypeFilter] = useState<
    string | undefined
  >();
  // CHANGED: chọn 1 ngày duy nhất
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const { employeeCode, role } = useAppSelector((state) => state.user);
  const [msg, contextHolder] = message.useMessage();

  const [tableHeight, setTableHeight] = useState<number>(600);

  useEffect(() => {
    const update = () => {
      const h = typeof window !== "undefined" ? window.innerHeight - 380 : 600;
      setTableHeight(h > 200 ? h : 600);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getStatusColor = (status: string) => {
    return (
      {
        pending_signatures: "orange",
        waiting_approval: "blue",
        approved: "green",
        rejected: "red",
      }[status] || "default"
    );
  };

  const getStatusText = (status: string) => {
    return (
      {
        pending_signatures: "Đang chờ ký",
        waiting_approval: "Đang chờ duyệt",
        approved: "Đã duyệt",
        rejected: "Đã từ chối",
      }[status] || status
    );
  };

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search: searchText,
      });

      if (statusFilter) params.append("status", statusFilter);
      if (proposalTypeFilter) params.append("proposalType", proposalTypeFilter);

      // Nếu có selectedDate -> gửi createdFrom & createdTo cùng ngày (YYYY-MM-DD)
      if (selectedDate) {
        const d = selectedDate.format("YYYY-MM-DD");
        params.append("createdFrom", d);
        params.append("createdTo", d);
      }

      const response = await fetch(
        `/api/proposals/my-proposals?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok) {
        setCreatedProposals(data.created || { data: [], total: 0 });
        setPendingApprovals(data.need_to_approve || { data: [], total: 0 });
        setPendingSignatures(data.need_to_sign || { data: [], total: 0 });
      } else {
        msg.error(data.error || "Không thể tải danh sách đề xuất");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      msg.error("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search -> reset to page 1 and fetch
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchProposals();
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, statusFilter, proposalTypeFilter, selectedDate, pageSize]);

  useEffect(() => {
    fetchProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const showConfirm = async (
    proposalId: number,
    action: "sign" | "approve",
    status: "approved" | "rejected"
  ) => {
    setActionLoading(proposalId);
    try {
      await axios.post(`/api/proposals/${proposalId}/${action}`, {
        proposalId,
        status,
      });
      msg.success(
        status === "approved" ? "Đã phê duyệt!" : "Đã từ chối đề xuất!"
      );
      fetchProposals();
    } catch (error) {
      console.error("Approval error:", error);
      msg.error("Có lỗi xảy ra khi gửi phê duyệt.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetail = (proposalId: number) => {
    setLoading(true);
    router.push(`/dashboard/proposal/my-proposals/${proposalId}`);
  };

  const handleDeleteProposal = async (proposalId: number) => {
    if (!confirm("Bạn có chắc muốn xóa đề xuất này?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        msg.success(data.message || "Xóa đề xuất thành công");
        fetchProposals();
      } else {
        msg.error(data.error || "Xóa thất bại");
      }
    } catch (err) {
      console.error(err);
      msg.error("Có lỗi xảy ra khi xóa đề xuất");
    } finally {
      setLoading(false);
    }
  };

  // ================== COLUMNS ==================
  const createdColumns: ColumnsType<Proposal> = [
    {
      title: "Tên đề xuất",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Người lập đề xuất",
      key: "employeeProposer",
      responsive: ["md"],
      render: (_, record) =>
        record.proposer.name && (
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            {record.proposer.name} ({record.proposer.employeeCode})
          </Text>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      responsive: ["sm"],
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Loại đề xuất",
      dataIndex: "proposalType",
      key: "proposalType",
      responsive: ["md"],
      render: (type) => (
        <Text>{type === "REGULAR" ? "Đề xuất chung" : "đề xuất xe"}</Text>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      responsive: ["lg"],
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.id)}
          >
            Xem
          </Button>
          {role === "ADMIN" && (
            <Button
              className={`${
                employeeCode === "01375" || employeeCode === "00965"
                  ? ""
                  : "hidden"
              }`}
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleDeleteProposal(record.id)}
            >
              Xóa
            </Button>
          )}
        </div>
      ),
    },
  ];

  const pendingColumns: ColumnsType<Proposal> = [
    {
      title: "Tên đề xuất",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            Người đề xuất: {record.proposer.name}
          </Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              {record.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "File",
      key: "file",
      responsive: ["sm"],
      render: (_, record) =>
        record.file ? (
          <Button type="link" icon={<FileTextOutlined />} size="small">
            {record.file.filename}
          </Button>
        ) : (
          <Text type="secondary">Không có file</Text>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      responsive: ["md"],
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  const actionColumn = (
    actionType: "sign" | "approve"
  ): ColumnsType<Proposal>[number] => ({
    title: "Thao tác",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          size="small"
          loading={actionLoading === record.id}
          onClick={() => showConfirm(record.id, actionType, "approved")}
        >
          {actionType === "sign" ? "Đồng ý" : "Phê duyệt"}
        </Button>
        <Button
          danger
          icon={<CloseOutlined />}
          size="small"
          loading={actionLoading === record.id}
          onClick={() => showConfirm(record.id, actionType, "rejected")}
        >
          Từ chối
        </Button>
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record.id)}
        >
          Xem
        </Button>
      </Space>
    ),
  });

  return (
    <div
      style={{ padding: 0, maxWidth: 1400, margin: "0 auto" }}
      className="proposal-page"
    >
      {contextHolder}
      <ModalLoading isOpen={loading} />

      <Title level={2} style={{ marginBottom: 16 }}>
        <FileTextOutlined /> Quản lý đề xuất
      </Title>

      <div
        style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}
      >
        <Search
          placeholder="Tìm theo tên đề xuất..."
          allowClear
          enterButton
          size="middle"
          style={{ width: 250 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
        >
          <Select.Option value="pending_signatures">Đang chờ ký</Select.Option>
          <Select.Option value="waiting_approval">Đang chờ duyệt</Select.Option>
          <Select.Option value="approved">Đã duyệt</Select.Option>
          <Select.Option value="rejected">Đã từ chối</Select.Option>
        </Select>
        <Select
          placeholder="Loại đề xuất"
          allowClear
          style={{ width: 180 }}
          value={proposalTypeFilter}
          onChange={(val) => setProposalTypeFilter(val)}
        >
          <Select.Option value="REGULAR">REGULAR</Select.Option>
          <Select.Option value="VEHICLE">VEHICLE</Select.Option>
        </Select>

        {/* CHANGED: DatePicker cho 1 ngày */}
        <DatePicker
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          format="DD/MM/YYYY"
          allowClear
        />
      </div>

      <Tabs
        defaultActiveKey="created"
        size="large"
        style={{ overflowX: "auto" }}
        onChange={() => {
          setPage(1);
          setPageSize(10);
        }}
        destroyInactiveTabPane
      >
        <TabPane
          tab={
            <span>
              <FileTextOutlined /> Đề xuất ({createdProposals?.data.length ?? 0}
              )
            </span>
          }
          key="created"
        >
          <Card className="proposal-table">
            <Table
              columns={createdColumns}
              dataSource={createdProposals?.data || []}
              rowKey={(r) => String(r.id)}
              loading={loading}
              scroll={{ x: 600, y: tableHeight }}
              pagination={{
                current: page,
                pageSize,
                total: createdProposals?.total ?? 0,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: (newPage, newPageSize) => {
                  setPage(newPage);
                  setPageSize(newPageSize || pageSize);
                },
              }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <ClockCircleOutlined /> Cần ký (
              {pendingSignatures?.data.length ?? 0})
            </span>
          }
          key="pending_signature"
        >
          <Card className="proposal-table">
            <Table
              columns={[...pendingColumns, actionColumn("sign")]}
              dataSource={pendingSignatures?.data || []}
              rowKey={(r) => String(r.id)}
              loading={loading}
              scroll={{ x: 600, y: tableHeight }}
              pagination={{
                current: page,
                pageSize,
                total: pendingSignatures?.total ?? 0,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: (newPage, newPageSize) => {
                  setPage(newPage);
                  setPageSize(newPageSize || pageSize);
                },
              }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <CheckCircleOutlined /> Cần phê duyệt (
              {pendingApprovals?.data.length ?? 0})
            </span>
          }
          key="pending_approval"
        >
          <Card className="proposal-table">
            <Table
              columns={[...pendingColumns, actionColumn("approve")]}
              dataSource={pendingApprovals?.data || []}
              rowKey={(r) => String(r.id)}
              loading={loading}
              scroll={{ x: 600, y: tableHeight }}
              pagination={{
                current: page,
                pageSize,
                total: pendingApprovals?.total ?? 0,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: (newPage, newPageSize) => {
                  setPage(newPage);
                  setPageSize(newPageSize || pageSize);
                },
              }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}
