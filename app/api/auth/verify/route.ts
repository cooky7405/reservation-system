import { NextResponse } from "next/server";
import { verifyEmail } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "인증 토큰이 필요합니다." },
        { status: 400 }
      );
    }

    const result = await verifyEmail(token);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[verify] 이메일 인증 실패:", error);
    return NextResponse.json(
      { message: "이메일 인증에 실패했습니다." },
      { status: 500 }
    );
  }
}
