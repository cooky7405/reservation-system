"use client";

import { useEffect, useState } from "react";
import { getUserData, checkAdminAccess } from "@/app/actions/auth";
import { getUserReservations } from "@/app/actions/reservation";
import { Reservation } from "@/app/actions/reservation";
import DashboardLayout from "@/app/components/layouts/DashboardLayout";
import DashboardMenu from "@/app/components/dashboard/DashboardMenu";
import ReservationTable from "@/app/components/dashboard/ReservationTable";

interface UserData {
  id: number;
  email: string;
  name: string;
  grade: string;
}

const userMenuItems = [
  {
    href: "/reservation",
    title: "예약하기",
    description: "새로운 예약을 생성합니다",
  },
  {
    href: "/my-reservations",
    title: "내 예약",
    description: "예약 내역을 확인합니다",
  },
  {
    href: "/profile",
    title: "프로필",
    description: "내 정보를 관리합니다",
  },
];

export default function UserDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
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
    <DashboardLayout
      title="내 대시보드"
      userName={userData?.name}
      isAdmin={isAdmin}
    >
      <DashboardMenu items={userMenuItems} />
      <ReservationTable reservations={recentReservations} />
    </DashboardLayout>
  );
}
