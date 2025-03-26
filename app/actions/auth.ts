"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  fetchApi,
  LoginResponse,
  UserDataResponse,
  RefreshResponse,
  SignupResponse,
  VerifyEmailResponse,
  ResendVerificationResponse,
} from "@/utils/api";
// import { fetchApi } from "@/utils/api";

/**
 * API 문서: https://reserve.susanghwan.vip/doc
 * 모든 API 요청과 응답은 위 문서를 참조합니다.
 */

/**
 * POST /auth/login
 * @see https://reserve.susanghwan.vip/doc#/auth/login
 *
 * @param email - 사용자 이메일
 * @param password - 사용자 비밀번호
 * @returns {Promise<{success: boolean}>} 로그인 성공 여부
 *
 * @example
 * Request:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * Response:
 * {
 *   "access_token": "eyJhbG...",
 *   "refresh_token": "eyJhbG..."
 * }
 *
 * @log
 * - Request: { email, password }
 * - Response: { status, data: { access_token, refresh_token } }
 */
export async function login(email: string, password: string) {
  console.log("[Server Action] 로그인 시도:", { email, password });

  try {
    const response = await fetchApi<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    console.log("[Server Action] 로그인 API 응답 전체:", response);

    if (response.error) {
      console.error("[Server Action] 로그인 API 에러:", response.error);
      throw new Error(response.error);
    }

    // response.data가 없거나 response 자체가 토큰을 포함하는 경우
    const tokens = response.data || response;
    if (!tokens.access_token || !tokens.refresh_token) {
      console.error(
        "[Server Action] 로그인 API 응답 데이터 형식 오류:",
        tokens
      );
      throw new Error("로그인 응답 데이터가 올바르지 않습니다.");
    }

    // 토큰 저장
    cookies().set("accessToken", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    cookies().set("refreshToken", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    // 사용자 정보 가져오기
    const userData = await getUserData();
    console.log("[Server Action] 사용자 권한:", userData.grade);

    // 사용자 권한에 따라 리다이렉션
    if (userData.grade === "ADMIN") {
      console.log("[Server Action] 관리자 권한 확인, 관리자 대시보드로 이동");
      redirect("/admin/dashboard");
    } else {
      console.log(
        "[Server Action] 일반 사용자 권한 확인, 일반 대시보드로 이동"
      );
      redirect("/dashboard");
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "로그인에 실패했습니다.",
    };
  }
}

/**
 * POST /auth/logout
 * @see https://reserve.susanghwan.vip/doc#/auth/logout
 *
 * @description 로그아웃 후 로그인 페이지로 리다이렉트
 *
 * @log
 * - Action: "쿠키에서 accessToken 삭제"
 * - Result: "로그인 페이지로 리다이렉트"
 */
export async function logout() {
  console.log("[Server Action] 로그아웃 시도");

  try {
    cookies().delete("accessToken");
    redirect("/auth/login");
  } catch (error) {
    // redirect()는 에러를 throw하지만, 이는 정상적인 동작입니다.
    // 클라이언트에서 이 에러를 캐치하여 리다이렉션을 수행합니다.
    throw error;
  }
}

/**
 * POST /auth/refresh
 * @see https://reserve.susanghwan.vip/doc#/auth/refresh
 *
 * @returns {Promise<string | null>} 새로운 access token 또는 null
 *
 * @example
 * Request:
 * {
 *   "refresh_token": "eyJhbG..."
 * }
 *
 * Response:
 * {
 *   "access_token": "eyJhbG..."
 * }
 *
 * @log
 * - Request: { headers: { Authorization: "Bearer ..." } }
 * - Response: { status, data: { access_token } }
 * - Error: response.error when refresh fails
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const refreshToken = cookies().get("refreshToken")?.value;
    if (!refreshToken) {
      console.error("[Server Action] 리프레시 토큰이 없음");
      await logout();
      return null;
    }

    const response = await fetchApi<RefreshResponse>("/auth/refresh", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (response.error) {
      console.error("[Server Action] 토큰 갱신 실패:", response.error);
      await logout();
      return null;
    }

    if (!response.data?.access_token) {
      console.error("[Server Action] 새로운 액세스 토큰이 없음");
      await logout();
      return null;
    }

    const { access_token } = response.data;
    cookies().set("accessToken", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    return access_token;
  } catch (error) {
    console.error("[Server Action] 토큰 갱신 중 에러 발생:", error);
    await logout();
    return null;
  }
}

/**
 * GET /user/data
 * @see https://reserve.susanghwan.vip/doc#/user/data
 *
 * @description 현재 로그인한 사용자의 정보를 조회
 * @returns {Promise<UserDataResponse>} 사용자 정보
 *
 * @example
 * Response:
 * {
 *   "id": 1,
 *   "email": "user@example.com",
 *   "name": "홍길동",
 *   "phone": "010-1234-5678",
 *   "company": "회사명",
 *   "grade": "USER",
 *   "isEmailVerified": true,
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 *
 * @log
 * - Response: { status, data: UserDataResponse }
 */
export async function getUserData() {
  try {
    console.log("[Server Action] 사용자 정보 조회 시도");

    const response = await fetchApi<UserDataResponse>("/user/data");

    if (response.error) {
      console.error("[Server Action] 사용자 정보 조회 실패:", response.error);
      throw new Error(response.error);
    }

    // response.data가 없거나 response 자체가 사용자 정보를 포함하는 경우
    const userData = response.data || response;
    if (!userData.id || !userData.email || !userData.name) {
      console.error("[Server Action] 사용자 정보 형식 오류:", userData);
      throw new Error("사용자 정보가 올바르지 않습니다.");
    }

    console.log("[Server Action] 사용자 정보 조회 성공:", {
      status: response.status,
      data: userData,
    });

    return userData;
  } catch (error) {
    console.error("[Server Action] 사용자 정보 조회 실패:", error);
    throw error;
  }
}

/**
 * POST /auth/signup
 * @see https://reserve.susanghwan.vip/doc#/auth/signup
 *
 * @param email - 사용자 이메일
 * @param password - 사용자 비밀번호
 * @param name - 사용자 이름
 * @returns {Promise<SignupResponse>} 가입된 사용자 정보
 *
 * @example
 * Request:
 * {
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "name": "홍길동"
 * }
 *
 * Response:
 * {
 *   "id": 1,
 *   "email": "user@example.com",
 *   "name": "홍길동"
 * }
 *
 * @log
 * - Request: { email, name } (password excluded for security)
 * - Response: { status, data: SignupResponse }
 */
export async function signup(email: string, password: string, name: string) {
  console.log("[Server Action] 회원 가입 시도:", { email, name });

  try {
    const response = await fetchApi<SignupResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });

    console.log("[Server Action] API 응답:", {
      status: response.status,
      data: response.data,
    });

    if (response.error) {
      throw new Error(response.error || "회원 가입에 실패했습니다.");
    }

    console.log("[Server Action] 회원 가입 성공");
    return response.data;
  } catch (error) {
    console.error("[Server Action] 회원 가입 실패:", error);
    throw error;
  }
}

/**
 * POST /auth/verify-email
 * @see https://reserve.susanghwan.vip/doc#/auth/verify-email
 *
 * @param email - 인증할 이메일
 * @returns {Promise<VerifyEmailResponse>} 인증 결과 메시지
 *
 * @example
 * Request:
 * {
 *   "email": "user@example.com"
 * }
 *
 * Response:
 * {
 *   "message": "이메일이 인증되었습니다."
 * }
 *
 * @log
 * - Request: { email }
 * - Response: { status, data: { message } }
 * - Error: response.error when verification fails
 */
export async function verifyEmail(email: string) {
  console.log("[Server Action] 이메일 인증 시도:", { email });

  try {
    const response = await fetchApi<VerifyEmailResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    console.log("[Server Action] API 응답:", {
      status: response.status,
      data: response.data,
    });

    if (response.error) {
      throw new Error(response.error || "이메일 인증에 실패했습니다.");
    }

    console.log("[Server Action] 이메일 인증 성공");
    return response.data;
  } catch (error) {
    console.error("[Server Action] 이메일 인증 실패:", error);
    throw error;
  }
}

/**
 * POST /auth/resend-verification
 * @see https://reserve.susanghwan.vip/doc#/auth/resend-verification
 *
 * @param email - 인증 메일을 재발송할 이메일
 * @returns {Promise<{success: boolean, message: string}>} 재발송 결과
 *
 * @example
 * Request:
 * {
 *   "email": "user@example.com"
 * }
 *
 * Response:
 * {
 *   "message": "인증 메일이 재발송되었습니다."
 * }
 *
 * @log
 * - Request: { email }
 * - Response: { status, data: { message } }
 * - Success: { success: true, message: "인증 메일이 재발송되었습니다." }
 * - Error: { success: false, message: "인증 메일 재발송에 실패했습니다." }
 */
export async function resendVerificationEmail(email: string) {
  console.log("[Server Action] 인증 이메일 재발송 시도:", { email });

  try {
    const response = await fetchApi<ResendVerificationResponse>(
      "/auth/resend-verification",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );

    console.log("[Server Action] API 응답:", {
      status: response.status,
      data: response.data,
    });

    if (response.error) {
      throw new Error(response.error || "인증 이메일 재발송에 실패했습니다.");
    }

    console.log("[Server Action] 인증 이메일 재발송 성공");
    return { success: true, message: "인증 이메일이 재발송되었습니다." };
  } catch (error) {
    console.error("[Server Action] 인증 이메일 재발송 실패:", error);
    return { success: false, message: "인증 이메일 재발송에 실패했습니다." };
  }
}

export async function checkAdminAccess(): Promise<boolean> {
  try {
    const userData = await getUserData();
    return userData.grade === "ADMIN";
  } catch (error) {
    console.error("[Server Action] 관리자 권한 체크 실패:", error);
    return false;
  }
}
