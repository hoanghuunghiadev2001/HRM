import React, { useEffect, useState } from "react";
import { Drawer } from "antd";

interface ModalNeedApprovedProps {
  open: boolean;
  onClose: () => void;
}
const ModalNeedApproved = ({ onClose, open }: ModalNeedApprovedProps) => {
  return (
    <>
      <Drawer
        title={<p>Phê duyệ</p>}
        placement="right"
        size={"large"}
        onClose={onClose}
        open={open}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  );
};

export default ModalNeedApproved;
