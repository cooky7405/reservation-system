import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const externalApiUrl = "https://reserve.susanghwan.vip/auth/login";

    // AbortController를 사용하여 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

    try {
      const response = await fetch(externalApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          {
            message: data.msg || data.message || "로그인에 실패했습니다.",
            error: data.error,
          },
          {
            status: response.status,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          }
        );
      }

      const responseData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      };

      // 쿠키 설정
      const cookieStore = cookies();
      cookieStore.set("accessToken", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7일
      });

      cookieStore.set("refreshToken", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30일
      });

      return NextResponse.json(responseData, {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    let statusCode = 500;
    let errorMessage = "로그인 처리 중 오류가 발생했습니다.";

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        statusCode = 504;
        errorMessage = "서버 응답 시간이 초과되었습니다.";
      } else if (error.message.includes("Failed to fetch")) {
        statusCode = 503;
        errorMessage = "서버에 연결할 수 없습니다.";
      }
    }

    return NextResponse.json(
      {
        message: errorMessage,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      {
        status: statusCode,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
