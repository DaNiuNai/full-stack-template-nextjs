import { type NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/service/http";
import { getUserById } from "@/service/user";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id") ?? "";
    return NextResponse.json(await getUserById(id));
  } catch (error) {
    return handleApiError(error);
  }
}
