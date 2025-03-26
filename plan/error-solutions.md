# 에러 해결 사례 기록

## 1. 관리자 계정 로그인 후 일반 대시보드로 리다이렉션 문제

### 증상

- 관리자 계정으로 로그인 했을 때 관리자 대시보드(`/admin/dashboard`)로 이동해야 하는데, 일반 사용자 대시보드(`/dashboard`)로 이동하는 문제 발생
- 클라이언트에서 로그를 확인했을 때, 로그인 성공 후 올바른 리다이렉션 경로(`/admin/dashboard`)가 설정되었지만 실제로는 이동하지 않음

### 원인

- Next.js의 `router.push()` 함수를 사용할 때 React 훅 관련 오류가 발생
- 로그인 폼에서 리다이렉션 처리 시 React 라우터 대신 일반 브라우저 네비게이션을 사용해야 함
- 다음과 같은 오류 발생:
  ```
  Rendered more hooks than during the previous render.
  ```

### 해결 방법

1. 로그인 폼 컴포넌트(`app/auth/login/LoginForm.tsx`)에서 다음 변경 실행:

   - `router.push()` 대신 `window.location.href`를 사용하여 페이지 리다이렉션
   - `useRouter` 훅과 관련 import 제거

2. 관리자 대시보드 페이지(`app/admin/dashboard/page.tsx`)에서도 동일한 변경 적용:

   - 권한 확인 후 리다이렉션 시 `router.push()` 대신 `window.location.href` 사용
   - 불필요한 `useRouter` 훅 제거

3. 미들웨어(`middleware.ts`)의 리다이렉션 로직 개선:
   - 에러 처리 로직 개선
   - 로그 메시지 명확하게 개선
   - API 응답 실패에 대한 명시적인 처리 추가

### 교훈

- Next.js의 클라이언트 컴포넌트에서 상태 변경과 동시에 리다이렉션을 처리할 때는 주의가 필요함
- 서버 컴포넌트와 클라이언트 컴포넌트 간의 상호작용에서 라우팅을 처리할 때는 간단한 방식(`window.location.href`)이 더 안정적일 수 있음
- 오류 발생 시 상세한 로그를 남기는 것이 문제 해결에 큰 도움이 됨
