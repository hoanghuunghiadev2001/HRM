"use client";
import React, { useState } from "react";
import {
  InfoCircleOutlined,
  LockOutlined,
  PoweroffOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, CheckboxProps, Input, Tooltip } from "antd";
import ModalLoading from "@/components/modalLoading";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginClient() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!employeeCode || !password) {
      setErr("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setShowLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeCode, password, remember }),
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      router.push("/dashboard"); // thay vì redirect từ server
    } else {
      setErr(data.message || "Đăng nhập thất bại");
    }

    setShowLoading(false);
  };

  const onChange: CheckboxProps["onChange"] = (e) => {
    setRemember(e.target.checked);
  };

  return (
    <>
      <ModalLoading isOpen={showLoading} />

      <title>TOYOTA</title>
      <meta name="description" content="Ứng dụng quản lý nhân sự" />
      <ModalLoading isOpen={showLoading} />
      <div className="flex justify-center items-center w-[100vw] h-[100vh] relative ">
        <div className="bg-img-login blur-md w-full h-full absolute top-0 right-0"></div>
        <div className="w-full h-full bg-gradient-to-b from-red-600  to-white opacity-25 absolute top-0 right-0"></div>
        {/* <img
          src="storage/bg.jpg"
          alt=""
          className="h-full w-full object-cover"
        /> */}
        <div className="w-[350px] rounded-2xl shadow-form-login bg-[#ffffff80] z-50 relative px-10 flex flex-col items-center pb-5">
          <div className="flex items-center pt-4 gap-3 font-bold">
            <Image
              src="/storage/logo-toyota.png"
              alt=""
              className="w-24 "
              width={96}
              height={90}
            />
            <div className="shrink-0">
              <p className="text-xl">TOYOTA</p>
              <p className="text-xl">BÌNH DƯƠNG</p>
            </div>
          </div>
          <p className="font-bold text-3xl mt-3">Đăng nhập</p>
          <div className="mt-3 w-full">
            <p>Mã nhân viên:</p>
            <Input
              status={err ? "error" : ""}
              placeholder="Nhập mã nhân viên"
              className="!bg-[#ffffff90] border text-lg  h-10"
              onChange={(e) => {
                setErr("");
                setEmployeeCode(e.target.value);
              }}
              prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              suffix={
                <Tooltip title="Extra information">
                  <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                </Tooltip>
              }
            />
          </div>
          <div className="mt-3 w-full">
            <p>Mật khẩu:</p>
            <Input.Password
              status={err ? "error" : ""}
              placeholder="Nhập mật khẩu"
              className="!bg-[#ffffff90] border text-lg  h-10"
              onChange={(e) => {
                setErr("");
                setPassword(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            />
          </div>

          <div className="w-full mt-2 ">
            <Checkbox onChange={onChange}>Lưu mật khẩu?</Checkbox>
          </div>

          <div className="h-6">
            <p className="text-center italic text-red-600 text-sm">{err}</p>
          </div>
          <Button
            type="primary"
            className="mt-1 !h-10 "
            icon={<PoweroffOutlined />}
            onClick={handleSubmit}
          >
            Đăng nhập
          </Button>
        </div>
      </div>
    </>
  );
}
