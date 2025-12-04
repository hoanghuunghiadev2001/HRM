import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Bỏ qua middleware cho file tĩnh hoặc public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/app/lib") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/storage") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/manifest") || // 👈 THÊM DÒNG NÀY
    pathname.startsWith("/robots") // 👈 và thêm robots.txt nếu có
  ) {
    return NextResponse.next();
  }

  // Kiểm tra token
  const token = req.cookies.get("token")?.value;
  if (!token) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    return response;
  }

  return NextResponse.next();
}

// ✅ Matcher — thêm loại trừ manifest luôn cho chắc
export const config = {
  matcher: [
    "/((?!_next|api|api/auth|login|favicon|icons|storage|manifest|robots).*)",
  ],
};
