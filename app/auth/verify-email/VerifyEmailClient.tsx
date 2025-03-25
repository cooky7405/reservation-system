"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail, resendVerificationEmail } from "@/app/actions/auth";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState("");

  const handleVerification = useCallback(
    async (token: string) => {
      setVerificationStatus("loading");
      try {
        const result = await verifyEmail(token);
        setMessage(result.message);
        setVerificationStatus("success");
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } catch {
        setMessage("이메일 인증에 실패했습니다.");
        setVerificationStatus("error");
      }
    },
    [router]
  );

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      handleVerification(token);
    }
  }, [searchParams, handleVerification]);

  const handleResendEmail = async () => {
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }

    try {
      const result = await resendVerificationEmail(email);
      setMessage(result.message);
      setVerificationStatus("success");
    } catch {
      setMessage("인증 이메일 재전송에 실패했습니다.");
      setVerificationStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            이메일 인증
          </h2>
        </div>

        {verificationStatus === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">인증 처리 중...</p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {message}
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {message}
          </div>
        )}

        {verificationStatus === "idle" && (
          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                onClick={handleResendEmail}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                인증 이메일 재전송
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
