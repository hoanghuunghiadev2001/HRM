// app/.../lunch-menu/page.tsx  (không có "use client")
import { cookies } from "next/headers";
import { LunchMenuUserView } from "@/components/LunchMenuUserView"; // đường dẫn của bạn
import { verifyToken } from "@/lib/auth";

export default async function LunchMenuPage() {
  const token = (await cookies()).get("token-hrm")?.value;
  const user = token ? await verifyToken(token) : null;
  const brand = user?.brand === "TMP" ? "TMP" : "TBD";

  return <LunchMenuUserView defaultBrand={brand} />;
}
