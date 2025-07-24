// app/dashboard/layout.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ClientDashboard from "./ClientDashboard";
import { redirect } from "next/navigation";
import { App as AntdApp, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export const experimental_ppr = true;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  let isAdmin = "";

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
      isAdmin = decoded.role;
    } catch {
      redirect("/login");
    }
  }

  return (
    <ConfigProvider
      locale={viVN}
      theme={{ cssVar: true }}
      warning={{ strict: false }}
    >
      <AntdApp>
        <ClientDashboard isAdmin={isAdmin}>{children}</ClientDashboard>
      </AntdApp>
    </ConfigProvider>
  );
}
