"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserData, checkAdminAccess } from "@/app/actions/auth";
import { getUserReservations } from "@/app/actions/reservation";
import { Reservation } from "@/app/actions/reservation";

export default function UserDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>(
    []
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [user, reservations, adminCheck] = await Promise.all([
        getUserData(),
        getUserReservations(),
        checkAdminAccess(),
      ]);

      // 로그인 후 첫 접근 시에만 리다이렉션
      const isFirstAccess = !sessionStorage.getItem("dashboardAccessed");
      if (adminCheck && isFirstAccess) {
        sessionStorage.setItem("dashboardAccessed", "true");
        router.push("/admin/dashboard");
        return;
      }

      setUserData(user);
      setRecentReservations(reservations.slice(0, 5));
      setIsAdmin(adminCheck);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 대시보드</h1>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              관리자 대시보드로 이동 →
            </Link>
          )}
          <div className="text-sm text-gray-600">
            {userData?.name}님 환영합니다
          </div>
        </div>
      </div>

      {/* 사용자 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href="/reservation"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">예약하기</h2>
          <p className="text-gray-600">새로운 예약을 생성합니다</p>
        </Link>

        <Link
          href="/my-reservations"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">내 예약</h2>
          <p className="text-gray-600">예약 내역을 확인합니다</p>
        </Link>

        <Link
          href="/profile"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">프로필</h2>
          <p className="text-gray-600">내 정보를 관리합니다</p>
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
