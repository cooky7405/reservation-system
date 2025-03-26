# 클라이언트 인증 흐름

## 1. 로그인 프로세스

1. 사용자가 로그인 폼에 이메일과 비밀번호 입력
2. 클라이언트가 `/auth/login` API 호출
   ```typescript
   POST /auth/login
   {
     "email": "string",
     "password": "string"
   }
   ```
3. 로그인 성공 시:
   - 서버로부터 받은 `accessToken`을 localStorage에 저장
   - 사용자 정보를 상태에 저장
   - 대시보드 페이지로 리다이렉트

## 2. 인증 상태 관리

1. 앱 초기화 시:

   - localStorage에서 `accessToken` 확인
   - 토큰이 있으면 사용자 정보 조회 시도
   - 토큰이 없거나 유효하지 않으면 로그인 페이지로 리다이렉트

2. 사용자 정보 조회:
   ```typescript
   GET /user/data
   Headers: {
     "Authorization": "Bearer {accessToken}"
   }
   ```

## 3. 로그아웃 프로세스

1. localStorage에서 `accessToken` 제거
2. 인증 상태 초기화
3. 로그인 페이지로 리다이렉트

## 4. API 요청 처리

1. 모든 API 요청 시:
   - localStorage에서 `accessToken` 가져오기
   - Authorization 헤더에 `Bearer {token}` 형식으로 추가
   - 요청 실패 시 적절한 에러 처리

## 5. 에러 처리

- 401: 인증 실패
  - 토큰 제거
  - 로그인 페이지로 리다이렉트
- 403: 권한 없음
  - 적절한 에러 메시지 표시
- 404: 리소스를 찾을 수 없음
  - 404 페이지로 리다이렉트
- 500: 서버 내부 오류
  - 에러 메시지 표시

## 6. 보안 고려사항

- HTTPS 사용
- 토큰은 localStorage에만 저장
- 민감한 정보는 메모리에만 저장
- XSS 방지를 위한 입력값 검증
