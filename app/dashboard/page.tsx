"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // 로그인하지 않은 경우 로그인 페이지로 리다이렉션
        router.push("/auth/login");
        return;
      }

      // 사용자 권한에 따라 적절한 대시보드로 리다이렉션
      if (user.grade === "ADMIN") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/user");
      }
    }
  }, [user, isLoading, router]);

  // 로딩 중이거나 리다이렉션 중일 때 표시할 내용
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">대시보드로 이동 중...</p>
      </div>
    </div>
  );
}
