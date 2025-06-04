"use client";

import React, { useEffect, useState } from "react";
import {
  ClipboardPlus,
  FileStack,
  FileText,
  Fingerprint,
  LogOut,
  Network,
  UserCog,
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
import { useDispatch, useSelector } from "react-redux";
import { setIsMobile } from "@/store/slices/responsiveSlice";
import { RootState } from "@/store";

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
  const [collapsed, setCollapsed] = useState(false); // Trạng thái thu gọn menu
  const [loading, setLoading] = useState(false);
  const [modalChangePass, setModalChangePass] = useState(false);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const isMobile = useSelector((state: RootState) => state.responsive.isMobile);

  // Hàm toggle menu thu gọn
  const toggleCollapsed = () => setCollapsed(!collapsed);

  // Hiện modal đổi mật khẩu thành công
  const countDown = () => {
    let secondsToGo = 3;
    const instance = modal.success({ title: "Đổi mật khẩu thành công" });
    const timer = setInterval(() => {
      secondsToGo -= 1;
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  const handleChangPass = async (change: interfaceChangePassword) => {
    setLoading(true);
    const res = await postchangePassword(change);
    if (res.status === 1) {
      countDown();
      setModalChangePass(false);
      setLoading(false);
    } else {
      form.setFields([
        { name: "currentPassword", errors: ["Mật khẩu hiện tại không đúng"] },
      ]);
      setLoading(false);
    }
  };

  // Khai báo menu
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
            label: "Nhân sự",
          },
          {
            key: "/dashboard/attendance",
            icon: <Fingerprint />,
            label: "Chấm công",
          },
          {
            key: "/dashboard/department",
            icon: <Network />,
            label: "Phòng ban",
          },
          {
            key: "/dashboard/report",
            icon: <ClipboardPlus />,
            label: "Báo cáo",
          },
        ]
      : []),
    ...(isAdmin === "ADMIN"
      ? [
          {
            key: "/dashboard/users",
            icon: <UserCog />,
            label: "Người dùng",
          },
        ]
      : []),
  ];

  // Xử lý click menu: Chuyển trang + tự đóng nếu mobile
  const handleClick: MenuProps["onClick"] = (e) => {
    if (pathname === e.key) return;
    setLoading(true);
    router.push(e.key);
    // Nếu là mobile, tự đóng menu sau khi click
    if (isMobile) {
      setCollapsed(false);
    }
  };

  // API logout
  const mutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
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

  // Fetch user info
  const fetchUser = async () => {
    const controller = new AbortController();
    try {
      const res = await fetch("/api/me", { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      } else {
        console.error("Không lấy được dữ liệu user");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Lỗi khi gọi API /api/me:", error);
      window.location.href = "/login";
    }
    return () => controller.abort();
  };

  // Xử lý resize màn hình để nhận biết mobile
  const dispatch = useDispatch();

  useEffect(() => {
    const checkMobile = () => {
      dispatch(setIsMobile(window.innerWidth < 640));
      if (window.innerWidth < 640) setCollapsed(false);
    };

    checkMobile(); // Kiểm tra lần đầu

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [dispatch]);

  useEffect(() => {
    setLoading(false);
    fetchUser();
  }, [pathname]);

  // Menu user (đổi mật khẩu / đăng xuất)
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
        {/* Header */}
        <div className="h-15 flex items-center justify-between px-3 border-b border-[#999999] bg-[#aa0404]">
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              onClick={toggleCollapsed}
              className="!bg-transparent border !border-white mr-2"
            >
              {collapsed ? (
                <MenuUnfoldOutlined className="text-2xl" />
              ) : (
                <MenuFoldOutlined className="text-2xl" />
              )}
            </Button>
            <Image
              loading="lazy"
              src="/storage/logo-toyota.webp"
              alt="logo"
              className="w-14 invert-100"
              width={56}
              height={50}
              quality={70} // giảm chất lượng xuống chút để nhẹ hơn
              priority={false}
            />
            <p className="text-2xl font-bold text-white hidden sm:block">
              TOYOTA BÌNH DƯƠNG
            </p>
          </div>

          <Dropdown menu={{ items }}>
            <div
              className="flex items-center gap-3"
              onClick={(e) => e.preventDefault()}
            >
              <p className="text-base font-semibold text-white hidden sm:block">
                Hi!, {user?.name}
              </p>
              <Image
                loading="lazy"
                src={user?.avatar || "/storage/avt-default.webp"}
                alt="avatar"
                className="h-9 w-9 border-2 bg-white border-[#c4c4c4] rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/storage/avt-default.webp";
                }}
                width={36}
                height={36}
                quality={70} // giảm chất lượng xuống chút để nhẹ hơn
                priority={false}
              />
            </div>
          </Dropdown>
        </div>

        {/* Overlay mờ khi mở menu ở mobile */}
        {/* {isMobile && !collapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setCollapsed(true)}
          />
        )} */}

        {/* Layout chính */}
        <div className="w-full h-[calc(100vh-60px)] flex relative">
          {/* Sidebar menu */}
          <div
            className={`
              ${!isMobile && collapsed ? "sm:w-[80px]" : "sm:w-[250px]"}
              ${isMobile && !collapsed ? "hidden " : ""}
              w-full  shrink-0 border-r bg-[#aa0404] border-[#999999] h-full flex flex-col justify-between
              transition-all duration-300 ease-in-out
            `}
          >
            <div className="bg-[#aa0404] overflow-y-auto overflow-x-hidden">
              <Menu
                selectedKeys={[pathname ?? ""]}
                mode="inline"
                inlineCollapsed={isMobile ? !collapsed : collapsed}
                items={Menus}
                className="bg-transparent text-white"
                onClick={handleClick}
              />
            </div>

            <div
              className={`h-10 flex gap-2 items-center p-4 border-t border-[#999999] cursor-pointer ${
                collapsed && !isMobile ? "justify-center" : "justify-between"
              } bg-[#aa0404] transition-all duration-300 ease-in-out`}
              onClick={handleLogout}
            >
              <p
                className={`${
                  collapsed && !isMobile ? "hidden" : ""
                } font-semibold text-white`}
              >
                Đăng xuất
              </p>
              <LogOut className="text-white" />
            </div>
          </div>

          {/* Nội dung chính */}
          <div className="w-full h-full overflow-y-auto">
            <main className="flex-1 p-4">{children}</main>
          </div>
        </div>
      </div>
    </>
  );
}
