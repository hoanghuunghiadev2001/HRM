import { Input, Tooltip } from "antd";

export function formatCurrency(number: number): string {
  return number.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

interface StatusLeaveProps {
  status: string;
}

export const StatusLeave = ({ status }: StatusLeaveProps) => {
  return (
    <div
      className={`px-4 py-1 rounded-xl w-fit font-medium  ${
        status === "pending"
          ? "bg-[#a5cbe4] text-[#1181c8]"
          : status === "approved"
          ? "text-[#0b5705] bg-[#c9fab4]"
          : "bg-[#ffc0c2] text-[#eb2128]"
      }`}
    >
      {status === "pending"
        ? "Đang chờ"
        : status === "approved"
        ? "Chấp nhận"
        : "Từ chối"}
    </div>
  );
};

export function formatDateTime(dateString: string) {
  // dateStr = "2025-05-21T17:00:00.000Z"
  // Lấy phần giờ phút
  const time = dateString.slice(11, 16); // "17:00"
  // Lấy phần ngày tháng năm
  const datePart = dateString.slice(0, 10); // "2025-05-21"
  // Đổi định dạng ngày tháng năm từ yyyy-mm-dd sang dd-mm-yyyy
  const [year, month, day] = datePart.split("-");
  return `${time} ${day}-${month}-${year}`;
}

interface NumericInputProps {
  style: React.CSSProperties;
  value: string;
  onChange: (value: string) => void;
  disable?: boolean;
}
const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
export const NumericInput = (props: NumericInputProps) => {
  const { value, onChange } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === "" || inputValue === "-") {
      onChange(inputValue);
    }
  };

  // '.' at the end or only '-' in the input box.
  const handleBlur = () => {
    let valueTemp = value;
    if (value.charAt(value.length - 1) === "." || value === "-") {
      valueTemp = value.slice(0, -1);
    }
    onChange(valueTemp.replace(/0*(\d+)/, "$1"));
  };

  const title = value ? (
    <span className="numeric-input-title">
      {value !== "-" ? formatNumber(Number(value)) : "-"}
    </span>
  ) : (
    ""
  );

  return (
    <Tooltip
      trigger={["focus"]}
      title={title}
      placement="topLeft"
      classNames={{ root: "numeric-input" }}
    >
      <Input
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder=""
        maxLength={16}
        disabled={props.disable}
      />
    </Tooltip>
  );
};
