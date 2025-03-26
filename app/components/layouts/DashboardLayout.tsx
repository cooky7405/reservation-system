"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userName?: string;
  isAdmin?: boolean;
}

export default function DashboardLayout({
  children,
  title,
  userName,
  isAdmin,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <>
              {isAdminPage ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <span className="mr-2">←</span>
                  일반 사용자 대시보드로 이동
                </Link>
              ) : (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  관리자 대시보드로 이동 →
                </Link>
              )}
            </>
          )}
          {userName && (
            <div className="text-sm text-gray-600">{userName}님 환영합니다</div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
