import { type NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/service/http";
import { getSecretMessage } from "@/service/user";

export async function GET(request: NextRequest) {
  try {
    const message = await getSecretMessage(request.headers);
    return NextResponse.json({ message });
  } catch (error) {
    return handleApiError(error);
  }
}
