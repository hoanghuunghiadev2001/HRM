/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Drawer,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  BankOutlined,
  CalendarOutlined,
  DollarOutlined,
  DownloadOutlined,
  EyeOutlined,
  FallOutlined,
  InfoCircleOutlined,
  LockOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  RiseOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Helpers ────────────────────────────────────────────────────────────────
const VND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v ?? 0,
  );

const SHORT = (v: number) => {
  if (!v) return "—";
  if (Math.abs(v) >= 1_000_000_000)
    return (v / 1_000_000_000).toFixed(1) + " tỷ";
  if (Math.abs(v) >= 1_000_000) return Math.round(v / 1_000_000) + " tr";
  return Math.round(v / 1_000) + "k";
};

// ─── Types (khớp với API response) ──────────────────────────────────────────
interface MonthSummary {
  month: number;
  year: number;
  type: string;
  workingDays: number;
  totalGross: number;
  totalNet: number;
  firstReceived: number;
  actualReceived: number;
}

interface SalaryDetail {
  // Thu nhập cố định
  baseSalary: number;
  efficiencySalary: number;
  salary70: number;
  // Phụ cấp
  phoneAllowance: number;
  seniorityAllowance: number;
  mealAllowance: number;
  maternityAllowance: number;
  houseAllowance: number;
  // Năng suất
  productivitySalary: number;
  productivityOther: number;
  productivitySCC: number;
  productivityPaint: number;
  productivityAccessory: number;
  productivityParts: number;
  // Thưởng & cộng thêm
  bonusDay10: number;
  bonusDay25: number;
  bonus: number;
  otherWork: number;
  // Tăng ca
  overtime15: number; // số giờ TC x1.5
  overtime2: number; // số giờ TC x2
  overtime3: number; // số giờ TC x3
  overtime: number; // tiền tăng ca tổng
  otherIncome: number;
  salaryAdjust: number;
  // Khấu trừ
  salaryDeduction: number;
  insuranceDeduction: number;
  unemploymentInsu: number;
  unionFee: number;
  advancePayment: number;
  socialWorkDeduction: number;
  healthCardDeduction: number;
  insuranceArrears: number;
  taxCompensation: number;
  taxTNCN: number;
  phoneDeduction: number;
  taxRefund: number;
  salaryDeductionFinal: number;
  // Tổng
  totalGross: number;
  totalNet: number;
  firstReceived: number;
  bonusReceived: number;
  actualReceived: number;
}

interface SalaryRow {
  employee: {
    id: number;
    employeeCode: string;
    name: string;
    department: string | null;
    departmentAbbr: string | null;
    position: string | null;
    contractType: string | null;
  };
  monthlySummary: MonthSummary[];
  totalAnnualGross: number;
  totalAnnualNet: number;
  salaryDetails?: Record<number, SalaryDetail>;
}

interface ApiResp {
  year: number;
  month: number | null;
  isAdmin: boolean;
  total: number;
  data: SalaryRow[];
}

// ─── Helper row component ────────────────────────────────────────────────────
function IncomeRow({ label, val }: { label: string; val: number }) {
  return (
    <div className="flex justify-between py-[3px] border-b border-gray-50 text-xs">
      <Text type="secondary">{label}</Text>
      <span className={val > 0 ? "text-gray-800 font-medium" : "text-gray-300"}>
        {VND(val ?? 0)}
      </span>
    </div>
  );
}

// ─── Sub-component: Chi tiết đầy đủ 1 tháng ─────────────────────────────────
function MonthDetailPanel({
  detail,
  month,
  isAdmin,
}: {
  detail: SalaryRow;
  month: number;
  isAdmin: boolean;
}) {
  const ms = detail.monthlySummary.find((s) => s.month === month);
  const md = detail.salaryDetails?.[month];

  if (!ms)
    return (
      <Text type="secondary" className="text-sm">
        Không có dữ liệu tháng {month}.
      </Text>
    );

  const netReceived = (ms.firstReceived ?? 0) + (ms.actualReceived ?? 0);

  // ── KPI cards ──
  const kpis = [
    {
      label: "Ngày công",
      value: ms.workingDays + " ngày",
      color: "#6366f1",
      icon: <CalendarOutlined />,
    },
    {
      label: "Lương gộp (1)",
      value: VND(ms.totalGross),
      color: "#2563eb",
      icon: <RiseOutlined />,
    },
    {
      label: "Lương (2)",
      value: VND(ms.totalNet),
      color: "#7c3aed",
      icon: <DollarOutlined />,
    },
    {
      label: "Thực lãnh",
      value: VND(netReceived),
      color: "#059669",
      icon: <BankOutlined />,
    },
  ];

  return (
    <div>
      {/* KPI row */}
      <Row gutter={12} className="mb-4">
        {kpis.map((k, i) => (
          <Col span={6} key={i}>
            <Card size="small" className="text-center">
              <div className="text-xs text-gray-400 mb-1">{k.label}</div>
              <div className="font-semibold text-sm" style={{ color: k.color }}>
                {k.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Nhận lần 1 + lần 2 */}
      <div className="flex gap-3 mb-4">
        <Card size="small" className="flex-1 bg-indigo-50 border-indigo-200">
          <div className="text-xs text-indigo-500 mb-1">
            Nhận lần 1 (tạm ứng)
          </div>
          <div className="font-semibold text-indigo-700">
            {VND(ms.firstReceived ?? 0)}
          </div>
        </Card>
        <Card size="small" className="flex-1 bg-green-50 border-green-200">
          <div className="text-xs text-green-600 mb-1">
            Nhận lần 2 (thực lãnh)
          </div>
          <div className="font-semibold text-green-700">
            {VND(ms.actualReceived ?? 0)}
          </div>
        </Card>
        <Card size="small" className="flex-1 bg-emerald-50 border-emerald-300">
          <div className="text-xs text-emerald-600 mb-1">Tổng thực nhận</div>
          <div className="font-bold text-emerald-700 text-base">
            {VND(netReceived)}
          </div>
        </Card>
      </div>

      {/* Chi tiết đầy đủ (chỉ khi có salaryDetails - admin) */}
      {md ? (
        <Row gutter={16}>
          {/* Cột trái: Thu nhập */}
          <Col span={12}>
            <Card
              size="small"
              title={
                <Space>
                  <PlusCircleOutlined className="text-green-600" />
                  <span className="text-sm font-semibold">
                    Thu nhập & Phụ cấp
                  </span>
                </Space>
              }
              className="h-full"
            >
              <div className="space-y-0">
                {/* Lương cố định */}
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pt-1 pb-0.5">
                  Lương cố định
                </div>
                {(
                  [
                    ["Lương BHXH + PC", md.baseSalary],
                    ["Lương hiệu quả", md.efficiencySalary],
                    ["Lương 70%", md.salary70],
                  ] as [string, number][]
                ).map(([label, val]) => (
                  <IncomeRow key={label} label={label} val={val} />
                ))}

                {/* Phụ cấp */}
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pt-2 pb-0.5">
                  Phụ cấp
                </div>
                {(
                  [
                    ["PC điện thoại", md.phoneAllowance],
                    ["PC thâm niên", md.seniorityAllowance],
                    ["PC bữa ăn", md.mealAllowance],
                    ["PC thai sản", md.maternityAllowance],
                    ["PC nhà ở", md.houseAllowance],
                  ] as [string, number][]
                ).map(([label, val]) => (
                  <IncomeRow key={label} label={label} val={val} />
                ))}

                {/* Năng suất */}
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pt-2 pb-0.5">
                  Năng suất
                </div>
                {(
                  [
                    ["Năng suất", md.productivitySalary],
                    ["Năng suất khác", md.productivityOther],
                    ["Năng suất SCC", md.productivitySCC],
                    ["Năng suất sơn", md.productivityPaint],
                    ["Năng suất phụ kiện", md.productivityAccessory],
                    ["Năng suất phụ tùng", md.productivityParts],
                  ] as [string, number][]
                ).map(([label, val]) => (
                  <IncomeRow key={label} label={label} val={val} />
                ))}

                {/* Thưởng */}
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pt-2 pb-0.5">
                  Thưởng & Cộng thêm
                </div>
                {(
                  [
                    ["Thưởng ngày 10", md.bonusDay10],
                    ["Thưởng ngày 25", md.bonusDay25],
                    ["Thưởng", md.bonus],
                    ["Công việc khác", md.otherWork],
                    ["Bù lương", md.salaryAdjust],
                    ["Thu nhập khác", md.otherIncome],
                  ] as [string, number][]
                ).map(([label, val]) => (
                  <IncomeRow key={label} label={label} val={val} />
                ))}

                {/* Tăng ca */}
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pt-2 pb-0.5">
                  Tăng ca
                </div>
                {(
                  [
                    ["Giờ TC x1.5", md.overtime15],
                    ["Giờ TC x2", md.overtime2],
                    ["Giờ TC x3", md.overtime3],
                    ["Tiền tăng ca", md.overtime],
                  ] as [string, number][]
                ).map(([label, val]) => (
                  <IncomeRow key={label} label={label} val={val} />
                ))}

                <div className="flex justify-between pt-2 mt-1 border-t-2 border-blue-200 text-sm font-semibold">
                  <span>Tổng gộp (1)</span>
                  <span className="text-blue-700">{VND(md.totalGross)}</span>
                </div>
              </div>
            </Card>
          </Col>

          {/* Cột phải: Khấu trừ */}
          <Col span={12}>
            <Card
              size="small"
              title={
                <Space>
                  <MinusCircleOutlined className="text-red-500" />
                  <span className="text-sm font-semibold">Khấu trừ</span>
                </Space>
              }
              className="mb-3"
            >
              {(
                [
                  ["Trừ lương đầu kỳ", md.salaryDeduction],
                  ["BHXH-YT 9.5%", md.insuranceDeduction],
                  ["BHTN 1%", md.unemploymentInsu],
                  ["Công đoàn", md.unionFee],
                  ["Tạm ứng", md.advancePayment],
                  ["Đóng BHXH xã hội", md.socialWorkDeduction],
                  ["Thẻ BHYT", md.healthCardDeduction],
                  ["Nợ BHXH", md.insuranceArrears],
                  ["Nộp bù thuế", md.taxCompensation],
                  ["Thuế TNCN", md.taxTNCN],
                  ["PC điện thoại trừ", md.phoneDeduction],
                  ["Hoàn thuế", md.taxRefund],
                  ["Trừ lương cuối kỳ", md.salaryDeductionFinal],
                ] as [string, number][]
              ).map(([label, val]) => (
                <div
                  key={label}
                  className="flex justify-between py-1 border-b border-red-50 text-xs"
                >
                  <Text type="danger">{label}</Text>
                  <span
                    className={
                      val > 0 ? "text-red-600 font-medium" : "text-gray-300"
                    }
                  >
                    {val > 0 ? `−${VND(val)}` : VND(0)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-1 border-t-2 border-red-200 text-sm font-semibold">
                <span>Tổng khấu trừ</span>
                <span className="text-red-600">
                  −
                  {VND(
                    (md.salaryDeduction ?? 0) +
                      (md.insuranceDeduction ?? 0) +
                      (md.unemploymentInsu ?? 0) +
                      (md.unionFee ?? 0) +
                      (md.advancePayment ?? 0) +
                      (md.socialWorkDeduction ?? 0) +
                      (md.healthCardDeduction ?? 0) +
                      (md.insuranceArrears ?? 0) +
                      (md.taxCompensation ?? 0) +
                      (md.taxTNCN ?? 0) +
                      (md.phoneDeduction ?? 0) +
                      (md.taxRefund ?? 0) +
                      (md.salaryDeductionFinal ?? 0),
                  )}
                </span>
              </div>
            </Card>

            {/* Tổng Net */}
            <Card size="small" className="border-purple-200 bg-purple-50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-purple-700">
                  Tổng Net (2)
                </span>
                <span className="font-bold text-purple-700">
                  {VND(md.totalNet)}
                </span>
              </div>
              {isAdmin && md.bonusReceived > 0 && (
                <div className="flex justify-between items-center mt-1">
                  <Text type="secondary" className="text-xs">
                    Thưởng đã nhận
                  </Text>
                  <span className="text-xs text-purple-600">
                    {VND(md.bonusReceived)}
                  </span>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      ) : (
        /* Không có salaryDetails → hiển thị tóm tắt đơn giản */
        <Card size="small" className="bg-gray-50">
          <Row gutter={16}>
            <Col span={12}>
              <div className="text-xs text-gray-400 mb-1">Lương gộp (1)</div>
              <div className="font-semibold text-blue-700">
                {VND(ms.totalGross)}
              </div>
            </Col>
            {isAdmin && (
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Lương (2)</div>
                <div className="font-semibold text-purple-700">
                  {VND(ms.totalNet)}
                </div>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Footer thực lãnh */}
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
        <div>
          <div className="text-xs text-green-600 mb-0.5">
            Lần 1: {VND(ms.firstReceived ?? 0)} &nbsp;+&nbsp; Lần 2:{" "}
            {VND(ms.actualReceived ?? 0)}
          </div>
          <div className="font-semibold text-sm text-green-800">
            Thực lãnh tháng {month}/{ms.year}
          </div>
        </div>
        <div className="text-2xl font-bold text-green-700">
          {VND(netReceived)}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SalaryViewPage() {
  const [resp, setResp] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState<number | undefined>();
  const [search, setSearch] = useState("");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEmp, setDrawerEmp] = useState<SalaryRow | null>(null);
  const [drawerMonth, setDrawerMonth] = useState<number | null>(null);

  const [exporting, setExporting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ year: String(year) });
      if (month) p.set("month", String(month));
      const res = await fetch(`/api/salary/view?${p}`);
      if (res.status === 403) {
        message.error("Bạn không có quyền xem trang này");
        return;
      }
      if (!res.ok) throw new Error();
      setResp(await res.json());
    } catch {
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const p = new URLSearchParams({ year: String(year) });
      if (month) p.set("month", String(month));
      const res = await fetch(`/api/salary/view/export?${p}`);
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `BangLuong_${year}${month ? `_T${month}` : ""}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      message.success("Xuất Excel thành công");
    } catch {
      message.error("Xuất thất bại");
    } finally {
      setExporting(false);
    }
  };

  // ── Open drawer ────────────────────────────────────────────────────────────
  const openDrawer = (row: SalaryRow, m?: number) => {
    setDrawerEmp(row);
    const firstMonth = row.monthlySummary[0]?.month ?? null;
    setDrawerMonth(m ?? firstMonth);
    setDrawerOpen(true);
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const rows = (resp?.data ?? []).filter(
    (r) =>
      !search ||
      r.employee.name.toLowerCase().includes(search.toLowerCase()) ||
      r.employee.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      (r.employee.department ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const totalGross = rows.reduce((s, r) => s + r.totalAnnualGross, 0);
  const totalNet = rows.reduce((s, r) => s + r.totalAnnualNet, 0);

  // ── Month columns ──────────────────────────────────────────────────────────
  const monthCols = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
    title: <span className="text-xs">T{m}</span>,
    key: `m${m}`,
    width: 90,
    align: "right" as const,
    render: (_: any, r: SalaryRow) => {
      const ms = r.monthlySummary.find((s) => s.month === m);
      if (!ms)
        return (
          <Text type="secondary" className="text-xs">
            —
          </Text>
        );
      const net = (ms.firstReceived ?? 0) + (ms.actualReceived ?? 0);
      return (
        <Tooltip
          title={
            <div className="text-xs">
              <div>Gộp: {VND(ms.totalGross)}</div>
              <div>Net: {VND(ms.totalNet)}</div>
              <div>Thực nhận: {VND(net)}</div>
              <div>Ngày công: {ms.workingDays}</div>
            </div>
          }
        >
          <div
            className="cursor-pointer text-right"
            onClick={() => openDrawer(r, m)}
          >
            <div className="text-xs font-semibold text-green-700 hover:text-green-900 hover:underline">
              {SHORT(net)}
            </div>
            <div className="text-[10px] text-gray-400">{ms.workingDays}nc</div>
          </div>
        </Tooltip>
      );
    },
  }));

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Nhân viên",
      key: "emp",
      width: 220,
      fixed: "left" as const,
      render: (_: any, r: SalaryRow) => {
        const initials = r.employee.name
          .split(" ")
          .slice(-2)
          .map((w) => w[0])
          .join("")
          .toUpperCase();
        return (
          <Space>
            <Avatar
              size={30}
              style={{ background: "#6366f1", fontSize: 12, fontWeight: 600 }}
            >
              {initials}
            </Avatar>
            <div>
              <div className="font-semibold text-sm leading-tight">
                {r.employee.name}
              </div>
              <Text type="secondary" className="text-xs">
                {r.employee.employeeCode}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Phòng ban",
      key: "dept",
      width: 100,
      render: (_: any, r: SalaryRow) => (
        <Tag color="blue" className="text-xs">
          {r.employee.departmentAbbr ?? r.employee.department ?? "—"}
        </Tag>
      ),
    },
    {
      title: "Chức vụ",
      key: "pos",
      width: 140,
      render: (_: any, r: SalaryRow) => (
        <Text className="text-xs text-gray-500">
          {r.employee.position ?? "—"}
        </Text>
      ),
    },
    {
      title: "Loại HĐ",
      key: "contract",
      width: 100,
      render: (_: any, r: SalaryRow) => (
        <Tag
          color={r.employee.contractType === "Chính thức" ? "green" : "orange"}
          className="text-xs"
        >
          {r.employee.contractType ?? "—"}
        </Tag>
      ),
    },
    ...monthCols,
    {
      title: "Tổng gộp năm",
      key: "gross",
      width: 140,
      fixed: "right" as const,
      align: "right" as const,
      sorter: (a: SalaryRow, b: SalaryRow) =>
        a.totalAnnualGross - b.totalAnnualGross,
      render: (_: any, r: SalaryRow) => (
        <span className="text-xs font-semibold text-blue-700">
          {VND(r.totalAnnualGross)}
        </span>
      ),
    },
    {
      title: "Tổng thực lãnh",
      key: "net",
      width: 140,
      fixed: "right" as const,
      align: "right" as const,
      sorter: (a: SalaryRow, b: SalaryRow) =>
        a.totalAnnualNet - b.totalAnnualNet,
      render: (_: any, r: SalaryRow) => (
        <span className="text-xs font-semibold text-green-700">
          {VND(r.totalAnnualNet)}
        </span>
      ),
    },
    {
      title: "",
      key: "act",
      width: 44,
      fixed: "right" as const,
      render: (_: any, r: SalaryRow) => (
        <Tooltip title="Xem chi tiết">
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openDrawer(r)}
            className="text-indigo-500 hover:text-indigo-700"
          />
        </Tooltip>
      ),
    },
  ];

  // ── Drawer: monthly tabs ───────────────────────────────────────────────────
  const drawerMonths =
    drawerEmp?.monthlySummary.map((s) => s.month).sort((a, b) => a - b) ?? [];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <DollarOutlined className="text-white text-xl" />
            </div>
            <div>
              <Title level={4} className="!mb-0">
                Bảng lương nhân viên
              </Title>
              <Text type="secondary" className="text-xs">
                {resp?.isAdmin
                  ? `Toàn bộ · Admin · Năm ${year}`
                  : `Xem theo quyền được cấp · Năm ${year}`}
              </Text>
            </div>
          </div>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
            type="primary"
            ghost
          >
            Xuất Excel
          </Button>
        </div>

        {/* ── Permission notice ── */}
        {resp && !resp.isAdmin && (
          <Card size="small" className="mb-4 !border-indigo-200 !bg-indigo-50">
            <Space>
              <LockOutlined className="text-indigo-500" />
              <Text className="text-indigo-700 text-sm">
                Đang xem với quyền được cấp — không phụ thuộc vào role hệ thống.
                Liên hệ Admin để thay đổi quyền.
              </Text>
            </Space>
          </Card>
        )}

        {/* ── Stats ── */}
        <Row gutter={16} className="mb-5">
          {[
            {
              title: "Nhân viên hiển thị",
              value: rows.length,
              format: false,
              color: "#6366f1",
              icon: <UserOutlined />,
            },
            {
              title: `Tổng lương gộp ${year}`,
              value: totalGross,
              format: true,
              color: "#2563eb",
              icon: <RiseOutlined />,
            },
            {
              title: `Tổng thực lãnh ${year}`,
              value: totalNet,
              format: true,
              color: "#059669",
              icon: <BankOutlined />,
            },
            {
              title: "Bình quân / người",
              value: rows.length ? Math.round(totalNet / rows.length) : 0,
              format: true,
              color: "#d97706",
              icon: <FallOutlined />,
            },
          ].map((s, i) => (
            <Col span={6} key={i}>
              <Card size="small" className="shadow-sm">
                <Statistic
                  title={<span className="text-xs">{s.title}</span>}
                  value={s.value}
                  formatter={s.format ? (v) => VND(Number(v)) : undefined}
                  prefix={s.icon}
                  valueStyle={{ color: s.color, fontSize: 15, fontWeight: 600 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── Filters ── */}
        <div className="flex gap-3 mb-4 items-center flex-wrap">
          <Input
            placeholder="Tìm nhân viên, phòng ban..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="w-72"
          />
          <Select
            value={year}
            onChange={setYear}
            className="w-28"
            options={[2023, 2024, 2025, 2026].map((y) => ({
              label: `Năm ${y}`,
              value: y,
            }))}
          />
          <Select
            placeholder="Tất cả tháng"
            allowClear
            value={month}
            onChange={setMonth}
            className="w-36"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <Option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </Option>
            ))}
          </Select>
          <Button
            onClick={fetchData}
            loading={loading}
            icon={<SearchOutlined />}
          >
            Làm mới
          </Button>
          <Badge count={rows.length} showZero color="#6366f1" />
        </div>

        {/* ── Table ── */}
        <Card className="shadow-sm rounded-xl overflow-hidden !p-0">
          <Spin spinning={loading}>
            <Table
              dataSource={rows}
              columns={columns}
              rowKey={(r) => r.employee.id}
              scroll={{ x: 1800 }}
              size="small"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (t) => `${t} nhân viên`,
              }}
              onRow={(r) => ({
                className: "hover:bg-indigo-50/40 transition-colors",
              })}
              summary={() => (
                <Table.Summary fixed="bottom">
                  <Table.Summary.Row className="bg-indigo-50 font-bold">
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong className="text-indigo-700">
                        TỔNG CỘNG ({rows.length} nhân viên)
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} colSpan={12} />
                    <Table.Summary.Cell index={16}>
                      <div className="text-right text-blue-700 font-bold text-xs pr-1">
                        {VND(totalGross)}
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={17}>
                      <div className="text-right text-green-700 font-bold text-xs pr-1">
                        {VND(totalNet)}
                      </div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={18} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Spin>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DRAWER — Chi tiết đầy đủ nhân viên
      ══════════════════════════════════════════════════════════════════════ */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <Avatar
              size={36}
              style={{ background: "#6366f1", fontSize: 13, fontWeight: 600 }}
            >
              {drawerEmp?.employee.name
                .split(" ")
                .slice(-2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </Avatar>
            <div>
              <div className="font-semibold text-base leading-tight">
                {drawerEmp?.employee.name}
              </div>
              <Text type="secondary" className="text-xs">
                {drawerEmp?.employee.employeeCode} ·{" "}
                {drawerEmp?.employee.position ?? "—"}
              </Text>
            </div>
          </div>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={860}
        destroyOnClose
        footer={null}
      >
        {drawerEmp && (
          <>
            {/* Thông tin cơ bản */}
            <Descriptions size="small" bordered column={2} className="mb-4">
              <Descriptions.Item label="Phòng ban">
                <Tag color="blue">{drawerEmp.employee.department ?? "—"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chức vụ">
                {drawerEmp.employee.position ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Loại hợp đồng">
                {drawerEmp.employee.contractType ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng thực lãnh cả năm">
                <span className="font-bold text-green-700 text-base">
                  {VND(drawerEmp.totalAnnualNet)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng lương gộp cả năm">
                <span className="font-semibold text-blue-700">
                  {VND(drawerEmp.totalAnnualGross)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Số tháng có lương">
                {drawerEmp.monthlySummary.length} tháng
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" orientationMargin={0}>
              <Space>
                <InfoCircleOutlined />
                <Text strong>Chi tiết từng tháng</Text>
                {drawerEmp.salaryDetails && (
                  <Tag color="red" className="text-xs">
                    Admin — đầy đủ
                  </Tag>
                )}
              </Space>
            </Divider>

            {/* Tổng hợp tháng — bảng */}
            <Table
              dataSource={drawerEmp.monthlySummary}
              rowKey="month"
              size="small"
              pagination={false}
              className="mb-4"
              rowClassName={(r) =>
                r.month === drawerMonth
                  ? "!bg-indigo-50 cursor-pointer"
                  : "cursor-pointer hover:!bg-gray-50"
              }
              onRow={(r) => ({ onClick: () => setDrawerMonth(r.month) })}
              columns={[
                {
                  title: "Tháng",
                  dataIndex: "month",
                  width: 70,
                  render: (m) => (
                    <span
                      className={`font-semibold ${m === drawerMonth ? "text-indigo-600" : ""}`}
                    >
                      T{m}/
                      {
                        drawerEmp.monthlySummary.find((s) => s.month === m)
                          ?.year
                      }
                    </span>
                  ),
                },
                {
                  title: "Loại",
                  dataIndex: "type",
                  width: 80,
                  render: (v) => <Tag className="text-xs">{v}</Tag>,
                },
                {
                  title: "Ngày công",
                  dataIndex: "workingDays",
                  align: "right" as const,
                  width: 80,
                  render: (v) => <span className="text-xs">{v} nc</span>,
                },
                {
                  title: "Lương gộp (1)",
                  dataIndex: "totalGross",
                  align: "right" as const,
                  render: (v) => (
                    <span className="text-blue-700 text-xs">{VND(v)}</span>
                  ),
                },
                ...(resp?.isAdmin
                  ? [
                      {
                        title: "Lương (2)",
                        dataIndex: "totalNet",
                        align: "right" as const,
                        render: (v: number) => (
                          <span className="text-purple-700 text-xs">
                            {VND(v)}
                          </span>
                        ),
                      },
                    ]
                  : []),
                {
                  title: "Nhận lần 1",
                  dataIndex: "firstReceived",
                  align: "right" as const,
                  render: (v: number) => (
                    <span className="text-xs">{VND(v ?? 0)}</span>
                  ),
                },
                {
                  title: "Nhận lần 2",
                  dataIndex: "actualReceived",
                  align: "right" as const,
                  render: (v: number) => (
                    <span className="text-xs">{VND(v ?? 0)}</span>
                  ),
                },
                {
                  title: "Thực lãnh",
                  key: "net",
                  align: "right" as const,
                  render: (_: any, r: MonthSummary) => (
                    <span className="font-bold text-green-700 text-xs">
                      {VND((r.firstReceived ?? 0) + (r.actualReceived ?? 0))}
                    </span>
                  ),
                },
                {
                  title: "",
                  key: "act",
                  width: 40,
                  render: (_: any, r: MonthSummary) => (
                    <Button
                      size="small"
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDrawerMonth(r.month);
                      }}
                      className={
                        r.month === drawerMonth
                          ? "text-indigo-600"
                          : "text-gray-400"
                      }
                    />
                  ),
                },
              ]}
            />

            {/* Chi tiết tháng được chọn */}
            {drawerMonth && (
              <>
                <Divider orientation="left" orientationMargin={0}>
                  <Text strong className="text-indigo-700">
                    Chi tiết tháng {drawerMonth}
                  </Text>
                  <Text type="secondary" className="text-xs ml-2">
                    — bấm vào dòng bảng trên để chuyển tháng
                  </Text>
                </Divider>
                <MonthDetailPanel
                  detail={drawerEmp}
                  month={drawerMonth}
                  isAdmin={resp?.isAdmin ?? false}
                />
              </>
            )}

            {/* Collapse: tóm tắt tất cả tháng (admin) */}
            {drawerEmp.salaryDetails && (
              <>
                <Divider />
                <Collapse
                  size="small"
                  ghost
                  items={[
                    {
                      key: "all",
                      label: (
                        <Text type="secondary" className="text-xs">
                          Xem nhanh tất cả tháng (tóm tắt)
                        </Text>
                      ),
                      children: (
                        <div className="grid grid-cols-3 gap-2">
                          {drawerEmp.monthlySummary.map((ms) => {
                            const net =
                              (ms.firstReceived ?? 0) +
                              (ms.actualReceived ?? 0);
                            return (
                              <Card
                                key={ms.month}
                                size="small"
                                className={`cursor-pointer ${ms.month === drawerMonth ? "border-indigo-400 bg-indigo-50" : ""}`}
                                onClick={() => setDrawerMonth(ms.month)}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <Tag
                                    color={
                                      ms.type === "MANAGER" ? "purple" : "blue"
                                    }
                                    className="text-xs"
                                  >
                                    T{ms.month}
                                  </Tag>
                                  <Text
                                    type="secondary"
                                    className="text-[10px]"
                                  >
                                    {ms.workingDays}nc
                                  </Text>
                                </div>
                                <div className="text-xs text-green-700 font-semibold">
                                  {VND(net)}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  Gộp: {SHORT(ms.totalGross)}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      ),
                    },
                  ]}
                />
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
