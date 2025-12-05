// components/RoleTag.tsx
import React from "react";
import { Tag, Tooltip } from "antd";
import { Shield, User, Users } from "lucide-react";

type Role = string | undefined | null;
type Size = "sm" | "md";

const ROLE_MAP: Record<
  string,
  {
    label: string;
    color: string; // Antd color string or css color
    description?: string;
    emoji?: string;
    icon?: React.ReactNode;
    tw?: string; // extra tailwind classes
  }
> = {
  ADMIN: {
    label: "ADMIN",
    color: "#C2410C", // deep orange / red
    description: "Quản trị hệ thống — toàn quyền",
    icon: <Shield size={12} />,
    tw: "!bg-red-50 !text-red-700",
  },
  MANAGER: {
    label: "MANAGER",
    color: "#0369A1", // blue
    description: "Trưởng/Quản lý — phê duyệt, theo dõi",
    icon: <Users size={12} />,
    tw: "!bg-sky-50 !text-sky-700",
  },
  USER: {
    label: "USER",
    color: "#15803d", // green
    description: "Nhân viên — quyền sử dụng bình thường",
    icon: <User size={12} />,
    tw: "!bg-emerald-50 !text-emerald-700",
  },

  // thêm role khác nếu cần
};

export default function RoleTag({
  role,
  size = "md",
  className = "",
}: {
  role?: Role;
  size?: Size;
  className?: string;
}) {
  const key = (role || "USER").toString().toUpperCase();
  const info = ROLE_MAP[key] ?? {
    label: key,
    color: "#374151",
    description: key,
    icon: <User size={12} />,
    tw: "!bg-slate-50 !text-slate-700",
  };

  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const rounded = "rounded-md";
  const baseTw = `${info.tw} ${padding} ${rounded} flex items-center gap-2 ${className}`;

  const inner = (
    <Tag
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
      }}
      className={baseTw}
    >
      {info.icon ? (
        <span className="inline-flex items-center">{info.icon}</span>
      ) : null}
      <span className="font-medium">{info.label}</span>
    </Tag>
  );

  return <Tooltip title={info.description || info.label}>{inner}</Tooltip>;
}
