import React, { useEffect, useState } from "react";
import { Drawer } from "antd";

interface modalNeedApprovedProps {
  open: boolean;
  onClose: () => void;
}
const modalNeedApproved = ({ onClose, open }: modalNeedApprovedProps) => {
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

export default modalNeedApproved;
