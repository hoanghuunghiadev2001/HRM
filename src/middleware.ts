/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

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

  // 👉 1. Bỏ qua hoàn toàn các request gọi vào thư mục /api
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/storage") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/robots")
  ) {
    return NextResponse.next();
  }

  // Bắt lấy domain thực tế từ Nginx (Tránh bị nhảy về localhost:3000)
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "hrm.toyotabinhduong.com.vn";
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;

  if (process.env.MAINTENANCE_MODE === "true") {
    return NextResponse.rewrite(new URL("/maintenance", baseUrl));
  }

  // Kiểm tra token cho các trang giao diện (UI routes)
  const token = req.cookies.get("token-hrm")?.value;

  const clearTokenAndLogin = () => {
    // Ép redirect về đúng URL Domain HTTPS thực tế thay vì req.url (localhost)
    const loginUrl = new URL("/login", baseUrl);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("token-hrm", "", { maxAge: 0, path: "/" });
    return response;
  };

  if (!token) {
    return clearTokenAndLogin();
  }

  const payload = decodeJwt(token);
  const user = payload?.user || payload;
  const userBrand = user?.brand;

  if (!userBrand) {
    console.log(
      "❌ Token thiếu thông tin Brand. Tiến hành xóa cookie và logout.",
    );
    return clearTokenAndLogin();
  }

  return NextResponse.next();
}

// ✅ Matcher loại trừ tuyệt đối /api ra khỏi tầm quét của middleware
export const config = {
  matcher: [
    "/((?!api|_next|login|favicon|icons|storage|manifest|robots|images).*)",
  ],
};
