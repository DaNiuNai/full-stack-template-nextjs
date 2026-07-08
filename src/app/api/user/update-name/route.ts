import { type NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/service/http";
import { updateCurrentUserName } from "@/service/user";

export async function POST(request: NextRequest) {
  try {
    const input: unknown = await request.json().catch(() => null);
    return NextResponse.json(
      await updateCurrentUserName(request.headers, input),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
