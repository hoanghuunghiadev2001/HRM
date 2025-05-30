/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// dynamic import để tránh lỗi SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Interface cho Department (Bộ phận)
interface Department {
  name: string; // Tên bộ phận
  abbreviation: string; // Viết tắt bộ phận
}

// Interface cho Position (Chức vụ)
interface Position {
  name: string; // Tên chức vụ
  level: number; // Cấp bậc chức vụ (ví dụ: 1 = Leader, 2 = Staff...)
}

// Interface cho WorkInfo (Thông tin công việc)
interface WorkInfo {
  department: Department; // Bộ phận làm việc
  position: Position; // Chức vụ
}

// Interface cho Employee (Nhân viên)
interface Employee {
  id: string; // ID nhân viên
  name: string; // Tên nhân viên
  employeeCode: string; // Mã nhân viên
  workInfo: WorkInfo; // Thông tin công việc
}

// Interface cho KPIEmployee (KPI của từng nhân viên)
interface KPIEmployee {
  id: string; // ID (nếu có, nếu không thì có thể bỏ)
  employee: Employee; // Thông tin nhân viên
  // Thêm các field liên quan đến KPI nhân viên (nếu có, ví dụ: doanh thu, số xe, trạng thái...)
  targetRevenue?: number; // Chỉ tiêu doanh thu (nếu có)
  actualRevenue?: number; // Doanh thu thực tế (nếu có)
  targetTrips?: number; // Chỉ tiêu số lượt xe (nếu có)
  actualTrips?: number; // Số lượt xe thực tế (nếu có)
  [key: string]: any; // Cho phép các field khác
}

// Interface cho KPI (KPI của kỳ/tháng)
interface KPI {
  id: string; // ID KPI
  period: string; // Kỳ (dạng YYYY-MM)
  kpiEmployees: KPIEmployee[]; // Danh sách KPI của từng nhân viên
}

// Response API KPI
interface KPIReportResponse {
  success: boolean; // Trạng thái API
  data: KPI[]; // Dữ liệu KPI
  error?: string; // Lỗi (nếu có)
}

const ChartKPI = () => {
  const [data, setData] = useState<KPIEmployee[]>([]); // Chuyển kiểu dữ liệu sang KPIEmployee[]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchKPI() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/kpis/report`);
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const json: KPIReportResponse = await res.json();
        if (json.success) {
          // Gộp tất cả kpiEmployees từ các KPI period lại
          const allKpiEmployees = json.data.flatMap((kpi) => kpi.kpiEmployees);
          setData(allKpiEmployees);
        } else {
          setError("Lỗi khi tải dữ liệu KPI");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchKPI();
  }, []);

  // Tạo danh sách tên nhân viên
  const employeeNames = data.map((d) => d.employee.name);

  // Series dữ liệu doanh thu
  const revenueSeries = [
    {
      name: "Chỉ tiêu doanh thu",
      data: data.map((d) => d.targetRevenue ?? 0),
    },
    {
      name: "Doanh thu thực tế",
      data: data.map((d) => d.achievedRevenue ?? 0),
    },
  ];

  // Series dữ liệu lượt xe
  const vehicleSeries = [
    {
      name: "Chỉ tiêu lượt xe",
      data: data.map((d) => d.targetVehicleCount ?? 0),
    },
    {
      name: "Lượt xe thực tế",
      data: data.map((d) => d.achievedVehicleCount ?? 0),
    },
  ];

  const commonOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: employeeNames,
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: { text: undefined },
      labels: {
        formatter: (val: number) => {
          if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
          if (val >= 1000) return (val / 1000).toFixed(1) + "K";
          return val.toString();
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toLocaleString();
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: false,
      offsetY: 0,
      offsetX: 0,
    },
  };

  return (
    <div>
      <h2>Biểu đồ doanh thu</h2>
      <Chart
        options={commonOptions}
        series={revenueSeries}
        type="bar"
        height={350}
      />

      <h2 className="mt-8">Biểu đồ lượt xe</h2>
      <Chart
        options={commonOptions}
        series={vehicleSeries}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default ChartKPI;
