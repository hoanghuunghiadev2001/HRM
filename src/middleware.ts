/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

// ✅ 1. Bổ sung hàm giải mã JWT này vào đầu file (dưới các dòng import)
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 👉 Cho phép static files & maintenance page
  if (pathname.startsWith("/_next") || pathname.startsWith("/images")) {
    return NextResponse.next();
  }

  if (process.env.MAINTENANCE_MODE === "true") {
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }

  // ✅ Bỏ qua middleware cho file tĩnh hoặc public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/app/lib") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/storage") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/robots")
  ) {
    return NextResponse.next();
  }

  // Kiểm tra token
  const token = req.cookies.get("token-hrm")?.value;

  // Hàm xóa token và đẩy ra trang login
  const clearTokenAndLogin = () => {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("token-hrm", "", { maxAge: 0, path: "/" });
    return response;
  };

  if (!token) {
    return clearTokenAndLogin();
  }

  // ✅ 2. Gọi hàm decodeJwt đã được định nghĩa ở trên
  const payload = decodeJwt(token);
  const user = payload?.user || payload;

  // Kiểm tra thông tin brand trong token của user
  const userBrand = user?.brand;

  if (!userBrand) {
    console.log(
      "❌ Token thiếu thông tin Brand. Tiến hành xóa cookie và logout.",
    );
    return clearTokenAndLogin();
  }

  return NextResponse.next();
}

// ✅ Matcher
export const config = {
  matcher: [
    "/((?!_next|api|api/auth|login|favicon|icons|storage|manifest|robots).*)",
  ],
};
