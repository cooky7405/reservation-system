import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("[User Data API] ====== 사용자 정보 요청 시작 ======");
    console.log("[User Data API] 요청 URL:", request.url);
    console.log("[User Data API] 요청 메서드:", request.method);
    console.log(
      "[User Data API] 요청 헤더:",
      Object.fromEntries(request.headers.entries())
    );

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      console.log("[User Data API] 인증 토큰 없음");
      return NextResponse.json(
        { message: "인증 토큰이 필요합니다." },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    console.log("[User Data API] 외부 API 요청 시작");
    const externalApiUrl = "https://reserve.susanghwan.vip/user/data";
    console.log("[User Data API] 외부 API URL:", externalApiUrl);

    const response = await fetch(externalApiUrl, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    console.log("[User Data API] 외부 API 응답 상태:", response.status);
    console.log(
      "[User Data API] 외부 API 응답 헤더:",
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();
    console.log(
      "[User Data API] 외부 API 응답 데이터:",
      JSON.stringify(data, null, 2)
    );

    if (!response.ok) {
      console.error("[User Data API] 외부 API 오류 발생:", {
        status: response.status,
        statusText: response.statusText,
        data: data,
      });
      return NextResponse.json(
        {
          message:
            data.msg || data.message || "사용자 정보 조회에 실패했습니다.",
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

    console.log("[User Data API] ====== 사용자 정보 요청 완료 ======");
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("[User Data API] ====== 오류 발생 ======");
    console.error(
      "[User Data API] 오류 타입:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "[User Data API] 오류 메시지:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "[User Data API] 오류 스택:",
      error instanceof Error ? error.stack : "스택 없음"
    );
    console.error("[User Data API] ======================");

    return NextResponse.json(
      {
        message: "사용자 정보 조회 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      {
        status: 500,
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
  console.log("[User Data API] ====== OPTIONS 요청 처리 ======");
  console.log("[User Data API] CORS 설정 적용");
  console.log("[User Data API] ==============================");

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
