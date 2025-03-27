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

  // 쿠키에서 토큰 가져오기
  const token = request.cookies.get("accessToken");
  console.log("[Middleware] 토큰 존재 여부:", !!token);

  // 토큰이 없으면, 로그인 페이지로 리다이렉트
  if (!token || !token.value) {
    console.log("[Middleware] 토큰 없음, 로그인 페이지로 리다이렉트");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 관리자 영역 접근 시도 시 권한 체크
  if (path.startsWith("/admin")) {
    try {
      console.log("[Middleware] 관리자 영역 접근 시도");
      // API URL 구성
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl) {
        console.error("[Middleware] API URL이 설정되지 않음");
        throw new Error("API URL이 설정되지 않았습니다");
      }

      // 사용자 데이터 요청
      const response = await fetch(`${apiUrl}/user/data`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      // 응답 체크
      if (!response.ok) {
        console.log("[Middleware] API 응답 오류:", response.status);
        // 토큰 삭제 후 로그인 페이지로 리다이렉트
        const redirectResponse = NextResponse.redirect(
          new URL("/auth/login", request.url)
        );
        redirectResponse.cookies.delete("accessToken");
        redirectResponse.cookies.delete("refreshToken");
        return redirectResponse;
      }

      // 사용자 데이터 파싱
      const userData = (await response.json()) as ApiResponse;
      console.log("[Middleware] 사용자 데이터 등급:", userData.data?.grade);

      // 관리자 권한 체크
      if (!userData.data || userData.data.grade !== "ADMIN") {
        console.log(
          "[Middleware] 관리자 권한 없음, 일반 대시보드로 리다이렉트"
        );
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      console.log("[Middleware] 관리자 권한 확인 완료");
    } catch (error) {
      console.log("[Middleware] API 요청 실패:", error);
      // 토큰 삭제 후 로그인 페이지로 리다이렉트
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
