import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ReservationClient from "./ReservationClient";

export const dynamic = "force-dynamic";

export default async function ReservationPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    redirect("/auth/login");
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${baseUrl}/user/data`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      redirect("/auth/login");
    }
  } catch (error) {
    console.error("[ReservationPage] 사용자 정보 조회 실패:", error);
    redirect("/auth/login");
  }

  return <ReservationClient />;
}
