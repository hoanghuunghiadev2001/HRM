/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import type { ColumnType } from "antd/es/table";
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
  Badge,
  Row,
  Col,
  Form,
  TreeSelect,
} from "antd";
import {
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";

import ModalLoading from "@/components/modalLoading";
import { useAppSelector } from "@/store/hook";
import { Department } from "@/lib/interface";
import { TreeSelectProps } from "antd/lib";

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
  proposer: { id: number; name: string; employeeCode: string };
  file?: { id: number; filename: string };
  signers: Array<{ signer: { id: number; name: string }; status: string }>;
  approvers: Array<{ approver: { id: number; name: string }; status: string }>;
}

interface resultData {
  data: Proposal[];
  total: number;
}

export default function MyProposalsPolished() {
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
  const [filterDepartment, setDepartment] = useState<string>();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [proposalTypeFilter, setProposalTypeFilter] = useState<
    string | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const { employeeCode, role } = useAppSelector((state) => state.user);
  const [msg, contextHolder] = message.useMessage();

  // nicer layout sizing
  const [tableHeight, setTableHeight] = useState<number>(520);
  useEffect(() => {
    const update = () => {
      const h = typeof window !== "undefined" ? window.innerHeight - 380 : 520;
      setTableHeight(h > 240 ? h : 520);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const listDepartment = async () => {
    const res = await fetch("/api/departments");
    if (!res.ok) throw new Error("Lấy dữ liệu thất bại");
    const departmentsData = await res.json(); //
    setDepartments(departmentsData);
  };

  const onPopupScroll: TreeSelectProps["onPopupScroll"] = (e) => {
    console.log("onPopupScroll", e);
  };

  const fetchProposals = async (p = page, ps = pageSize) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(ps),
        search: searchText || "",
      });
      if (statusFilter) params.append("status", statusFilter);
      if (proposalTypeFilter) params.append("proposalType", proposalTypeFilter);

      if (filterDepartment) params.append("departmentId", filterDepartment);
      if (selectedDate) {
        const d = selectedDate.format("YYYY-MM-DD");
        params.append("createdFrom", d);
        params.append("createdTo", d);
      }

      const response = await fetch(
        `/api/proposals/my-proposals?${params.toString()}`,
      );
      const data = await response.json();
      console.log(data);

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

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchProposals(1, pageSize);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, proposalTypeFilter, selectedDate, pageSize]);

  useEffect(() => {
    fetchProposals(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [page, filterDepartment]);

  const showConfirm = async (
    proposalId: number,
    action: "sign" | "approve",
    status: "approved" | "rejected",
  ) => {
    setActionLoading(proposalId);
    try {
      await axios.post(`/api/proposals/${proposalId}/${action}`, {
        proposalId,
        status,
      });
      msg.success(status === "approved" ? "Hoàn tất thành công" : "Đã từ chối");
      fetchProposals();
    } catch (error) {
      console.error("Approval error:", error);
      msg.error("Có lỗi xảy ra khi gửi phê duyệt.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetail = (proposalId: number) => {
    router.push(`/dashboard/proposal/my-proposals/${proposalId}`);
  };
  const onChangeSelectDepartment = (newValue: string) => {
    setDepartment(newValue);
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

  // columns
  const columnsCommon = useMemo<ColumnsType<Proposal>>(
    () => [
      {
        title: "Tên đề xuất",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <div>
            <Text strong>{text}</Text>
            <div
              style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}
              className="line-clamp-2"
            >
              {record.description}
            </div>
          </div>
        ),
        width: 180,
      },
      {
        title: "Người lập",
        key: "proposer",
        render: (_, r) => (
          <Text type="secondary">
            {r.proposer?.name} • {r.proposer?.employeeCode}
          </Text>
        ),
        responsive: ["md"] as const,
        width: 180,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          const map: any = {
            pending_signatures: ["warning", "Đang chờ ký"],
            waiting_approval: ["processing", "Đang chờ duyệt"],
            approved: ["success", "Đã duyệt"],
            rejected: ["error", "Đã từ chối"],
          };
          const [color, text] = map[status] || ["default", status];
          return <Tag color={color}>{text}</Tag>;
        },
        width: 100,
      },
      {
        title: "Loại",
        dataIndex: "proposalType",
        key: "proposalType",
        responsive: ["md"] as const,
        render: (t) => (t === "REGULAR" ? "Đề xuất chung" : "Đề xuất xe"),
        width: 100,
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        responsive: ["lg"] as const,
        render: (d) => new Date(d).toLocaleString("vi-VN"),
        width: 120,
      },
    ],
    [],
  );

  const createdColumns: ColumnsType<Proposal> = useMemo(() => {
    return [
      ...columnsCommon,
      {
        title: "Thao tác",
        key: "actions",
        render: (_: any, record: { id: number }) => (
          <Space>
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
                type="link"
                danger
                size="small"
                onClick={() => handleDeleteProposal(record.id)}
              >
                Xóa
              </Button>
            )}
          </Space>
        ),
        width: 90,
      },
    ];
  }, [columnsCommon, role]);

  const pendingColumns: ColumnsType<Proposal> = useMemo(
    () => [...columnsCommon],
    [columnsCommon],
  );

  const actionColumn = (
    actionType: "sign" | "approve",
  ): ColumnType<Proposal> => ({
    title: "Hành động",
    key: "action",
    render: (_: any, record: Proposal) => (
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
    width: 180,
  });

  const rowClassName = (record: Proposal) => {
    if (record.status === "pending_signatures") return "row-highlight-pending";
    if (record.status === "waiting_approval") return "row-highlight-approve";
    return "";
  };

  useEffect(() => {
    listDepartment();
  }, []);
  return (
    <div style={{ padding: 16, maxWidth: 1400, margin: "0 auto" }}>
      {contextHolder}
      <ModalLoading isOpen={loading} />

      <Row align="middle" justify="space-between" style={{ marginBottom: 18 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <FileTextOutlined /> Quản lý đề xuất
          </Title>
          <Text type="secondary">
            Xem và quản lý các đề xuất của bạn — ưu tiên những đề xuất cần hành
            động.
          </Text>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<SearchOutlined />}
              onClick={() => fetchProposals(1, pageSize)}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              onClick={() => router.push("/dashboard/proposalcd ")}
            >
              Tạo đề xuất mới
            </Button>
          </Space>
        </Col>
      </Row>

      <Card
        style={{ marginBottom: 18, borderRadius: 10 }}
        bodyStyle={{ padding: 12 }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Tìm theo tên đề xuất..."
              allowClear
              enterButton
              size="middle"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              onPressEnter={() => fetchProposals(1, pageSize)}
              onSearch={() => fetchProposals(1, pageSize)}
            />
          </Col>
          <Col xs={12} sm={8} md={6} lg={5}>
            <TreeSelect
              showSearch
              style={{ width: "100%" }}
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
          </Col>

          <Col xs={12} sm={8} md={6} lg={3}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            >
              <Select.Option value="pending_signatures">
                Đang chờ ký
              </Select.Option>
              <Select.Option value="waiting_approval">
                Đang chờ duyệt
              </Select.Option>
              <Select.Option value="approved">Đã duyệt</Select.Option>
              <Select.Option value="rejected">Đã từ chối</Select.Option>
            </Select>
          </Col>

          <Col xs={12} sm={8} md={6} lg={3}>
            <Select
              placeholder="Loại đề xuất"
              allowClear
              style={{ width: "100%" }}
              value={proposalTypeFilter}
              onChange={(val) => setProposalTypeFilter(val)}
            >
              <Select.Option value="REGULAR">Đề xuất chung</Select.Option>
              <Select.Option value="VEHICLE">Đề xuất xe</Select.Option>
            </Select>
          </Col>

          <Col xs={12} sm={12} md={6} lg={4}>
            <DatePicker
              value={selectedDate}
              onChange={(d) => setSelectedDate(d)}
              format="DD/MM/YYYY"
              allowClear
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="created" size="large" destroyInactiveTabPane>
        <TabPane
          tab={
            <span>
              <FileTextOutlined /> Đề xuất{" "}
              <Text type="secondary">({createdProposals.data.length})</Text>
            </span>
          }
          key="created"
        >
          <Card className="proposal-table" bodyStyle={{ padding: 8 }}>
            <Table
              columns={createdColumns}
              dataSource={createdProposals.data}
              rowKey={(r) => String(r.id)}
              loading={loading}
              scroll={{ x: 1100, y: tableHeight }}
              pagination={{
                current: page,
                pageSize,
                total: createdProposals.total,
                showSizeChanger: true,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps || pageSize);
                },
              }}
              rowClassName={rowClassName}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <Badge dot={pendingSignatures.total > 0}>
                <ClockCircleOutlined /> Cần ký ({pendingSignatures.total})
              </Badge>
            </span>
          }
          key="pending_signature"
        >
          <Card bodyStyle={{ padding: 8 }}>
            <Table
              columns={[...pendingColumns, actionColumn("sign")]}
              dataSource={pendingSignatures.data}
              rowKey={(r) => String(r.id)}
              loading={loading}
              scroll={{ x: 1100, y: tableHeight }}
              pagination={{
                current: page,
                pageSize,
                total: pendingSignatures.total,
                showSizeChanger: true,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps || pageSize);
                },
              }}
              rowClassName={rowClassName}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <Badge dot={pendingApprovals.total > 0}>
                <CheckCircleOutlined /> Cần phê duyệt ({pendingApprovals.total})
              </Badge>
            </span>
          }
          key="pending_approval"
        >
          <Card bodyStyle={{ padding: 8 }}>
            <Table
              columns={[...pendingColumns, actionColumn("approve")]}
              dataSource={pendingApprovals.data}
              rowKey={(r) => String(r.id)}
              loading={loading}
              scroll={{ x: 1100, y: tableHeight }}
              pagination={{
                current: page,
                pageSize,
                total: pendingApprovals.total,
                showSizeChanger: true,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps || pageSize);
                },
              }}
              rowClassName={rowClassName}
            />
          </Card>
        </TabPane>
      </Tabs>

      <style jsx>{`
        .row-highlight-pending {
          background: rgba(255, 244, 229, 0.8);
        }
        .row-highlight-approve {
          background: rgba(230, 245, 255, 0.9);
        }
        .proposal-table .ant-table-thead > tr > th {
          background: #fafafa;
        }
      `}</style>
    </div>
  );
}
