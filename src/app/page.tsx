"use client";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import "../app/globals.css";

import {
  InfoCircleOutlined,
  LockOutlined,
  PoweroffOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, CheckboxProps, Input, Tooltip } from "antd";
import ModalLoading from "@/components/modalLoading";
import Image from "next/image";

// export

export default function Login() {
  const [employeeCode, setEmployeeCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");
  const [loadings, setLoadings] = useState<boolean[]>([]);

  // chức năng login
  const handleSubmit = async (e: React.FormEvent) => {
    if (employeeCode === "") {
      setErr("Vui lòng nhập mã nhân viên");
      return;
    }
    if (password === "") {
      setErr("Vui lòng mật khẩu");
      return;
    }
    setShowLoading(true);

    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[5] = true;
      return newLoadings;
    });
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeCode, password, remember }),
      credentials: "include", // ⚠️ bắt buộc để gửi/nhận cookie
    });

    const data = await res.json();

    if (res.ok) {
      // Lưu token
      localStorage.setItem("token", data.token);
      // Chuyển trang sau login thành công, ví dụ về trang dashboard
      redirect("/dashboard");
      setShowLoading(false);
    } else {
      setErr(data.message || "Đăng nhập thất bại");
      setShowLoading(false);
    }
  };

  const onChange: CheckboxProps["onChange"] = (e) => {
    setRemember(e.target.checked);
  };

  useEffect(() => {
    redirect("/dashboard");
  }, []);

  return (
    <>
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
              width={96}
              height={90}
              src="/storage/logo-toyota.png"
              alt=""
              className="w-24 "
            />
            <div className="flex-shrink-0">
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
            loading={loadings[3] && { icon: <SyncOutlined spin /> }}
            onClick={handleSubmit}
          >
            Đăng nhập
          </Button>
        </div>
      </div>
    </>
  );
}
