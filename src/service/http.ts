import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError } from "@/service/user";

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "请求参数无效", details: error.flatten() },
      { status: 400 },
    );
  }

  console.error(error);
  return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
}
