# 예약 시스템 API 문서

## 인증 API

### 로그인

- **엔드포인트**: `/auth/login`
- **메서드**: POST
- **요청 데이터**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "access_token": "string",
    "refresh_token": "string"
  }
  ```

### 토큰 갱신

- **엔드포인트**: `/auth/refresh`
- **메서드**: POST
- **헤더**:
  ```
  Authorization: Bearer {refreshToken}
  ```
- **응답 데이터**:
  ```json
  {
    "access_token": "string"
  }
  ```

### 회원가입

- **엔드포인트**: `/auth/signup`
- **메서드**: POST
- **요청 데이터**:
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```

### 이메일 인증

- **엔드포인트**: `/auth/verify-email`
- **메서드**: POST
- **요청 데이터**:
  ```json
  {
    "email": "string"
  }
  ```

### 인증 이메일 재발송

- **엔드포인트**: `/auth/resend-verification`
- **메서드**: POST
- **요청 데이터**:
  ```json
  {
    "email": "string"
  }
  ```

## 사용자 API

### 사용자 정보 조회

- **엔드포인트**: `/user/data`
- **메서드**: GET
- **응답 데이터**:
  ```json
  {
    "id": "number",
    "email": "string",
    "name": "string",
    "grade": "ADMIN" | "USER"
  }
  ```

## 관리자 API

### 카테고리 목록 조회

- **엔드포인트**: `/manage/categories`
- **메서드**: GET
- **응답 데이터**:
  ```json
  {
    "data": {
      "categories": [
        {
          "id": "number",
          "name": "string",
          "description": "string",
          "is_active": "boolean",
          "created_at": "string",
          "updated_at": "string"
        }
      ]
    }
  }
  ```
  또는
  ```json
  {
    "data": [
      {
        "id": "number",
        "name": "string",
        "description": "string",
        "is_active": "boolean",
        "created_at": "string",
        "updated_at": "string"
      }
    ]
  }
  ```

### 아이템 목록 조회

- **엔드포인트**: `/manage/items`
- **메서드**: GET
- **응답 데이터**:
  ```json
  {
    "data": {
      "items": [
        {
          "id": "number",
          "item_id": "number",
          "name": "string",
          "description": "string",
          "category_id": "number",
          "is_active": "boolean",
          "created_at": "string",
          "updated_at": "string",
          "category": {
            "id": "number",
            "name": "string",
            "description": "string",
            "is_active": "boolean",
            "created_at": "string",
            "updated_at": "string"
          }
        }
      ]
    }
  }
  ```
  또는
  ```json
  {
    "data": [
      {
        "id": "number",
        "item_id": "number",
        "name": "string",
        "description": "string",
        "category_id": "number",
        "is_active": "boolean",
        "created_at": "string",
        "updated_at": "string"
      }
    ]
  }
  ```

### 시간 슬롯 목록 조회

- **엔드포인트**: `/manage/time-slots`
- **메서드**: GET
- **응답 데이터**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "startTime": "string",
        "endTime": "string",
        "date": "string",
        "isAvailable": "boolean"
      }
    ]
  }
  ```

### 아이템 생성

- **엔드포인트**: `/manage/items`
- **메서드**: POST
- **요청 데이터**:
  ```json
  {
    "name": "string",
    "description": "string",
    "category_id": "number",
    "is_active": "boolean"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "data": {
      "id": "number",
      "item_id": "number",
      "name": "string",
      "description": "string",
      "category_id": "number",
      "is_active": "boolean",
      "created_at": "string",
      "updated_at": "string"
    }
  }
  ```

### 아이템 수정

- **엔드포인트**: `/manage/items/{id}`
- **메서드**: PUT
- **요청 데이터**:
  ```json
  {
    "name": "string",
    "description": "string",
    "category_id": "number",
    "is_active": "boolean"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "data": {
      "id": "number",
      "item_id": "number",
      "name": "string",
      "description": "string",
      "category_id": "number",
      "is_active": "boolean",
      "created_at": "string",
      "updated_at": "string"
    }
  }
  ```

### 아이템 삭제

- **엔드포인트**: `/manage/items/{id}`
- **메서드**: DELETE

### 아이템 상태 변경

- **엔드포인트**: `/manage/items/{id}/toggle-status`
- **메서드**: PATCH
- **요청 데이터**:
  ```json
  {
    "is_active": "boolean"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "data": {
      "id": "number",
      "item_id": "number",
      "name": "string",
      "description": "string",
      "category_id": "number",
      "is_active": "boolean",
      "created_at": "string",
      "updated_at": "string"
    }
  }
  ```

## 예약 API

### 예약 생성

- **엔드포인트**: `/oper/reserves`
- **메서드**: POST
- **요청 데이터**:
  ```json
  {
    "itemId": "number",
    "slotId": "number"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "data": {
      "id": "number",
      "item": {
        "id": "number",
        "item_id": "number",
        "name": "string",
        "description": "string",
        "category_id": "number",
        "is_active": "boolean",
        "created_at": "string",
        "updated_at": "string"
      },
      "slot": {
        "id": "number",
        "startTime": "string",
        "endTime": "string",
        "date": "string",
        "isAvailable": "boolean"
      },
      "status": "PENDING" | "CONFIRMED" | "CANCELLED"
    }
  }
  ```

### 예약 취소

- **엔드포인트**: `/oper/reserves/{reservationId}/cancel`
- **메서드**: POST
- **응답 데이터**:
  ```json
  {
    "data": {
      "id": "number",
      "item": {
        "id": "number",
        "item_id": "number",
        "name": "string",
        "description": "string",
        "category_id": "number",
        "is_active": "boolean",
        "created_at": "string",
        "updated_at": "string"
      },
      "slot": {
        "id": "number",
        "startTime": "string",
        "endTime": "string",
        "date": "string",
        "isAvailable": "boolean"
      },
      "status": "CANCELLED"
    }
  }
  ```

### 사용자 예약 목록 조회

- **엔드포인트**: `/oper/reserves`
- **메서드**: GET
- **응답 데이터**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "item": {
          "id": "number",
          "item_id": "number",
          "name": "string",
          "description": "string",
          "category_id": "number",
          "is_active": "boolean",
          "created_at": "string",
          "updated_at": "string"
        },
        "slot": {
          "id": "number",
          "startTime": "string",
          "endTime": "string",
          "date": "string",
          "isAvailable": "boolean"
        },
        "status": "PENDING" | "CONFIRMED" | "CANCELLED"
      }
    ]
  }
  ```

## 응답 형식

### 성공 응답

```json
{
  "status": "number",
  "data": "object 또는 array"
}
```

### 실패 응답

```json
{
  "status": "number",
  "error": "string"
}
```

## 상태 코드

- 200: 성공
- 400: 잘못된 요청
- 401: 인증 실패
- 403: 권한 없음
- 404: 리소스를 찾을 수 없음
- 500: 서버 내부 오류

## 인증 방식

- Bearer 토큰 인증 사용
- 토큰은 Authorization 헤더에 `Bearer {token}` 형식으로 전달
- 액세스 토큰은 로그인 성공 시 받은 access_token 사용
- 리프레시 토큰은 로그인 성공 시 받은 refresh_token 사용
