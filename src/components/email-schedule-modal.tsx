"use client";

import type React from "react";

import { useState, useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface EmailScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: any;
  onSave: (data: any) => Promise<void>;
}

export function EmailScheduleModal({
  open,
  onOpenChange,
  schedule,
  onSave,
}: EmailScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    recipients: "",
    reportType: "leave",
    frequency: "daily",
    dayOfWeek: 1, // Thứ 2
    dayOfMonth: 1,
    hour: 8,
    minute: 0,
    department: "all",
    active: true,
  });

  // Cập nhật form khi schedule thay đổi
  useEffect(() => {
    if (schedule) {
      setFormData({
        name: schedule.name,
        recipients: Array.isArray(schedule.recipients)
          ? schedule.recipients.join(", ")
          : schedule.recipients,
        reportType: schedule.reportType,
        frequency: schedule.frequency,
        dayOfWeek: schedule.dayOfWeek ?? 1,
        dayOfMonth: schedule.dayOfMonth ?? 1,
        hour: schedule.hour,
        minute: schedule.minute,
        department: schedule.department || "all",
        active: schedule.active,
      });
    } else {
      // Reset form khi thêm mới
      setFormData({
        name: "",
        recipients: "",
        reportType: "leave",
        frequency: "daily",
        dayOfWeek: 1,
        dayOfMonth: 1,
        hour: 8,
        minute: 0,
        department: "all",
        active: true,
      });
    }
  }, [schedule, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: string, value: string) => {
    const numValue = Number.parseInt(value, 10);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Xử lý danh sách email
      const recipients = formData.recipients
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email && /^\S+@\S+\.\S+$/.test(email));

      if (recipients.length === 0) {
        alert("Vui lòng nhập ít nhất một email hợp lệ");
        setLoading(false);
        return;
      }

      // Chuẩn bị dữ liệu để lưu
      const scheduleData = {
        ...formData,
        recipients,
      };

      await onSave(scheduleData);
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Đã xảy ra lỗi khi lưu lịch gửi email");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <Dialog open={open} onOpenChange={onOpenChange}>
    //   <DialogContent className="sm:max-w-[600px]">
    //     <form onSubmit={handleSubmit}>
    //       <DialogHeader>
    //         <DialogTitle>
    //           {schedule
    //             ? "Chỉnh sửa lịch gửi email"
    //             : "Thêm lịch gửi email mới"}
    //         </DialogTitle>
    //         <DialogDescription>
    //           {schedule
    //             ? "Chỉnh sửa thông tin lịch gửi email tự động"
    //             : "Thiết lập lịch gửi báo cáo tự động qua email"}
    //         </DialogDescription>
    //       </DialogHeader>
    //       <div className="grid gap-4 py-4">
    //         <div className="grid grid-cols-4 items-center gap-4">
    //           <Label htmlFor="name" className="text-right">
    //             Tên lịch
    //           </Label>
    //           <Input
    //             id="name"
    //             name="name"
    //             value={formData.name}
    //             onChange={handleChange}
    //             placeholder="Báo cáo nghỉ phép hàng tuần"
    //             className="col-span-3"
    //             required
    //           />
    //         </div>
    //         <div className="grid grid-cols-4 items-center gap-4">
    //           <Label htmlFor="recipients" className="text-right">
    //             Người nhận
    //           </Label>
    //           <Textarea
    //             id="recipients"
    //             name="recipients"
    //             value={formData.recipients}
    //             onChange={handleChange}
    //             placeholder="email1@example.com, email2@example.com"
    //             className="col-span-3"
    //             required
    //           />
    //         </div>
    //         <div className="grid grid-cols-4 items-center gap-4">
    //           <Label htmlFor="reportType" className="text-right">
    //             Loại báo cáo
    //           </Label>
    //           <Select
    //             value={formData.reportType}
    //             onValueChange={(value) =>
    //               handleSelectChange("reportType", value)
    //             }
    //           >
    //             <SelectTrigger className="col-span-3">
    //               <SelectValue placeholder="Chọn loại báo cáo" />
    //             </SelectTrigger>
    //             <SelectContent>
    //               <SelectItem value="leave">Báo cáo nghỉ phép</SelectItem>
    //               <SelectItem value="attendance">Báo cáo chấm công</SelectItem>
    //               <SelectItem value="employees">Báo cáo nhân viên</SelectItem>
    //             </SelectContent>
    //           </Select>
    //         </div>
    //         <div className="grid grid-cols-4 items-center gap-4">
    //           <Label htmlFor="frequency" className="text-right">
    //             Tần suất
    //           </Label>
    //           <Select
    //             value={formData.frequency}
    //             onValueChange={(value) =>
    //               handleSelectChange("frequency", value)
    //             }
    //           >
    //             <SelectTrigger className="col-span-3">
    //               <SelectValue placeholder="Chọn tần suất gửi" />
    //             </SelectTrigger>
    //             <SelectContent>
    //               <SelectItem value="daily">Hàng ngày</SelectItem>
    //               <SelectItem value="weekly">Hàng tuần</SelectItem>
    //               <SelectItem value="monthly">Hàng tháng</SelectItem>
    //             </SelectContent>
    //           </Select>
    //         </div>

    //         {formData.frequency === "weekly" && (
    //           <div className="grid grid-cols-4 items-center gap-4">
    //             <Label htmlFor="dayOfWeek" className="text-right">
    //               Ngày trong tuần
    //             </Label>
    //             <Select
    //               value={formData.dayOfWeek.toString()}
    //               onValueChange={(value) =>
    //                 handleNumberChange("dayOfWeek", value)
    //               }
    //             >
    //               <SelectTrigger className="col-span-3">
    //                 <SelectValue placeholder="Chọn ngày trong tuần" />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 <SelectItem value="0">Chủ nhật</SelectItem>
    //                 <SelectItem value="1">Thứ 2</SelectItem>
    //                 <SelectItem value="2">Thứ 3</SelectItem>
    //                 <SelectItem value="3">Thứ 4</SelectItem>
    //                 <SelectItem value="4">Thứ 5</SelectItem>
    //                 <SelectItem value="5">Thứ 6</SelectItem>
    //                 <SelectItem value="6">Thứ 7</SelectItem>
    //               </SelectContent>
    //             </Select>
    //           </div>
    //         )}

    //         {formData.frequency === "monthly" && (
    //           <div className="grid grid-cols-4 items-center gap-4">
    //             <Label htmlFor="dayOfMonth" className="text-right">
    //               Ngày trong tháng
    //             </Label>
    //             <Select
    //               value={formData.dayOfMonth.toString()}
    //               onValueChange={(value) =>
    //                 handleNumberChange("dayOfMonth", value)
    //               }
    //             >
    //               <SelectTrigger className="col-span-3">
    //                 <SelectValue placeholder="Chọn ngày trong tháng" />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {Array.from({ length: 31 }, (_, i) => (
    //                   <SelectItem key={i + 1} value={(i + 1).toString()}>
    //                     Ngày {i + 1}
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //           </div>
    //         )}

    //         <div className="grid grid-cols-4 items-center gap-4">
    //           <Label htmlFor="time" className="text-right">
    //             Thời gian
    //           </Label>
    //           <div className="col-span-3 flex items-center gap-2">
    //             <Select
    //               value={formData.hour.toString()}
    //               onValueChange={(value) => handleNumberChange("hour", value)}
    //             >
    //               <SelectTrigger className="w-24">
    //                 <SelectValue placeholder="Giờ" />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {Array.from({ length: 24 }, (_, i) => (
    //                   <SelectItem key={i} value={i.toString()}>
    //                     {i.toString().padStart(2, "0")}
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //             <span>:</span>
    //             <Select
    //               value={formData.minute.toString()}
    //               onValueChange={(value) => handleNumberChange("minute", value)}
    //             >
    //               <SelectTrigger className="w-24">
    //                 <SelectValue placeholder="Phút" />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {Array.from({ length: 60 }, (_, i) => (
    //                   <SelectItem key={i} value={i.toString()}>
    //                     {i.toString().padStart(2, "0")}
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //           </div>
    //         </div>

    //         <div className="grid grid-cols-4 items-center gap-4">
    //           <Label htmlFor="department" className="text-right">
    //             Phòng ban
    //           </Label>
    //           <Select
    //             value={formData.department}
    //             onValueChange={(value) =>
    //               handleSelectChange("department", value)
    //             }
    //           >
    //             <SelectTrigger className="col-span-3">
    //               <SelectValue placeholder="Chọn phòng ban" />
    //             </SelectTrigger>
    //             <SelectContent>
    //               <SelectItem value="all">Tất cả phòng ban</SelectItem>
    //               <SelectItem value="tech">Kỹ thuật</SelectItem>
    //               <SelectItem value="sales">Kinh doanh</SelectItem>
    //               <SelectItem value="admin">Hành chính</SelectItem>
    //               <SelectItem value="hr">Nhân sự</SelectItem>
    //               <SelectItem value="accounting">Kế toán</SelectItem>
    //             </SelectContent>
    //           </Select>
    //         </div>
    //       </div>
    //       <DialogFooter>
    //         <Button
    //           type="button"
    //           variant="outline"
    //           onClick={() => onOpenChange(false)}
    //           disabled={loading}
    //         >
    //           Hủy
    //         </Button>
    //         <Button type="submit" disabled={loading}>
    //           {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    //           {schedule ? "Cập nhật" : "Tạo lịch"}
    //         </Button>
    //       </DialogFooter>
    //     </form>
    //   </DialogContent>
    // </Dialog>
    <div>aaaa</div>
  );
}
