import { auth } from "@/lib/better-auth";
import { db } from "@/lib/db";
import { ApiError } from "./errors";

export type ApiContext = {
  db: typeof db;
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
  headers: Headers;
};

export async function getApiContext(request: Request): Promise<ApiContext> {
  return getApiContextFromHeaders(new Headers(request.headers));
}

export async function getApiContextFromHeaders(
  headers: Headers,
): Promise<ApiContext> {
  const session = await auth.api.getSession({ headers });

  return { db, session, headers };
}

export function requireUser(ctx: ApiContext) {
  if (!ctx.session?.user) {
    throw new ApiError({ code: "UNAUTHORIZED", message: "请先登录" });
  }

  return { ...ctx.session, user: ctx.session.user };
}

export async function readJsonObject(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError({
      code: "BAD_REQUEST",
      message: "请求正文不是有效的 JSON",
    });
  }
}

export function searchParamsObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}
