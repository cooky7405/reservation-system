"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkAdminAccess } from "@/app/actions/auth";
import { getUserReservations } from "@/app/actions/reservation";
import { Reservation } from "@/app/actions/reservation";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>(
    []
  );

  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log("[AdminDashboard] 관리자 권한 확인 시작");
        const isAdmin = await checkAdminAccess();
        console.log("[AdminDashboard] 관리자 권한 확인 결과:", isAdmin);

        if (!isAdmin) {
          console.log(
            "[AdminDashboard] 관리자 권한 없음, 일반 대시보드로 리다이렉션"
          );
          window.location.href = "/dashboard";
          return;
        }

        console.log("[AdminDashboard] 관리자 권한 확인 완료, 데이터 로드 시작");
        loadData();
      } catch (error) {
        console.error("[AdminDashboard] 권한 확인 중 오류:", error);
        window.location.href = "/dashboard";
      }
    };
    checkAccess();
  }, []);

  const loadData = async () => {
    try {
      const reservations = await getUserReservations();
      // 최근 예약 5개만 표시
      setRecentReservations(reservations.slice(0, 5));
    } catch (error) {
      setError("데이터 로딩 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>

      {/* 대시보드 전환 */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <span className="mr-2">←</span>
          일반 사용자 대시보드로 이동
        </Link>
      </div>

      {/* 관리 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/items"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">아이템 관리</h2>
          <p className="text-gray-600">아이템 추가, 수정, 삭제 및 상태 관리</p>
        </Link>

        <Link
          href="/admin/categories"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">카테고리 관리</h2>
          <p className="text-gray-600">
            카테고리 추가, 수정, 삭제 및 상태 관리
          </p>
        </Link>

        <Link
          href="/admin/time-slots"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">시간대 관리</h2>
          <p className="text-gray-600">예약 가능 시간대 설정 및 관리</p>
        </Link>

        <Link
          href="/admin/reservations"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">예약 관리</h2>
          <p className="text-gray-600">예약 현황 확인 및 상태 관리</p>
        </Link>

        <Link
          href="/admin/users"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">사용자 관리</h2>
          <p className="text-gray-600">사용자 목록 조회 및 권한 관리</p>
        </Link>
      </div>

      {/* 최근 예약 현황 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">최근 예약 현황</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약 ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  아이템
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜/시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservation.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservation.item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(reservation.slot.date).toLocaleDateString()}{" "}
                    {reservation.slot.startTime} - {reservation.slot.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reservation.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : reservation.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {reservation.status === "CONFIRMED"
                        ? "확정"
                        : reservation.status === "CANCELLED"
                        ? "취소"
                        : "대기"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
