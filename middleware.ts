import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 인증이 필요한 경로 패턴
const protectedPaths = ["/dashboard"];
// 인증된 사용자가 접근할 수 없는 경로 패턴
const authPaths = ["/auth/login"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken");
  const { pathname } = request.nextUrl;

  // 인증이 필요한 경로에 접근하려고 할 때
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // 이미 인증된 사용자가 로그인/회원가입 페이지에 접근하려고 할 때
  if (authPaths.some((path) => pathname.startsWith(path))) {
    if (token) {
      // 토큰이 있으면 대시보드로 리다이렉트
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
