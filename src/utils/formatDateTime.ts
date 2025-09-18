// utils/formatDateTime.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDateTime(dateString: string) {
  if (!dateString) return "-";

  return dayjs(dateString)
    .tz("Asia/Ho_Chi_Minh") // chuyển sang VN timezone
    .format("HH:mm DD-MM-YYYY");
}
