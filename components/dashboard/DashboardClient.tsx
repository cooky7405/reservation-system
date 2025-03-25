"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Reservation,
  getUserReservations,
  cancelReservation,
} from "@/app/actions/reservation";
import { ApiError } from "@/utils/error";

export default function DashboardClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const fetchReservations = async () => {
      try {
        const data = await getUserReservations();
        setReservations(data);
      } catch (error) {
        console.error("[DashboardClient] 예약 목록 로드 실패:", error);
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "예약 목록을 불러오는데 실패했습니다.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated, isLoading, router]);

  const handleCancelReservation = async (reservationId: number) => {
    try {
      await cancelReservation(reservationId);
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId ? { ...r, status: "CANCELLED" } : r
        )
      );
    } catch (error) {
      console.error("[DashboardClient] 예약 취소 실패:", error);
      const errorMessage =
        error instanceof ApiError ? error.message : "예약 취소에 실패했습니다.";
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      {/* 예약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">예약 현황</h2>
          <p>전체 예약: {reservations.length}</p>
          <p>
            대기중: {reservations.filter((r) => r.status === "PENDING").length}
          </p>
          <p>
            확정: {reservations.filter((r) => r.status === "CONFIRMED").length}
          </p>
          <p>
            취소: {reservations.filter((r) => r.status === "CANCELLED").length}
          </p>
        </div>
      </div>

      {/* 예약 목록 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">최근 예약</h2>
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="border-b pb-4">
              <p className="text-gray-600">{reservation.item.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(reservation.slot.startTime).toLocaleString()} -{" "}
                {new Date(reservation.slot.endTime).toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    reservation.status === "CONFIRMED"
                      ? "text-green-800 bg-green-100"
                      : reservation.status === "PENDING"
                      ? "text-yellow-800 bg-yellow-100"
                      : "text-red-800 bg-red-100"
                  }`}
                >
                  {reservation.status === "CONFIRMED"
                    ? "확정"
                    : reservation.status === "PENDING"
                    ? "대기중"
                    : "취소됨"}
                </span>
                {reservation.status === "PENDING" && (
                  <button
                    onClick={() => handleCancelReservation(reservation.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    취소
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
