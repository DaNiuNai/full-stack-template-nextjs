import { randomUUID } from "node:crypto";

export type RouteHandler = (request: Request) => Promise<Response>;

export type TestUser = {
  id: string;
  name: string;
  email: string;
};

type ApiRequestInit = RequestInit & {
  cookie?: string;
};

export function createApiRequest(
  path: string,
  { cookie, ...init }: ApiRequestInit = {},
) {
  const headers = new Headers(init.headers);
  if (cookie) headers.set("cookie", cookie);

  return new Request(`http://localhost:3000${path}`, { ...init, headers });
}

export async function signUpTestUser() {
  const { POST } = await import("@/app/api/auth/[...all]/route");
  const email = `integration-${randomUUID()}@example.com`;
  const response = await POST(
    createApiRequest("/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "集成测试用户",
        email,
        password: "integration-password-123",
      }),
    }),
  );

  if (!response.ok) {
    throw new Error(
      `注册测试用户失败：${response.status} ${await response.text()}`,
    );
  }

  const body = (await response.json()) as { user: TestUser };

  return {
    user: body.user,
    cookie: getCookieHeader(response),
  };
}

function getCookieHeader(response: Response) {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies = headers.getSetCookie?.() ?? [
    headers.get("set-cookie") ?? "",
  ];
  const cookies = setCookies
    .filter(Boolean)
    .map((cookie) => cookie.split(";", 1)[0])
    .filter(Boolean);

  if (cookies.length === 0) {
    throw new Error("注册响应没有返回会话 Cookie");
  }

  return cookies.join("; ");
}
