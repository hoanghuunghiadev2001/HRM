// app/login/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import LoginClient from "@/components/loginClient";
// import LoginClient from "./LoginClient"; // tách phần UI client ở đây

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function LoginPage() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      redirect("/dashboard");
    } catch {}
  }

  return <LoginClient />;
}
