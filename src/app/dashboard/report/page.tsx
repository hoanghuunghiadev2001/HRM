/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceOverview } from "@/components/attendance-overview";
import { EmployeeStatusChart } from "@/components/employee-status-chart";
import { DepartmentDistribution } from "@/components/department-distribution";
import { RecentLeaveRequests } from "@/components/recent-leave-requests";
import LeaveReportPage from "./reportsDetail/leave/page";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/report/dashboard");
        const data = await response.json();
        setDashboardData(data);
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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex gap-5 justify-between">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>
            <TabsList>
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>

              <TabsTrigger value="leave">Nghỉ phép</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng nhân viên
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.totalEmployees || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.newEmployeesChange > 0
                      ? `+${dashboardData.newEmployeesChange}`
                      : dashboardData?.newEmployeesChange}{" "}
                    so với tháng trước
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tỷ lệ đi làm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.attendanceRate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.attendanceRateChange > 0
                      ? `+${dashboardData.attendanceRateChange}`
                      : dashboardData?.attendanceRateChange}
                    % so với tháng trước
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Đơn nghỉ phép
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.leaveRequests?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.leaveRequests?.pending || 0} đang chờ duyệt
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Nhân viên mới
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.newEmployees || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trong tháng này
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Thống kê chấm công</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <AttendanceOverview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Phân bố theo phòng ban</CardTitle>
                </CardHeader>
                <CardContent>
                  <DepartmentDistribution
                    departmentData={dashboardData?.departmentDistribution}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Trạng thái nhân viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmployeeStatusChart
                    statusData={dashboardData?.employeeStatusDistribution}
                  />
                </CardContent>
              </Card>
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Đơn nghỉ phép gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentLeaveRequests
                    leaveRequests={dashboardData?.recentLeaveRequests || []}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo chấm công chi tiết</CardTitle>
                <CardDescription>
                  Thống kê chấm công theo ngày, tuần, tháng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Chọn khoảng thời gian để xem báo cáo chi tiết
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê nghỉ phép</CardTitle>
              </CardHeader>
              <CardContent>
                <LeaveReportPage />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo nhân viên</CardTitle>
                <CardDescription>
                  Thống kê và phân tích thông tin nhân viên
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Chọn tiêu chí để xem báo cáo chi tiết
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
