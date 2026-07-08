import { type NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/service/http";
import { getCurrentUser } from "@/service/user";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await getCurrentUser(request.headers));
  } catch (error) {
    return handleApiError(error);
  }
}
