import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 응답 데이터 타입 정의
interface UserData {
  id: number;
  email: string;
  name: string;
  grade: string;
}

interface ApiResponse {
  data: UserData;
  error?: string;
  status?: number;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log("[Middleware] 현재 경로:", path);

  // 공개 경로는 체크하지 않음
  if (path === "/auth/login" || path === "/auth/signup") {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken");
  console.log("[Middleware] 토큰 존재 여부:", !!token);

  // 토큰이 없으면, 로그인 페이지로 리다이렉트
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 관리자 영역 접근 시도 시 권한 체크
  if (path.startsWith("/admin")) {
    try {
      console.log("[Middleware] 관리자 영역 접근 시도");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/data`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.log("[Middleware] API 응답 오류:", response.status);
        const redirectResponse = NextResponse.redirect(
          new URL("/auth/login", request.url)
        );
        redirectResponse.cookies.delete("accessToken");
        redirectResponse.cookies.delete("refreshToken");
        return redirectResponse;
      }

      const userData = (await response.json()) as ApiResponse;
      console.log("[Middleware] 사용자 데이터:", userData);

      if (!userData.data || userData.data.grade !== "ADMIN") {
        console.log("[Middleware] 관리자 권한 없음");
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      console.log("[Middleware] API 요청 실패:", error);
      const redirectResponse = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirectResponse.cookies.delete("accessToken");
      redirectResponse.cookies.delete("refreshToken");
      return redirectResponse;
    }
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
