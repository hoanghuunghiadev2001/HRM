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
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import type { MenuProps } from "antd";
import { redirect, usePathname, useRouter } from "next/navigation";
import ModalLoading from "@/components/modalLoading";
import {
  fetchUser,
  getUserFromLocalStorage,
  ProfileInfo,
} from "@/components/api";

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
  const localUser = getUserFromLocalStorage();
  const [isMounted, setIsMounted] = useState(false);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const items: MenuItem[] = [
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
    redirect(e.key);
  };

  const handleLogout = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/logout");
    if (res.ok) {
      await localStorage.removeItem("user");
      redirect("/login");
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        await fetchUser(); // nếu cần thì setUser() từ đây
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      router.replace("/login"); // Chuyển sang trang login
    }
  }, [router]);

  useEffect(() => {
    setLoading(false);
  }, [pathname]); // pathname thay đổi thì tắt loading

  useEffect(() => {
    console.log(localUser);

    setIsMounted(true);
  }, []);

  return (
    <>
      <ModalLoading isOpen={loading} />
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
            <img
              src="/storage/logo-toyota.png"
              alt="logo"
              className="w-14 invert-100"
            />
            <p className="text-2xl font-bold text-white">TOYOTA BÌNH DƯƠNG</p>
          </div>
          <div className="flex items-center gap-3">
            {isMounted && (
              <p className="text-base font-semibold text-white">
                Hi!, {localUser?.name}
              </p>
            )}
            {isMounted && (
              <img
                src={localUser?.avatar}
                alt="avatar"
                className="h-9 w-9 border-2 border-[#c4c4c4] rounded-full object-cover"
              />
            )}
          </div>
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
                items={items}
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
