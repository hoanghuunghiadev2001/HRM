// next.config.ts
import withBundleAnalyzer from "@next/bundle-analyzer";
import withPWA from "next-pwa";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
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
    domains: ["res.cloudinary.com"],
  },
};

// KHÔNG ép kiểu gì hết, chỉ return plain object
export default withAnalyzer(
  withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  })(nextConfig)
);
