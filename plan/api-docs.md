# API 문서

## 인증 관련 API

### 로그인

- **엔드포인트**: `/auth/login`
- **메서드**: POST
- **요청 본문**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **응답**:
  ```json
  {
    "accessToken": "string",
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "role": "ADMIN" | "USER"
    }
  }
  ```

### 사용자 정보 조회

- **엔드포인트**: `/user/data`
- **메서드**: GET
- **헤더**:
  ```
  Authorization: Bearer {accessToken}
  ```
- **응답**:
  ```json
  {
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "role": "ADMIN" | "USER"
    }
  }
  ```

## 에러 응답 형식

```json
{
  "msg": "string",
  "error": "string"
}
```

## 상태 코드

- 200: 성공
- 401: 인증 실패
- 403: 권한 없음
- 404: 리소스를 찾을 수 없음
- 500: 서버 내부 오류

## 인증 방식

- Bearer 토큰 인증 사용
- 토큰은 Authorization 헤더에 `Bearer {token}` 형식으로 전달
- 토큰은 로그인 성공 시 받은 accessToken 사용
