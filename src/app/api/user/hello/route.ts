import { type NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/service/http";
import { getHello } from "@/service/user";

export function GET(request: NextRequest) {
  try {
    const text = request.nextUrl.searchParams.get("text") ?? "";
    return NextResponse.json(getHello(text));
  } catch (error) {
    return handleApiError(error);
  }
}
