import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserData } from "@/app/actions/auth";
import { getUserReservations, Reservation } from "@/app/actions/reservation";
import DashboardLayout from "@/app/components/layouts/DashboardLayout";

export default async function DashboardPage() {
  try {
    // 토큰 확인
    const accessToken = cookies().get("accessToken");
    if (!accessToken) {
      redirect("/auth/login");
    }

    // 데이터 로드
    const userData = await getUserData();
    const reservations = await getUserReservations();

    return (
      <DashboardLayout
        title="대시보드"
        userName={userData.name}
        isAdmin={userData.grade === "ADMIN"}
      >
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">최근 예약 내역</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예약 번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예약 일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation: Reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(reservation.slot.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reservation.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {reservation.status === "CONFIRMED" ? "확정" : "대기"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    console.error("대시보드 로드 중 오류:", error);
    redirect("/auth/login");
  }
}
