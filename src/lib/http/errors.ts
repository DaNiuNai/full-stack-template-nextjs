import { ZodError } from "zod";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

const statusByCode: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(input: { code: ApiErrorCode; message?: string }) {
    super(input.message ?? input.code);
    this.name = "ApiError";
    this.code = input.code;
    this.status = statusByCode[input.code];
  }
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "请求参数无效",
          issues: error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  console.error("API request failed", error);
  return Response.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "服务器内部错误",
      },
    },
    { status: 500 },
  );
}

export async function withApiError(
  handler: () => Promise<Response> | Response,
) {
  try {
    return await handler();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
