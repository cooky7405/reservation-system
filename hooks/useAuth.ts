"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getUserData } from "@/app/actions/auth";
import { ApiError, ErrorCodes, getErrorMessage } from "@/utils/error";

interface User {
  id: number;
  email: string;
  name: string;
  grade: "ADMIN" | "USER";
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export function useAuth(skipInitialCheck = false) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const isMounted = useRef(true);
  const isChecking = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            grade: userData.grade,
          },
          error: null,
        });
        return { status: 200, data: userData };
      }
      return { status: 401, data: null };
    } catch (error) {
      console.error("[useAuth] 사용자 정보 조회 실패:", error);
      const errorMessage = getErrorMessage(error);

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: errorMessage,
      });

      // 토큰 만료나 인증 에러인 경우 로그인 페이지로 리다이렉트
      if (error instanceof ApiError) {
        if (
          error.code === ErrorCodes.AUTH.TOKEN_EXPIRED ||
          error.code === ErrorCodes.AUTH.UNAUTHORIZED
        ) {
          window.location.href = "/auth/login";
        }
      }

      return { status: 401, data: null };
    }
  }, []);

  useEffect(() => {
    if (skipInitialCheck) {
      if (isMounted.current) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
      return;
    }

    if (isChecking.current) {
      return;
    }

    const checkAuth = async () => {
      isChecking.current = true;

      try {
        const userData = await getUserData();
        if (userData) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              grade: userData.grade,
            },
            error: null,
          });
        }
      } catch (error) {
        console.error("[useAuth] 인증 확인 실패:", error);
        const errorMessage = getErrorMessage(error);

        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: errorMessage,
        });

        // 토큰 만료나 인증 에러인 경우 로그인 페이지로 리다이렉트
        if (error instanceof ApiError) {
          if (
            error.code === ErrorCodes.AUTH.TOKEN_EXPIRED ||
            error.code === ErrorCodes.AUTH.UNAUTHORIZED
          ) {
            window.location.href = "/auth/login";
          }
        }
      } finally {
        isChecking.current = false;
        if (isMounted.current) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    checkAuth();
  }, [skipInitialCheck]);

  return {
    ...authState,
    fetchUserData,
  };
}
