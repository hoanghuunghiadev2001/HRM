/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Button } from "antd";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 relative to-gray-950 text-white text-center px-4">
      <div className="absolute z-10">
        <img
          src={"/images/404_page-not-found.png"}
          alt=""
          className="opacity-30"
        />
        <h1 className="text-3xl md:text-4xl font-semibold mt-[-20px] opacity-30">
          Trang không tồn tại
        </h1>
        <p className="text-gray-400 mt-2 mb-6">
          Xin lỗi, chúng tôi không tìm thấy nội dung bạn đang tìm.
        </p>

        <Button>
          <Link href="/">Quay về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
