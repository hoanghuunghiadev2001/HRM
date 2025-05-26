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
  console.log(token);

  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("JWT Invalid:", err);
      return <LoginClient />; // Trả về LoginClient nếu token lỗi
    }

    // Nếu jwt.verify() thành công, gọi redirect() bên ngoài
    redirect("/dashboard");
  }

  return <LoginClient />;
}
