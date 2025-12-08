/* eslint-disable @typescript-eslint/no-explicit-any */
// next.config.ts
import withBundleAnalyzer from "@next/bundle-analyzer";
import withPWA from "next-pwa";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  // tăng giới hạn kích thước body cho Server Actions — dùng số bytes (ví dụ 10 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: 10 * 1024 * 1024, // 10 MB in bytes
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
    domains: ["res.cloudinary.com"],
  },
  webpack(config: { module: { rules: any[] } }) {
    // Ant Design Less variables
    const lessRule = config.module.rules.find(
      (rule: any) => rule.test && rule.test.toString().includes("less")
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

// Kết hợp PWA + Bundle Analyzer
export default withAnalyzer(
  withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  })(nextConfig)
);
