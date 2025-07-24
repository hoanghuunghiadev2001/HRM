import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bỏ qua middleware cho file tĩnh hoặc public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icons")||
    pathname.startsWith("/storage")||
    pathname.startsWith("/api") // nếu bạn dùng ảnh public
     // nếu bạn dùng ảnh public
     // nếu bạn dùng ảnh public
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    return response;
  }

  return NextResponse.next();
}

// Matcher để loại trừ login, api, file tĩnh
export const config = {
  matcher: ["/((?!_next|api/auth|login|favicon.ico|images).*)"],
};
