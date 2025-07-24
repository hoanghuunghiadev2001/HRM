"use client";

import { useState } from "react";
import { Modal, Button, Input, message } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";

interface ApproveModalProps {
  open: boolean;
  onClose: () => void;
  proposalId: number;
  proposalTitle: string;
  refresh?: () => void;
}

export default function ModalApproveProposal({
  open,
  onClose,
  proposalId,
  proposalTitle,
  refresh,
}: ApproveModalProps) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!decision) {
      return message.warning("Vui lòng chọn phê duyệt hoặc từ chối.");
    }

    setLoading(true);
    try {
      await axios.post("/api/proposals/approve", {
        proposalId,
        status: decision,
        comment,
      });

      message.success(
        decision === "approve" ? "Đã phê duyệt!" : "Đã từ chối đề xuất!"
      );
      onClose();
      refresh?.();
    } catch (error) {
      console.error("Approval error:", error);
      message.error("Có lỗi xảy ra khi gửi phê duyệt.");
    } finally {
      setLoading(false);
      setDecision(null);
      setComment("");
    }
  };

  return (
    <Modal
      open={open}
      title="Phê duyệt đề xuất"
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Gửi"
      confirmLoading={loading}
    >
      <div className="space-y-4">
        <p>
          <strong>Tiêu đề:</strong> {proposalTitle}
        </p>

        <div className="flex space-x-2">
          <Button
            icon={<CheckOutlined />}
            type={decision === "approve" ? "primary" : "default"}
            onClick={() => setDecision("approve")}
          >
            Phê duyệt
          </Button>
          <Button
            icon={<CloseOutlined />}
            danger
            type={decision === "reject" ? "primary" : "default"}
            onClick={() => setDecision("reject")}
          >
            Từ chối
          </Button>
        </div>

        <Input.TextArea
          rows={4}
          placeholder="Ghi chú (tuỳ chọn)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  );
}
