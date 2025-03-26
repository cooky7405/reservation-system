import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 인증이 필요한 경로 패턴
const protectedPaths = ["/dashboard", "/admin"];
// 인증된 사용자가 접근할 수 없는 경로 패턴
const authPaths = ["/auth/login"];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken");
  const { pathname } = request.nextUrl;

  console.log("[Middleware] 현재 경로:", pathname);
  console.log("[Middleware] 토큰 존재 여부:", !!token);

  // 인증이 필요한 경로에 접근하려고 할 때
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!token) {
      console.log("[Middleware] 인증 필요 - 로그인 페이지로 리다이렉트");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // 관리자 권한이 필요한 경로에 접근하려고 할 때
    if (pathname.startsWith("/admin")) {
      console.log("[Middleware] 관리자 영역 접근 시도");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/data`,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          }
        );

        if (!response.ok) {
          console.error("[Middleware] 관리자 권한 확인 실패: API 응답 오류");
          return NextResponse.redirect(new URL("/auth/login", request.url));
        }

        const userData = await response.json();
        console.log("[Middleware] 사용자 정보:", userData);
        console.log("[Middleware] 사용자 등급:", userData.grade);

        // 관리자가 아닌 경우 일반 대시보드로 리다이렉션
        if (userData.grade !== "ADMIN") {
          console.log(
            "[Middleware] 관리자 권한 없음 - 일반 대시보드로 리다이렉트"
          );
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        console.log("[Middleware] 관리자 권한 확인 완료 - 접근 허용");
      } catch (error) {
        console.error("[Middleware] 관리자 권한 확인 중 오류:", error);
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }
  }

  // 이미 인증된 사용자가 로그인/회원가입 페이지에 접근하려고 할 때
  if (authPaths.some((path) => pathname.startsWith(path))) {
    if (token) {
      console.log("[Middleware] 이미 인증된 사용자가 로그인 페이지 접근 시도");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/data`,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          }
        );
        if (!response.ok) {
          console.error("[Middleware] 사용자 정보 조회 실패: API 응답 오류");
          return NextResponse.redirect(new URL("/auth/login", request.url));
        }

        const userData = await response.json();
        console.log("[Middleware] 사용자 정보:", userData);
        console.log("[Middleware] 사용자 등급:", userData.grade);

        // 간단하게 리다이렉션 경로 설정 및 리다이렉션
        const redirectUrl =
          userData.grade === "ADMIN" ? "/admin/dashboard" : "/dashboard";
        console.log(
          `[Middleware] 사용자를 다음 경로로 리다이렉트: ${redirectUrl}`
        );

        // 리다이렉션
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      } catch (error) {
        console.error("[Middleware] 사용자 정보 처리 중 오류:", error);
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
