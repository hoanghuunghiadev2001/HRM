/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceOverview } from "@/components/attendance-overview";
import { EmployeeStatusChart } from "@/components/employee-status-chart";
import { DepartmentDistribution } from "@/components/department-distribution";
import { RecentLeaveRequests } from "@/components/recent-leave-requests";
import LeaveReportPage from "./reportsDetail/leave/page";
import {
  AreaChartOutlined,
  FileTextOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [response] = await Promise.all([fetch("/api/report/dashboard")]);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Đang tải dữ liệu...</h2>
          <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }
  console.log(dashboardData?.departmentDistribution);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 md:gap-8 md:p-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex gap-5 justify-between">
            <div className="flex items-center justify-between">
              <h1 className="text-sm md:text-3xl font-bold tracking-tight">
                Thống kê
              </h1>
            </div>
            <TabsList>
              <TabsTrigger value="overview" className="">
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="leave">Nghỉ phép</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 shadow-card-report p-6 rounded-2xl">
              <div className="rounded-2xl bg-gradient-to-r from-[#2c00cc] to-[#9076ec] p-4">
                <p className="text-white text-lg font-bold">Tổng nhân viên</p>

                <div className="flex justify-between">
                  <div>
                    <p className="text-white !text-[30px] font-bold">
                      {dashboardData?.totalEmployees || 0}
                    </p>
                    <p className="text-base text-white font-semibold">
                      {dashboardData?.newEmployeesChange > 0
                        ? `+${dashboardData.newEmployeesChange}`
                        : dashboardData?.newEmployeesChange}{" "}
                      so với tháng trước
                    </p>
                  </div>
                  <UserOutlined className="!text-white !text-[50px] " />
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-[#cc8b00] to-[#ecc776] p-4">
                <p className="text-white text-lg font-bold"> Tỷ lệ đi làm</p>

                <div className="flex justify-between">
                  <div>
                    <p className="text-white !text-[30px] font-bold">
                      {dashboardData?.attendanceRate || 0}%
                    </p>
                    <p className="text-base text-white font-semibold">
                      {dashboardData?.attendanceRateChange > 0
                        ? `+${dashboardData.attendanceRateChange}`
                        : dashboardData?.attendanceRateChange}
                      % so với tháng trước
                    </p>
                  </div>
                  <AreaChartOutlined className="!text-white !text-[50px] " />
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-[#0069cc] to-[#76a5ec] p-4">
                <p className="text-white text-lg font-bold"> Đơn nghỉ phép</p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-white !text-[30px] font-bold">
                      {dashboardData?.leaveRequests?.total || 0}
                    </p>
                    <p className="text-base text-white font-semibold">
                      {dashboardData?.leaveRequests?.pending || 0} đang chờ
                      duyệt
                    </p>
                  </div>
                  <FileTextOutlined className="!text-white !text-[50px] " />
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-[#07cc00] to-[#7aec76] p-4">
                <p className="text-white text-lg font-bold">Nhân viên mới</p>

                <div className="flex justify-between">
                  <div>
                    <p className="text-white !text-[30px] font-bold">
                      {dashboardData?.newEmployees || 0}
                    </p>
                    <p className="text-base text-white font-semibold">
                      Trong tháng này
                    </p>
                  </div>
                  <UserAddOutlined className="!text-white !text-[50px] " />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 ">
              <AttendanceOverview />

              <div className="shadow-card-report p-6 rounded-2xl">
                <DepartmentDistribution
                  departmentData={dashboardData?.departmentDistribution}
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 ">
              <div className="shadow-card-report p-6 rounded-2xl">
                <EmployeeStatusChart
                  statusData={dashboardData?.employeeStatusDistribution}
                />
              </div>
              <div className="shadow-card-report p-6 rounded-2xl">
                <p className="font-bold text-2xl mb-2">Nghỉ phép</p>
                <div className="overflow-x-auto">
                  <RecentLeaveRequests
                    leaveRequests={dashboardData?.recentLeaveRequests || []}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leave" className="space-y-4">
            <LeaveReportPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
