import { Modal, Spin } from "antd";
import "../app/globals.css";
interface ModalLoadingProps {
  isOpen: boolean;
}

const contentStyle: React.CSSProperties = {
  padding: 50,
  background: "rgba(0, 0, 0, 0.05)",
  borderRadius: 4,
};

const content = <div style={contentStyle} />;

const ModalLoading = ({ isOpen }: ModalLoadingProps) => {
  return (
    <Modal
      closeIcon={false}
      footer={false}
      className="!bg-transparent modal-loading z-50"
      centered
      open={isOpen}
    >
      <div className="flex justify-center items-center ">
        <div className="rounded-2xl overflow-hidden">
          <Spin
            tip="Đang tải"
            className="bg-white rounded-2xl overflow-hidden"
            size="large"
          >
            {content}
          </Spin>
        </div>
      </div>
    </Modal>
  );
};
export default ModalLoading;
