import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
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

    if (response.ok) {
      redirect("/dashboard");
    }
  } catch (error) {
    console.error("[Home] 사용자 정보 조회 실패:", error);
  }

  return <HomeClient />;
}
