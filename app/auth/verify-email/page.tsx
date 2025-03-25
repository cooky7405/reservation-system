import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
