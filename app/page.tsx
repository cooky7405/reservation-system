import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const cookieStore = cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    redirect("/auth/login");
    return null;
  }

  return <HomeClient />;
}
