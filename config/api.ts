// API 기본 URL 설정
export const API_BASE_URL = "https://reserve.susanghwan.vip";

// API 엔드포인트
export const API_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  VERIFY: "/api/auth/verify",
  SIGNUP: "/api/auth/signup",
  REFRESH: "/api/auth/refresh",
  USER_DATA: "/api/user/data",
} as const;
