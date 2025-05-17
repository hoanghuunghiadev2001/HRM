import { Drawer } from "antd";
import { getUserFromLocalStorage, RequestLeave } from "./api";
import { formatDateTime, StatusLeave } from "./function";
// import { InfoPersonal } from "@/app/dashboard/page";
import TextArea from "antd/es/input/TextArea";
import { InfoPersonal } from "@/app/dashboard/page";

interface modalDetailLeaveProps {
  open: boolean;
  onClose: () => void;
  title: string;
  infoRequetLeave?: RequestLeave;
}
const ModalDetailLeave = ({
  onClose,
  open,
  title,
  infoRequetLeave,
}: modalDetailLeaveProps) => {
  return (
    <Drawer
      title={
        <div className="flex items-center gap-4 w-full justify-between">
          <p> {title}</p>
          <StatusLeave status={infoRequetLeave?.status ?? "pending"} />
        </div>
      }
      closable={{ "aria-label": "Close Button" }}
      onClose={onClose}
      open={open}
    >
      <div>
        <p className="text-xl font-bold">Thông tin:</p>
        <div className="flex justify-center mt-2">
          <img
            src={infoRequetLeave?.employee.avatar}
            alt=""
            className="h-[100px] w-[100px] rounded-[50%] object-cover"
          />
        </div>
        <div className="pl-4 mt-2">
          <InfoPersonal
            titleValue="Họ và tên"
            value={infoRequetLeave?.employee.name}
          />
          <InfoPersonal
            titleValue="MSNV"
            value={infoRequetLeave?.employee.employeeCode}
          />
          <InfoPersonal
            titleValue="Bộ phận"
            value={infoRequetLeave?.employee.workInfo.department}
          />
          <InfoPersonal
            titleValue="Chức vụ"
            value={infoRequetLeave?.employee.workInfo.position}
          />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-xl font-bold">Chi tiết:</p>
        <div className="pl-4 mt-1">
          <InfoPersonal
            titleValue="Loại phép"
            value={infoRequetLeave?.leaveType}
          />
          <InfoPersonal
            titleValue="Bắt đầu"
            value={
              formatDateTime(infoRequetLeave?.startDate ?? "").split(" ")[0] +
              "," +
              " Ngày " +
              formatDateTime(infoRequetLeave?.startDate ?? "").split(" ")[1]
            }
          />
          <InfoPersonal
            titleValue="kết thúc"
            value={
              formatDateTime(infoRequetLeave?.endDate ?? "").split(" ")[0] +
              "," +
              " Ngày " +
              formatDateTime(infoRequetLeave?.endDate ?? "").split(" ")[1]
            }
          />
          <InfoPersonal
            titleValue="Tổng thời gian"
            value={infoRequetLeave?.totalHours + " Giờ"}
          />
          <div>
            <p className="font-bold text-[#242424] flex flex-shrink-0 gap-2 items-center">
              Lý do:
            </p>
            <TextArea
              disabled
              rows={4}
              placeholder=""
              value={infoRequetLeave?.reason}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <p className="font-bold text-[#242424] flex flex-shrink-0 gap-2 items-center">
              Trạng thái
            </p>
            <StatusLeave status={infoRequetLeave?.status ?? "pending"} />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ModalDetailLeave;
