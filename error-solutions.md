# 에러 해결 방법

## Next.js Dynamic Server 에러 해결

### 문제 상황

Vercel에서 빌드할 때 다음과 같은 에러가 발생:

```
대시보드 로드 중 오류: n [Error]: Dynamic server usage: Route /dashboard couldn't be rendered statically because it used `cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
```

이 에러는 Next.js가 빌드 타임에 정적 페이지를 생성하려고 할 때 `cookies()` 함수와 같은 동적 서버 기능을 사용하는 코드를 만났기 때문에 발생합니다.

### 원인

Next.js는 기본적으로 가능한 많은 페이지를 정적으로 생성하려고 시도합니다. 그러나 쿠키 접근, 헤더 접근과 같은 요청 시간에만 사용할 수 있는 API를 사용하는 페이지는 정적으로 생성할 수 없습니다.

이 경우 `app/dashboard/page.tsx`와 같은 페이지에서 `cookies()`를 사용하여 인증 토큰을 확인하는 코드가 포함되어 있었습니다.

### 해결 방법

각각의 동적 데이터를 사용하는 페이지에 `dynamic = 'force-dynamic'` 설정을 추가하여 Next.js에게 해당 페이지를 항상 서버에서 동적으로 렌더링하도록 지시합니다.

예시:

```typescript
// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 이 페이지는 항상 서버에서 동적으로 렌더링됩니다.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 토큰 확인
  const accessToken = cookies().get("accessToken");

  // 나머지 코드...
}
```

이 설정을 다음과 같은 페이지에 적용했습니다:

1. `app/dashboard/page.tsx`
2. `app/admin/dashboard/page.tsx`
3. `app/admin/items/page.tsx`
4. `app/dashboard/admin/page.tsx`
5. `app/reservation/page.tsx`

### 효과

- 빌드 타임에 더 이상 동적 서버 사용 에러가 발생하지 않습니다.
- 해당 페이지들은 항상 서버에서 동적으로 렌더링되어 쿠키, 헤더 등의 요청 시간 데이터에 안전하게 접근할 수 있습니다.
- 각 요청마다 페이지 콘텐츠가 생성되므로 항상 최신 데이터를 보여줍니다.

### 참고 사항

- `dynamic = 'force-dynamic'` 설정을 사용하면 해당 페이지는 정적으로 생성되지 않으므로 CDN 캐싱이 적용되지 않습니다.
- 인증이 필요한 페이지나 요청 시간 데이터에 의존하는 페이지에만 이 설정을 적용하는 것이 좋습니다.
- 자세한 정보는 [Next.js 공식 문서](https://nextjs.org/docs/messages/dynamic-server-error)를 참조하세요.

## 무한 리다이렉션 Loop 에러 해결

### 문제 상황

Vercel 배포 환경에서 로그인 후 다음과 같은 에러가 발생:

```
페이지가 작동하지 않습니다.
reservation-system-five-liard.vercel.app에서 리디렉션한 횟수가 너무 많습니다.

쿠키 삭제해 보기.
ERR_TOO_MANY_REDIRECTS
```

### 원인

미들웨어(`middleware.ts`)에서 토큰 검증과 리다이렉션 처리 로직에 문제가 있었습니다:

1. 토큰이 존재하지만 API 요청으로 검증 실패할 경우
2. 검증 실패 시 로그인 페이지(`/auth/login`)로 리다이렉트
3. 미들웨어가 토큰이 있는 `/auth/login` 페이지에서 다시 API 검증 시도
4. 다시 검증 실패하고 `/auth/login`으로 리다이렉트
5. 이 과정이 무한 반복됨

### 해결 방법

1. 미들웨어에서 공개 경로(`/auth/login`, `/auth/signup`)에 대한 처리 로직 개선:

   ```typescript
   // 공개 경로는 체크하지 않음
   if (path === "/auth/login" || path === "/auth/signup") {
     return NextResponse.next();
   }
   ```

2. API 요청 실패 시 토큰 삭제 후 리다이렉트:

   ```typescript
   // API 요청 실패 시 쿠키 삭제
   const response = NextResponse.redirect(new URL("/auth/login", request.url));
   response.cookies.delete("accessToken");
   response.cookies.delete("refreshToken");
   return response;
   ```

3. 로그인 함수(`app/actions/auth.ts`)에서 클라이언트 리다이렉션 방식 개선:
   ```typescript
   // 리다이렉션 경로 결정 및 반환
   const redirectTo =
     userData.grade === "ADMIN" ? "/admin/dashboard" : "/dashboard";
   return { success: true, redirectTo };
   ```

### 효과

- 미들웨어에서 `/auth/login` 페이지는 토큰 검증을 시도하지 않아 무한 루프 방지
- API 요청 실패 시 토큰을 삭제하여 새로운 로그인 세션 유도
- 클라이언트에서 리다이렉션을 처리하여 서버-클라이언트 간 일관성 유지

### 참고 사항

- 미들웨어는 Next.js 애플리케이션의 모든 요청을 가로채서 처리합니다.
- 인증 로직이 있는 경우 공개 경로와 보호된 경로를 명확히 구분해야 합니다.
- API 토큰 검증 실패 시 기존 토큰을 삭제하는 것이 좋은 보안 관행입니다.
