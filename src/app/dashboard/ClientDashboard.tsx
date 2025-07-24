/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import {
  ClipboardPlus,
  FileStack,
  FileText,
  Fingerprint,
  Network,
  UserCog,
  UserRoundPen,
  UsersRound,
} from "lucide-react";
import {
  EllipsisOutlined,
  LeftCircleFilled,
  LockOutlined,
  LogoutOutlined,
  RightCircleFilled,

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
import { useAppSelector } from "@/store/hook";

// interface User {
//   name: string;
//   avatar?: string;
//   employeeCode: string;
// }



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

  // const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false); // Trạng thái thu gọn menu
  const [loading, setLoading] = useState(false);
  const [modalChangePass, setModalChangePass] = useState(false);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const isMobile = useSelector((state: RootState) => state.responsive.isMobile);
  const [avt, setAvt] = useState("/storage/avt-default.webp");
  const { name, avatar } = useAppSelector((state) => state.user);



  useEffect(() => {
    setAvt(avatar ? avatar : '/storage/logo-toyota.webp')
  }, [avatar])


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
    {
          key: "/dashboard/proposal",
          icon: <FileStack />,
          label: "Đề xuất",
          children: [
            {
              key: "/dashboard/proposal",
                   icon: <FileStack  className="ml-4"/>,
              label: "Tạo đề xuất",
            },
            {
              key: "/dashboard/proposal/my-proposals",
                   icon: <FileStack className="ml-4"/>,
              label: "Quản lý đề xuất",
              
            },
             
          ],
        },

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
          key: "/dashboard/report",
          icon: <ClipboardPlus />,
          label: "Báo cáo",
        },
      ]
      : []),
    ...(isAdmin === "ADMIN"
      ? [
        {
          key: "/dashboard/department",
          icon: <Network />,
          label: "Phòng ban",
        },
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
  // const fetchUser = async () => {
  //   const controller = new AbortController();
  //   try {
  //     const res = await fetch("/api/me", { signal: controller.signal });
  //     if (res.ok) {
  //       const data = await res.json();
  //       localStorage.setItem("user", JSON.stringify(data));
  //       setUser(data);
  //     } else {
  //       console.error("Không lấy được dữ liệu user");
  //       window.location.href = "/login";
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi gọi API /api/me:", error);
  //     window.location.href = "/login";
  //   }
  //   return () => controller.abort();
  // };

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
    // fetchUser();
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

  console.log(isMobile);



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

      <div className="w-full h-[100vh] overflow-hidden ">
        {/* Header */}
        <div className={`${isMobile ? '' : 'hidden'} h-14 w-full bg-[#ffffff] flex items-center justify-between px-4 border-b border-[#cecece] z-50`}>
          <Button
            type="primary"
            onClick={toggleCollapsed}
            className="!border-none !shadow-none sm:hidden !p-0 !bg-transparent hover:!bg-transparent !text-[#ff511a] hover:!text-[#ff511a]"
          >
            {collapsed ? (
              <LeftCircleFilled className="text-2xl !text-[#ff511a]" />

            ) : (

              <RightCircleFilled className="text-2xl !text-[#ff511a]" />

            )}
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#070d10]">HRM</h1>
            <Image
              loading="lazy"
              src="/storage/logo-toyota.webp"
              alt="logo"
              className="w-14 "
              width={56}
              height={50}
              quality={70} // giảm chất lượng xuống chút để nhẹ hơn
              priority={false}
            />
          </div>
        </div>

        {/* Overlay mờ khi mở menu ở mobile */}
        {/* {isMobile && !collapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setCollapsed(true)}
          />
        )} */}

        {/* Layout chính */}
        <div className="w-full h-[100vh] flex relative">


          {/* Sidebar menu */}

          <div className="py-5">
            <div
              className={`
              ${!isMobile && collapsed ? "sm:!w-[70px]" : "sm:w-[250px]"}
              ${isMobile && !collapsed ? "hidden " : " "}
              ${collapsed && isMobile ? "!w-full fixed !h-[calc(100vh-56px)] top-14 !rounded-none right-0 z-10" : ""}
               shrink-0  h-full flex flex-col justify-between
              transition-all duration-300 ease-in-out shadow-2xl rounded-4xl py-6 px-4 border bg-[#e8f4fd] border-[#cecece]
            `}
            >
              <div className="relative w-full ">
                <Button
                  type="primary"
                  onClick={toggleCollapsed}
                  className={`!border-none !shadow-none !absolute top-[55px] right-[-28px] sm:hidden !p-0 !bg-transparent hover:!bg-transparent !text-[#ff511a] hover:!text-[#ff511a] z-50 ${isMobile ? "!hidden" : ""}`}
                >
                  {collapsed ? (
                    <RightCircleFilled className="text-2xl !text-[#ff511a]" />
                  ) : (
                    <LeftCircleFilled className="text-2xl !text-[#ff511a]" />
                  )}
                </Button>
                <div className="flex flex-col items-center justify-center w-full  py-2">
                  <Image
                    loading="lazy"
                    src="/storage/logo-toyota.webp"
                    alt="logo"
                    className="w-14 "
                    width={56}
                    height={50}
                    quality={70} // giảm chất lượng xuống chút để nhẹ hơn
                    priority={false}
                  />
                  <p className={`font-medium text-[#070d10] mt-2 text-nowrap transition-opacity ${collapsed ? 'hidden' : ''}`}>TOYOTA BÌNH DƯƠNG</p>
                </div>
                <div className="bg-transparent overflow-y-auto overflow-x-hidden">
                  <Menu
                    selectedKeys={[pathname ?? ""]}
                    mode="inline"
                    inlineCollapsed={isMobile ? !collapsed : collapsed}
                    items={Menus}
                    className="bg-transparent !text-[#4a4a6a]"
                    onClick={handleClick}
                  />
                </div>
              </div>

              <div
                className={`h-14 flex gap-2 items-center ${collapsed ? '' : 'p-4 border-[1px] border-[#bebebe]'}  rounded-2xl cursor-pointer ${collapsed && !isMobile ? "justify-center" : "justify-between"
                  } transition-all duration-300 ease-in-out`}
              >
                  <Dropdown menu={{ items }}>

                <div
                  className="flex items-center gap-3 justify-between w-full"
                >

                  <div className="flex items-center gap-3">
                    <img
                      src={avt}
                      alt="avatar"
                      className="h-9 w-9 border-2 border-[#999999] bg-white rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/storage/avt-default.webp";
                      }}
                    />

                    <p className={`text-base font-normal italic text-[#070d10]  ${collapsed && !isMobile ? 'hidden' : ''} `}>
                      {name}
                    </p>
                  </div>
                    <EllipsisOutlined className={`${collapsed && !isMobile ? '!hidden' : ''} text-3xl`} onClick={(e) => e.preventDefault()} />

                </div>
                  </Dropdown>

              </div>
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
