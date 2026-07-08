import { type NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/service/http";
import { getLoginStatus } from "@/service/user";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await getLoginStatus(request.headers));
  } catch (error) {
    return handleApiError(error);
  }
}
