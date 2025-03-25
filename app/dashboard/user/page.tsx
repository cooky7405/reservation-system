"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 상단 예약하기 버튼 */}
      <div className="flex justify-end">
        <Link
          href="/reservation"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          예약하기
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">내 예약 현황</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 예약 현황 카드 */}
          <Link href="/reservation" className="block">
            <div className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                예약 현황
              </h3>
              <p className="text-blue-700">현재 예약 및 예약 이력</p>
              <button className="mt-4 text-blue-600 hover:text-blue-800">
                확인하기 →
              </button>
            </div>
          </Link>

          {/* 개인 설정 카드 */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              개인 설정
            </h3>
            <p className="text-yellow-700">프로필 및 알림 설정</p>
            <button className="mt-4 text-yellow-600 hover:text-yellow-800">
              설정하기 →
            </button>
          </div>

          {/* 알림 카드 */}
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-2">알림</h3>
            <p className="text-red-700">예약 관련 알림</p>
            <button className="mt-4 text-red-600 hover:text-red-800">
              확인하기 →
            </button>
          </div>
        </div>
      </div>

      {/* 최근 예약 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">최근 예약</h3>
          <Link
            href="/reservation"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            전체 보기 →
          </Link>
        </div>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-gray-600">회의실 A 예약</p>
            <p className="text-sm text-gray-500">2024-03-20 14:00 - 15:00</p>
            <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
              확정
            </span>
          </div>
          <div className="border-b pb-4">
            <p className="text-gray-600">주차장 예약</p>
            <p className="text-sm text-gray-500">2024-03-21 09:00 - 18:00</p>
            <span className="inline-block px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
              대기중
            </span>
          </div>
          <div className="pb-4">
            <p className="text-gray-600">회의실 B 예약</p>
            <p className="text-sm text-gray-500">2024-03-22 10:00 - 11:00</p>
            <span className="inline-block px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
              취소됨
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
