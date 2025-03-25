export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const ErrorCodes = {
  AUTH: {
    INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
    TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
    UNAUTHORIZED: "AUTH_UNAUTHORIZED",
    EMAIL_NOT_VERIFIED: "AUTH_EMAIL_NOT_VERIFIED",
  },
  RESERVATION: {
    SLOT_UNAVAILABLE: "RESERVATION_SLOT_UNAVAILABLE",
    INVALID_TIME: "RESERVATION_INVALID_TIME",
    ALREADY_RESERVED: "RESERVATION_ALREADY_RESERVED",
  },
  VALIDATION: {
    INVALID_INPUT: "VALIDATION_INVALID_INPUT",
    REQUIRED_FIELD: "VALIDATION_REQUIRED_FIELD",
  },
  SERVER: {
    INTERNAL_ERROR: "SERVER_INTERNAL_ERROR",
    SERVICE_UNAVAILABLE: "SERVER_SERVICE_UNAVAILABLE",
  },
} as const;

export const ErrorMessages = {
  [ErrorCodes.AUTH.INVALID_CREDENTIALS]:
    "이메일 또는 비밀번호가 올바르지 않습니다.",
  [ErrorCodes.AUTH.TOKEN_EXPIRED]:
    "세션이 만료되었습니다. 다시 로그인해주세요.",
  [ErrorCodes.AUTH.UNAUTHORIZED]: "로그인이 필요합니다.",
  [ErrorCodes.AUTH.EMAIL_NOT_VERIFIED]: "이메일 인증이 필요합니다.",
  [ErrorCodes.RESERVATION.SLOT_UNAVAILABLE]:
    "선택한 시간은 이미 예약되어 있습니다.",
  [ErrorCodes.RESERVATION.INVALID_TIME]: "유효하지 않은 예약 시간입니다.",
  [ErrorCodes.RESERVATION.ALREADY_RESERVED]: "이미 예약된 항목입니다.",
  [ErrorCodes.VALIDATION.INVALID_INPUT]: "입력값이 올바르지 않습니다.",
  [ErrorCodes.VALIDATION.REQUIRED_FIELD]: "필수 입력 항목입니다.",
  [ErrorCodes.SERVER.INTERNAL_ERROR]:
    "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  [ErrorCodes.SERVER.SERVICE_UNAVAILABLE]:
    "서비스가 일시적으로 사용할 수 없습니다.",
} as const;

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(500, ErrorCodes.SERVER.INTERNAL_ERROR, error.message);
  }

  return new ApiError(
    500,
    ErrorCodes.SERVER.INTERNAL_ERROR,
    "알 수 없는 오류가 발생했습니다."
  );
}

export function getErrorMessage(error: unknown): string {
  const apiError = handleApiError(error);
  return (
    ErrorMessages[apiError.code as keyof typeof ErrorMessages] ||
    apiError.message
  );
}
