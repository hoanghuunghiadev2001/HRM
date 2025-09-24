import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Các route public không cần JWT
  const publicPaths = [
    "/login",
    "/manifest.json",
    "/favicon.ico",
    "/icons/",
    "/_next/"
  ];
  const isPublic = publicPaths.some(path => pathname.startsWith(path));

  const jwt = request.cookies.get("jwt")?.value;

  if (!isPublic && !jwt) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();

  // Thêm headers bảo mật
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
  );

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
