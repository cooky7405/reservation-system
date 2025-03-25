import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardClient>{children}</DashboardClient>
    </div>
  );
}
