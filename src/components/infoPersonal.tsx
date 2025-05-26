import { Input } from "antd";

interface InfoPersonalProps {
  titleValue: string;
  value?: string | number;
  canChange?: boolean;
  onChangeValue?: (value: string | number) => void;
}

const InfoPersonal = ({
  titleValue,
  value,
  canChange,
  onChangeValue,
}: InfoPersonalProps) => {
  return (
    <div className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
      <p className="shrink-0"> {titleValue + ":"}</p>
      {canChange === true ? (
        <Input
          placeholder="Basic usage"
          value={value}
          onChange={
            onChangeValue ? (e) => onChangeValue(e.target.value) : () => {}
          }
        />
      ) : (
        <p className="inline font-medium text-[#3a3a3a]">{" " + value}</p>
      )}
    </div>
  );
};
export default InfoPersonal;
