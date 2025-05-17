import React from "react";
import { Button, Modal } from "antd";

interface ModalSuccessProps {
  title: string;
  contentText: string;
}

const ModalSuccess = ({ title, contentText }: ModalSuccessProps) => {
  const [modal, contextHolder] = Modal.useModal();

  const countDown = () => {
    let secondsToGo = 5;

    const instance = modal.success({
      title: "Cập nhật thành công",
      content: `This modal will be destroyed after ${secondsToGo} second.`,
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
      //   instance.update({
      //     content: `This modal will be destroyed after ${secondsToGo} second.`,
      //   });
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  return (
    <>
      {/* <Button onClick={countDown}>Open modal to close in 5s</Button> */}
      {contextHolder}
    </>
  );
};

export default ModalSuccess;
