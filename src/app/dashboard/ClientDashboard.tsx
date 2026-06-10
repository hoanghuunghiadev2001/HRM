/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import {
  CarFront,
  ClipboardList,
  FileStack,
  FileText,
  Fingerprint,
  Network,
  UserCog,
  UserRoundPen,
  UsersRound,
  LayoutDashboard,
  Utensils,
  History,
  FileBadge,
  ShieldCheck,
  BellRing,
  PieChart,
  PackagePlus,
  Box,
  Wallet,
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
import Link from "next/link";

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

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalChangePass, setModalChangePass] = useState(false);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const isMobile = useSelector((state: RootState) => state.responsive.isMobile);
  const [avt, setAvt] = useState("/storage/avt-default.webp");
  const { name, employeeCode, avatar } = useAppSelector((state) => state.user);

  useEffect(() => {
    setAvt(avatar ? avatar : "/storage/logo-toyota.webp");
  }, [avatar]);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const handleChangPass = async (change: interfaceChangePassword) => {
    setLoading(true);
    const res = await postchangePassword(change);
    if (res.status === 1) {
      modal.success({ title: "Đổi mật khẩu thành công" });
      setModalChangePass(false);
      setLoading(false);
    } else {
      form.setFields([
        { name: "currentPassword", errors: ["Mật khẩu hiện tại không đúng"] },
      ]);
      setLoading(false);
    }
  };

  const Menus: MenuItem[] = [
    {
      key: "/dashboard",
      icon: <UserRoundPen size={20} />,
      label: <Link href="/dashboard">Hồ sơ</Link>,
    },

    {
      key: "/dashboard/request",
      icon: <FileText size={20} />,
      label: <Link href="/dashboard/request">Phiếu yêu cầu</Link>,
    },

    {
      key: "/dashboard/proposal1",
      icon: <FileStack size={20} />,
      label: "Đề xuất",
      children: [
        ...(isAdmin === "ADMIN"
          ? [
              {
                key: "/dashboard/vehicles",
                icon: <CarFront size={18} />,
                label: <Link href="/dashboard/vehicles">Quản lý xe</Link>,
              },
            ]
          : []),

        {
          key: "/dashboard/vehicles-reports",
          icon: <History size={18} />,
          label: <Link href="/dashboard/vehicles-reports">Lịch xe</Link>,
        },

        {
          key: "/dashboard/proposal",
          icon: <ClipboardList size={18} />,
          label: <Link href="/dashboard/proposal">Tạo đề xuất</Link>,
        },

        {
          key: "/dashboard/proposal/my-proposals",
          icon: <FileBadge size={18} />,
          label: (
            <Link href="/dashboard/proposal/my-proposals">Quản lý đề xuất</Link>
          ),
        },
      ],
    },
    {
      key: "/dashboard/salary",
      icon: <FileStack size={20} />,
      label: "Quản lý lương",
      children: [
        ...(employeeCode === "01375" ||
        employeeCode === "00939" ||
        employeeCode === "00019" ||
        employeeCode === "00016"
          ? [
              {
                key: "/dashboard/salary",
                icon: <ShieldCheck size={18} />, // Icon bảo mật/quản trị cho Admin
                label: (
                  <Link href="/dashboard/salary">Bảng lương hệ thống</Link>
                ),
              },
            ]
          : []),
        ...(employeeCode === "01375" || employeeCode === "00019"
          ? [
              {
                key: "/dashboard/salary/permissions",
                icon: <ShieldCheck size={18} />, // Icon bảo mật/quản trị cho Admin
                label: (
                  <Link href="/dashboard/salary/permissions">
                    Phân quyền xem lương
                  </Link>
                ),
              },
            ]
          : []),

        ...(isAdmin !== "USER"
          ? [
              {
                key: "/dashboard/salary/view",
                icon: <History size={20} />,
                label: (
                  <Link href="/dashboard/salary/view">QL lương bộ phận</Link>
                ),
              },
            ]
          : []),

        {
          key: "/dashboard/my-salary",
          icon: <Wallet size={18} />, // Icon ví tiền cá nhân
          label: <Link href="/dashboard/my-salary">Xem lương của tôi</Link>,
        },
      ],
    },
    ...(employeeCode === "01375" ||
    employeeCode === "CSKHTBD" ||
    employeeCode === "CSKHTMP"
      ? [
          {
            key: "/dashboard/report/GSM",
            icon: <ShieldCheck size={18} />, // Icon bảo mật/quản trị cho Admin
            label: <Link href="/dashboard/report/GSM">Báo cáo GSM</Link>,
          },
        ]
      : []),
    {
      key: "/dashboard/attendance",
      icon: <Fingerprint size={20} />,
      label: <Link href="/dashboard/attendance">Chấm công</Link>,
    },

    // {
    //   key: "/dashboard/LunchMenuModule",
    //   icon: <Utensils size={20} />,
    //   label: <Link href="/dashboard/LunchMenuModule">Thực đơn</Link>,
    // },

    {
      key: "/dashboard/allRequests",
      icon: <ShieldCheck size={20} />,
      label: <Link href="/dashboard/allRequests">DS yêu cầu</Link>,
    },

    ...(isAdmin !== "USER"
      ? [
          {
            key: "/dashboard/compensatory-leave",
            icon: <History size={20} />,
            label: <Link href="/dashboard/compensatory-leave">DS Nghỉ bù</Link>,
          },
        ]
      : []),

    ...(isAdmin === "ADMIN"
      ? [
          {
            key: "/dashboard/all-assets",
            icon: <LayoutDashboard size={20} />,
            label: "Quản trị",
            children: [
              {
                key: "/dashboard/assets",
                icon: <Box size={18} />,
                label: <Link href="/dashboard/assets">Tài sản</Link>,
              },
              {
                key: "/dashboard/assets/assign",
                icon: <PackagePlus size={18} />,
                label: <Link href="/dashboard/assets/assign">Cấp tài sản</Link>,
              },
              {
                key: "/dashboard/employees",
                icon: <UsersRound size={18} />,
                label: <Link href="/dashboard/employees">Nhân sự</Link>,
              },
              {
                key: "/dashboard/department",
                icon: <Network size={18} />,
                label: <Link href="/dashboard/department">Phòng ban</Link>,
              },
              {
                key: "/dashboard/maintenance",
                icon: <BellRing size={18} />,
                label: (
                  <Link href="/dashboard/maintenance">Thông Báo hệ thống</Link>
                ),
              },
              // {
              //   key: "/dashboard/LunchMenuModuleAD",
              //   icon: <Utensils size={18} />,
              //   label: (
              //     <Link href="/dashboard/LunchMenuModuleAD">QL Thực đơn</Link>
              //   ),
              // },
            ],
          },

          {
            key: "/dashboard/report",
            icon: <PieChart size={20} />,
            label: <Link href="/dashboard/report">Báo cáo</Link>,
          },

          {
            key: "/dashboard/users",
            icon: <UserCog size={20} />,
            label: <Link href="/dashboard/users">Người dùng</Link>,
          },
        ]
      : []),
  ];

  const handleClick: MenuProps["onClick"] = (e) => {
    if (pathname === e.key) return;
    setLoading(true);
    router.push(e.key);
    if (isMobile) setCollapsed(false);
  };

  const mutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      router.push("/login");
      setLoading(false);
    },
    onError: () => setLoading(false),
  });

  const handleLogout = () => {
    setLoading(true);
    mutation.mutate();
  };

  const dispatch = useDispatch();
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      dispatch(setIsMobile(mobile));
      if (mobile) setCollapsed(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [dispatch]);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

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

      <div className="w-[100vw] h-full overflow-hidden bg-[#f0f2f5]">
        {/* Header Mobile */}
        <div
          className={`${
            isMobile ? "" : "hidden"
          } h-14 w-full bg-[#ffffff] flex items-center justify-between px-4 border-b border-[#cecece] z-50`}
        >
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
            <p className="text-xl font-semibold text-[#001231] italic">
              {name}
            </p>
            <Image
              src="/storage/logo-toyota.webp"
              alt="logo"
              width={56}
              height={50}
              className="w-14 h-auto"
            />
          </div>
        </div>

        {/* Layout chính */}
        <div
          className={`w-full flex relative ${
            isMobile ? "h-[calc(100vh-56px)]" : "h-[100vh]"
          }`}
        >
          {/* Sidebar */}
          <div className="py-5 pl-4 flex shrink-0 h-full">
            <div
              className={`
                ${isMobile ? "flex-col-reverse" : "flex-col"}
                ${!isMobile && collapsed ? "sm:!w-[75px]" : "sm:w-[260px]"}
                ${isMobile && !collapsed ? "hidden " : " "}
                ${
                  collapsed && isMobile
                    ? "!w-full fixed !h-[calc(100vh-56px)] top-14 !rounded-none right-0 z-10"
                    : ""
                }
                transition-all duration-300 ease-in-out shadow-2xl rounded-[32px] py-6 px-4 border bg-[#9ecff7] border-[#cecece] flex
              `}
            >
              <div className="relative w-full flex-1 flex flex-col n">
                {/* Desktop Toggle Button */}
                {!isMobile && (
                  <Button
                    type="primary"
                    onClick={toggleCollapsed}
                    className="!border-none !shadow-none !absolute top-0 right-[-25px] !p-0 !bg-transparent hover:!bg-transparent !text-[#ff511a] z-50"
                  >
                    {collapsed ? (
                      <RightCircleFilled className="text-2xl" />
                    ) : (
                      <LeftCircleFilled className="text-2xl" />
                    )}
                  </Button>
                )}

                {/* Logo Section */}
                <div
                  className={`${
                    isMobile ? "hidden" : "flex"
                  } flex-col items-center justify-center w-full mb-6`}
                >
                  <Image
                    src="/storage/logo-toyota.webp"
                    alt="logo"
                    width={56}
                    height={50}
                    className="w-14 h-auto"
                  />
                  {!collapsed && (
                    <p className="font-bold text-[#001231] mt-2 text-center text-sm">
                      TOYOTA BÌNH DƯƠNG
                    </p>
                  )}
                </div>

                {/* Menu Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-sidebar">
                  <Menu
                    selectedKeys={pathname ? [pathname] : []}
                    mode="inline"
                    inlineCollapsed={isMobile ? false : collapsed}
                    items={Menus}
                    className="bg-transparent !border-none h-[calc(100vh-280px)] overflow-y-scroll"
                    onClick={handleClick}
                  />
                </div>
              </div>

              {/* User Profile Section */}
              <div
                className={`mt-4 h-14 flex items-center bg-white/40 rounded-2xl cursor-pointer p-2 transition-all ${
                  collapsed && !isMobile
                    ? "justify-center"
                    : "justify-between px-4"
                }`}
              >
                <Dropdown menu={{ items }}>
                  <div className="flex items-center gap-3 w-full">
                    <img
                      src={avt}
                      alt="avatar"
                      className="h-9 w-9 border-2 border-white rounded-full object-cover shrink-0 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/storage/avt-default.webp";
                      }}
                    />
                    {(!collapsed || isMobile) && (
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-[#001231] truncate leading-none">
                          {name}
                        </p>
                        <p className="text-[10px] text-[#001231]/60 truncate mt-1">
                          {employeeCode}
                        </p>
                      </div>
                    )}
                    {(!collapsed || isMobile) && (
                      <EllipsisOutlined className="text-xl" />
                    )}
                  </div>
                </Dropdown>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
            <main className="p-4 min-h-full">{children}</main>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-sidebar::-webkit-scrollbar {
          width: 0px;
        }
        .ant-menu-inline,
        .ant-menu-vertical,
        .ant-menu-vertical-left {
          border-right: none !important;
        }
        .ant-menu-item-selected {
          background-color: rgba(255, 255, 255, 0.3) !important;
          color: #ff511a !important;
        }
      `}</style>
    </>
  );
}
