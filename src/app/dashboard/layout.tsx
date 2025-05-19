// app/dashboard/layout.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ClientDashboard from "./ClientDashboard";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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
    } catch (err) {
      // Nếu token sai hoặc hết hạn, có thể xử lý redirect bằng middleware
      redirect("/login");
    }
  }

  return <ClientDashboard isAdmin={isAdmin}>{children}</ClientDashboard>;
}
