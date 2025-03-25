import { ErrorCodes } from "./error";
import { cookies } from "next/headers";
import { refreshToken, logout } from "@/app/actions/auth";

/**
 * API 문서: https://reserve.susanghwan.vip/doc
 * 모든 API 응답 형식과 타입은 위 문서를 참조합니다.
 */

// API 서버 엔드포인트
const API_BASE_URL = "https://reserve.susanghwan.vip/";

function getToken(): string | null {
  // 서버 사이드인 경우
  if (typeof window === "undefined") {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken");
    return token?.value || null;
  }
  // 클라이언트 사이드인 경우
  return localStorage.getItem("accessToken");
}

/**
 * POST /auth/login 응답 타입
 * @see https://reserve.susanghwan.vip/doc#/auth/login
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * POST /auth/refresh 응답 타입
 * @see https://reserve.susanghwan.vip/doc#/auth/refresh
 */
export interface RefreshResponse {
  access_token: string;
}

/**
 * POST /auth/signup 응답 타입
 * @see https://reserve.susanghwan.vip/doc#/auth/signup
 */
export interface SignupResponse {
  id: number;
  email: string;
  name: string;
}

/**
 * POST /auth/verify-email 응답 타입
 * @see https://reserve.susanghwan.vip/doc#/auth/verify-email
 */
export interface VerifyEmailResponse {
  message: string;
}

/**
 * POST /auth/resend-verification 응답 타입
 * @see https://reserve.susanghwan.vip/doc#/auth/resend-verification
 */
export interface ResendVerificationResponse {
  message: string;
}

/**
 * GET /user/data 응답 타입
 * @see https://reserve.susanghwan.vip/doc#/user/data
 */
export interface UserDataResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  grade: "ADMIN" | "USER";
}

/**
 * 공통 API 응답 형식
 * @see https://reserve.susanghwan.vip/doc#/common-response
 */
export interface ApiResponse<T> {
  status: number;
  data: T;
  error?: string;
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  // Request 로깅
  console.log("[API Request]", {
    endpoint,
    method: options.method || "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.parse(options.body as string) : undefined,
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Response 로깅
  console.log("[API Response]", {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
  });

  const rawData = await response.json();

  // API 응답 데이터를 공통 형식으로 변환
  const data: ApiResponse<T> = {
    status: response.status,
    data: rawData as T,
    error: !response.ok ? rawData.message : undefined,
  };

  if (!response.ok) {
    console.error("[API Error]", {
      status: response.status,
      statusText: response.statusText,
      data: rawData,
    });

    if (rawData.code === ErrorCodes.AUTH.TOKEN_EXPIRED) {
      try {
        const newToken = await refreshToken();
        if (newToken) {
          return fetchApi(endpoint, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        }
      } catch {
        await logout();
      }
    }
    throw new Error(rawData.message || "API 요청에 실패했습니다.");
  }

  return data;
}
