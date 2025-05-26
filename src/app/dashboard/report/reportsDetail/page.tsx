"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendanceOverview } from "@/components/attendance-overview";
import { LeaveRequestsChart } from "@/components/leave-requests-chart";
import { EmployeeStatusChart } from "@/components/employee-status-chart";
import { DepartmentDistribution } from "@/components/department-distribution";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("month");
  const [department, setDepartment] = useState("all");

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-sm md:text-3xl font-bold">Báo Cáo Nhân Sự</h1>
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              <SelectItem value="tech">Kỹ thuật</SelectItem>
              <SelectItem value="sales">Kinh doanh</SelectItem>
              <SelectItem value="admin">Hành chính</SelectItem>
              <SelectItem value="hr">Nhân sự</SelectItem>
              <SelectItem value="accounting">Kế toán</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">Chấm công</TabsTrigger>
          <TabsTrigger value="leave">Nghỉ phép</TabsTrigger>
          <TabsTrigger value="employees">Nhân viên</TabsTrigger>
          <TabsTrigger value="summary">Tổng hợp</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tỷ lệ đi làm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95.3%</div>
                <p className="text-xs text-muted-foreground">
                  +0.5% so với kỳ trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Đúng giờ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89.7%</div>
                <p className="text-xs text-muted-foreground">
                  +1.2% so với kỳ trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Đi muộn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5.6%</div>
                <p className="text-xs text-muted-foreground">
                  -0.7% so với kỳ trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vắng mặt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.7%</div>
                <p className="text-xs text-muted-foreground">
                  -0.5% so với kỳ trước
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê chấm công</CardTitle>
              <CardDescription>
                Biểu đồ chấm công theo thời gian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceOverview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng đơn nghỉ phép
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-muted-foreground">
                  +8 so với kỳ trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">112</div>
                <p className="text-xs text-muted-foreground">90.3% tổng đơn</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Đang chờ duyệt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">6.5% tổng đơn</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">3.2% tổng đơn</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê nghỉ phép theo loại</CardTitle>
              <CardDescription>
                Phân bố đơn nghỉ phép theo từng loại phép
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <LeaveRequestsChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng nhân viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">120</div>
                <p className="text-xs text-muted-foreground">
                  +2 so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Chính thức
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95</div>
                <p className="text-xs text-muted-foreground">
                  79.2% tổng nhân viên
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Học việc</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  19.2% tổng nhân viên
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Nghỉ việc</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Trong tháng này</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái nhân viên</CardTitle>
                <CardDescription>
                  Phân bố nhân viên theo trạng thái
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeStatusChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Phân bố theo phòng ban</CardTitle>
                <CardDescription>
                  Số lượng nhân viên trong từng phòng ban
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentDistribution />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng hợp báo cáo</CardTitle>
              <CardDescription>Tổng quan về tình hình nhân sự</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="mb-4 text-lg font-medium">Chấm công</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Tỷ lệ đi làm
                      </div>
                      <div className="mt-2 text-2xl font-bold">95.3%</div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Tỷ lệ đúng giờ
                      </div>
                      <div className="mt-2 text-2xl font-bold">89.7%</div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Tỷ lệ đi muộn
                      </div>
                      <div className="mt-2 text-2xl font-bold">5.6%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Nghỉ phép</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Tổng đơn nghỉ phép
                      </div>
                      <div className="mt-2 text-2xl font-bold">124</div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Tỷ lệ duyệt
                      </div>
                      <div className="mt-2 text-2xl font-bold">90.3%</div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Loại phép phổ biến
                      </div>
                      <div className="mt-2 text-2xl font-bold">
                        Phép năm (PN)
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium">Nhân viên</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Tổng nhân viên
                      </div>
                      <div className="mt-2 text-2xl font-bold">120</div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Phòng ban lớn nhất
                      </div>
                      <div className="mt-2 text-2xl font-bold">
                        Kinh doanh (40)
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        Thâm niên trung bình
                      </div>
                      <div className="mt-2 text-2xl font-bold">3.5 năm</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
