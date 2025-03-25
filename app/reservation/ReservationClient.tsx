"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Category,
  Item,
  TimeSlot,
  Reservation,
  getCategories,
  getItems,
  getTimeSlots,
  createReservation,
  getUserReservations,
} from "@/app/actions/reservation";
import { ApiError } from "@/utils/error";

export default function ReservationClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [categoriesData, itemsData, reservationsData] = await Promise.all(
          [getCategories(), getItems(), getUserReservations()]
        );
        setCategories(categoriesData);
        setItems(itemsData);
        setUserReservations(reservationsData);
      } catch {
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (selectedItem) {
      const loadTimeSlots = async () => {
        try {
          const slots = await getTimeSlots();
          setTimeSlots(slots);
        } catch (error) {
          console.error("[ReservationClient] 시간 슬롯 로드 실패:", error);
          const errorMessage =
            error instanceof ApiError
              ? error.message
              : "시간 슬롯 로드에 실패했습니다.";
          setError(errorMessage);
        }
      };

      loadTimeSlots();
    }
  }, [selectedItem]);

  const handleCategoryChange = () => {
    setSelectedItem(null);
    setSelectedSlot(null);
  };

  const handleItemChange = (itemId: string) => {
    const item = items.find((item) => item.id === parseInt(itemId)) || null;
    setSelectedItem(item);
    setSelectedSlot(null);
  };

  const handleDateChange = (date: string) => {
    const availableSlots = timeSlots.filter(
      (slot) => slot.date === date && slot.isAvailable
    );
    if (availableSlots.length > 0) {
      setSelectedSlot(availableSlots[0]);
    }
  };

  const handleTimeChange = (time: string) => {
    const slot = timeSlots.find((slot) => slot.id === parseInt(time)) || null;
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedSlot) {
      setError("아이템과 시간을 선택해주세요.");
      return;
    }

    try {
      await createReservation(selectedItem.id, selectedSlot.id);
      router.push("/dashboard/user");
    } catch {
      setError("예약에 실패했습니다.");
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
      <h1 className="text-2xl font-bold mb-6">예약 시스템</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            카테고리
          </label>
          <select
            value={selectedItem?.categoryId.toString() || ""}
            onChange={() => handleCategoryChange()}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">카테고리 선택</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            아이템
          </label>
          <select
            value={selectedItem?.id.toString() || ""}
            onChange={(e) => handleItemChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={!selectedItem}
          >
            <option value="">아이템 선택</option>
            {items
              .filter((item) => item.categoryId === selectedItem?.categoryId)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            날짜
          </label>
          <input
            type="date"
            value={selectedSlot?.date || ""}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={!selectedItem}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            시간
          </label>
          <select
            value={selectedSlot?.id.toString() || ""}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={!selectedSlot}
          >
            <option value="">시간 선택</option>
            {timeSlots
              .filter((slot) => slot.date === selectedSlot?.date)
              .map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {new Date(slot.startTime).toLocaleTimeString()} -{" "}
                  {new Date(slot.endTime).toLocaleTimeString()}
                </option>
              ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!selectedItem || !selectedSlot}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          예약하기
        </button>
      </form>

      {/* 사용자의 예약 목록 */}
      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">내 예약 목록</h2>
        <div className="space-y-4">
          {userReservations.map((reservation) => (
            <div key={reservation.id} className="border-b pb-4">
              <p className="text-gray-600">{reservation.item.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(reservation.slot.startTime).toLocaleString()} -{" "}
                {new Date(reservation.slot.endTime).toLocaleString()}
              </p>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
