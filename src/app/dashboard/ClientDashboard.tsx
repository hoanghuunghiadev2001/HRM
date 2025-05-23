"use client";

import React, { useEffect, useState } from "react";
import {
  ClipboardPlus,
  FileStack,
  FileText,
  Fingerprint,
  LogOut,
  UserRoundPen,
  UsersRound,
} from "lucide-react";
import {
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Form, Menu, Modal } from "antd";
import type { MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import ModalLoading from "@/components/modalLoading";
import { useMutation } from "@tanstack/react-query";
import { logoutApi, postchangePassword } from "@/lib/api";
import Image from "next/image";
import ModalChangePass from "@/components/modalChangePass";
import { interfaceChangePassword } from "@/lib/interface";

interface User {
  name: string;
  avatar?: string;
  employeeCode: string;
}

type MenuItem = Required<MenuProps>["items"][number];

export default function ClientDashboard({
  isAdmin,
  children,
}: {
  isAdmin: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalChangePass, setModalChangePass] = useState(false);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const countDown = () => {
    let secondsToGo = 3;

    const instance = modal.success({
      title: "Đổi mật khẩu thành công",
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  const handleChangPass = async (change: interfaceChangePassword) => {
    const res = await postchangePassword(change);
    if (res.status === 1) {
      countDown();
      setModalChangePass(false);
    } else {
      form.setFields([
        {
          name: "currentPassword",
          errors: ["Mật khẩu hiện tại không đúng"],
        },
      ]);
    }
  };

  const Menus: MenuItem[] = [
    { key: "/dashboard", icon: <UserRoundPen />, label: "Hồ sơ" },
    { key: "/dashboard/request", icon: <FileText />, label: "Phiếu yêu cầu" },
    ...(isAdmin === "ADMIN" || isAdmin === "MANAGER"
      ? [
          {
            key: "/dashboard/allRequests",
            icon: <FileStack />,
            label: "DS yêu cầu",
          },
          {
            key: "/dashboard/employees",
            icon: <UsersRound />,
            label: "Quản lý nhân sự",
          },
          {
            key: "/dashboard/attendance",
            icon: <Fingerprint />,
            label: "Chấm công",
          },
        ]
      : []),
    ...(isAdmin === "ADMIN"
      ? [
          {
            key: "/dashboard/report",
            icon: <ClipboardPlus />,
            label: "Báo cáo",
          },
        ]
      : []),
  ];

  const handleClick: MenuProps["onClick"] = (e) => {
    if (pathname === e.key) {
      return;
    }
    setLoading(true);
    router.push(e.key);
  };
  const mutation = useMutation<
    { success: boolean; message?: string },
    Error,
    void
  >({
    mutationFn: logoutApi,
    onSuccess: () => {
      // alert("Bạn đã đăng xuất thành công!");
      router.push("/login");
      setLoading(false);
    },
    onError: (error) => {
      alert("Lỗi đăng xuất: " + (error?.message || ""));
      setLoading(false);
    },
  });
  const handleLogout = () => {
    setLoading(true);
    mutation.mutate();
  };

  const fetchUser = async () => {
    const controller = new AbortController();

    try {
      const res = await fetch("/api/me", { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();

        // ✅ Lưu user vào localStorage
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      } else {
        console.error("Không lấy được dữ liệu user");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Lỗi khi gọi API /api/me:", error);
    } finally {
    }

    return () => controller.abort();
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Đổi mật khẩu",
      icon: <LockOutlined />,
      onClick: () => setModalChangePass(true),
    },
    {
      key: "2",
      label: "Đăng Xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  useEffect(() => {
    setLoading(true);
  }, []);

  useEffect(() => {
    setLoading(false);
    fetchUser();
  }, [pathname]); // pathname thay đổi thì tắt loading

  return (
    <>
      <ModalLoading isOpen={loading} />
      <ModalChangePass
        handleChangPass={handleChangPass}
        onClose={() => setModalChangePass(false)}
        open={modalChangePass}
      />
      {contextHolder}
      <title>TOYOTA</title>
      <div className="w-full h-[100vh] overflow-hidden">
        <div className="h-15 flex items-center justify-between px-3 border-b border-[#999999] bg-[#aa0404]">
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              onClick={toggleCollapsed}
              className="!bg-transparent border !border-white mr-2"
            >
              {collapsed ? (
                <MenuUnfoldOutlined className="text-2xl " />
              ) : (
                <MenuFoldOutlined className="text-2xl" />
              )}
            </Button>
            <Image
              src="/storage/logo-toyota.png"
              alt="logo"
              className="w-14 invert-100"
              width={56}
              height={50}
            />
            <p className="text-2xl font-bold text-white">TOYOTA BÌNH DƯƠNG</p>
          </div>

          <Dropdown menu={{ items }}>
            <div
              className="flex items-center gap-3"
              onClick={(e) => e.preventDefault()}
            >
              <p className="text-base font-semibold text-white">
                Hi!, {user?.name}
              </p>

              <Image
                src={user?.avatar ? user?.avatar : "/storage/avt-default.png"}
                alt="avatar"
                className="h-9 w-9 border-2 bg-white border-[#c4c4c4] rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/storage/avt-default.png";
                }}
                width={36}
                height={36}
              />
            </div>
          </Dropdown>
        </div>
        <div className="w-full h-[calc(100vh-60px)] flex">
          <div
            className={`${
              collapsed ? "w-[80px]" : "w-[250px]"
            } border-r flex-shrink-0 border-[#999999] h-full flex flex-col justify-between transition-all duration-300 ease-in-out`}
          >
            <div className="h-full bg-[#aa0404]">
              <Menu
                selectedKeys={[pathname ?? ""]}
                mode="inline"
                inlineCollapsed={collapsed}
                items={Menus}
                className="bg-transparent"
                onClick={handleClick}
              />
            </div>
            <div
              className={`h-10 flex gap-2 items-center p-4 border-t border-[#999999] cursor-pointer  ${
                collapsed ? "justify-center" : "justify-between"
              } bg-[#aa0404] transition-all duration-300 ease-in-out`}
              onClick={handleLogout}
            >
              <p
                className={`${
                  collapsed ? "hidden" : ""
                } font-semibold text-white transition-all duration-300 ease-in-out`}
              >
                Đăng xuất
              </p>
              <LogOut className="text-white" />
            </div>
          </div>
          <div className="w-full h-full overflow-y-auto">
            <main className="flex-1 p-4">{children}</main>
          </div>
        </div>
      </div>
    </>
  );
}
