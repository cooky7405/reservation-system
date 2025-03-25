"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.grade !== "ADMIN") {
      router.push("/dashboard/user");
    }
  }, [user, router]);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          관리자 대시보드
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 사용자 관리 카드 */}
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              사용자 관리
            </h3>
            <p className="text-indigo-700">사용자 목록 조회 및 관리</p>
            <button className="mt-4 text-indigo-600 hover:text-indigo-800">
              관리하기 →
            </button>
          </div>

          {/* 시스템 설정 카드 */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              시스템 설정
            </h3>
            <p className="text-green-700">시스템 설정 및 구성 관리</p>
            <button className="mt-4 text-green-600 hover:text-green-800">
              설정하기 →
            </button>
          </div>

          {/* 통계 카드 */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">통계</h3>
            <p className="text-purple-700">사용 통계 및 분석</p>
            <button className="mt-4 text-purple-600 hover:text-purple-800">
              보기 →
            </button>
          </div>
        </div>
      </div>

      {/* 최근 활동 로그 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">최근 활동</h3>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-gray-600">새로운 사용자 가입</p>
            <p className="text-sm text-gray-500">2시간 전</p>
          </div>
          <div className="border-b pb-4">
            <p className="text-gray-600">예약 상태 변경</p>
            <p className="text-sm text-gray-500">3시간 전</p>
          </div>
          <div className="pb-4">
            <p className="text-gray-600">시스템 설정 업데이트</p>
            <p className="text-sm text-gray-500">5시간 전</p>
          </div>
        </div>
      </div>
    </div>
  );
}
