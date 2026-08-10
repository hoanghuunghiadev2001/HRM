/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import withBundleAnalyzer from "@next/bundle-analyzer";
import withPWA from "next-pwa";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  // Cố định thư mục gốc để tránh Next.js quét nhầm package-lock.json ở thư mục cha
  outputFileTracingRoot: path.join(__dirname),

  // --- PHẦN THÊM MỚI ĐỂ TRỊ CORS ---
  async headers() {
    return [
      {
        source: "/api/:path*", // Áp dụng cho mọi API trong folder app/api
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Cho phép máy ảo gọi vào
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
  // --------------------------------
  compress: false,
  experimental: {
    serverActions: {
      bodySizeLimit: 100 * 1024 * 1024,
    },
  },
  reactStrictMode: false,
  transpilePackages: [
    "antd",
    "@ant-design",
    "rc-util",
    "rc-pagination",
    "rc-picker",
    "rc-notification",
    "rc-tooltip",
    "rc-tree",
    "rc-table",
  ],
  images: {
    // Đã chuyển sang remotePatterns theo khuyến nghị mới của Next.js
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  webpack(config: { module: { rules: any[] } }) {
    const lessRule = config.module.rules.find(
      (rule: { test: { toString: () => string | string[] } }) =>
        rule.test && rule.test.toString().includes("less"),
    );
    if (lessRule) {
      lessRule.use.push({
        loader: "less-loader",
        options: {
          lessOptions: {
            javascriptEnabled: true,
            modifyVars: {
              "@body-background": "#ffffff",
              "@component-background": "#ffffff",
              "@layout-body-background": "#ffffff",
              "@layout-header-background": "#ffffff",
              "@text-color": "#000000",
              "@heading-color": "#000000",
              "@border-color-base": "#d9d9d9",
            },
          },
        },
      });
    }
    return config;
  },
};

export default withAnalyzer(
  withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  })(nextConfig as any),
);
