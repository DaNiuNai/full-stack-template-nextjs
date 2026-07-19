import type { PrismaClient } from "../../generated/prisma/client";

type RouteHandler = (request: Request) => Promise<Response>;

let db: PrismaClient;
let authPost: RouteHandler;
let helloGet: RouteHandler;
let loginStatusGet: RouteHandler;
let userByIdGet: RouteHandler;
let currentUserGet: RouteHandler;
let secretMessageGet: RouteHandler;
let updateNamePost: RouteHandler;
let authenticatedCookie: string;
let userId: string;

function request(path: string, init: RequestInit = {}, authenticated = false) {
  const headers = new Headers(init.headers);
  if (authenticated) headers.set("cookie", authenticatedCookie);

  return new Request(`http://localhost:3000${path}`, { ...init, headers });
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

beforeAll(async () => {
  ({ db } = await import("@/lib/db"));
  ({ POST: authPost } = await import("@/app/api/auth/[...all]/route"));
  ({ GET: helloGet } = await import("@/app/api/user/hello/route"));
  ({ GET: loginStatusGet } = await import("@/app/api/user/is-logged/route"));
  ({ GET: userByIdGet } = await import("@/app/api/user/by-id/route"));
  ({ GET: currentUserGet } = await import("@/app/api/user/me/route"));
  ({ GET: secretMessageGet } =
    await import("@/app/api/user/secret-message/route"));
  ({ POST: updateNamePost } = await import("@/app/api/user/update-name/route"));

  const email = `integration-${Date.now()}@example.com`;
  const response = await authPost(
    request("/api/auth/sign-up/email", {
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

  expect(response.status).toBe(200);
  const body = (await response.json()) as { user: { id: string } };
  userId = body.user.id;
  authenticatedCookie = getCookieHeader(response);
});

afterAll(async () => {
  await db?.$disconnect();
});

describe("用户 API 路由与 PostgreSQL 集成", () => {
  it("返回问候语并应用默认输入", async () => {
    const namedResponse = await helloGet(
      request("/api/user/hello?text=%E5%B0%8F%E6%98%8E"),
    );
    const defaultResponse = await helloGet(request("/api/user/hello"));

    expect(namedResponse.status).toBe(200);
    await expect(namedResponse.json()).resolves.toEqual({
      greeting: "你好 小明",
    });
    await expect(defaultResponse.json()).resolves.toEqual({
      greeting: "你好 ",
    });
  });

  it("区分匿名和已登录请求", async () => {
    const anonymousResponse = await loginStatusGet(
      request("/api/user/is-logged"),
    );
    const authenticatedResponse = await loginStatusGet(
      request("/api/user/is-logged", {}, true),
    );

    await expect(anonymousResponse.json()).resolves.toEqual({ status: false });
    await expect(authenticatedResponse.json()).resolves.toEqual({
      status: true,
    });
  });

  it("从真实数据库按 ID 查询用户", async () => {
    const response = await userByIdGet(
      request(`/api/user/by-id?id=${encodeURIComponent(userId)}`),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: userId,
      name: "集成测试用户",
    });
  });

  it("返回查询参数校验错误和用户不存在错误", async () => {
    const invalidResponse = await userByIdGet(request("/api/user/by-id"));
    const missingResponse = await userByIdGet(
      request("/api/user/by-id?id=missing-user"),
    );

    expect(invalidResponse.status).toBe(400);
    await expect(invalidResponse.json()).resolves.toMatchObject({
      error: { code: "BAD_REQUEST", message: "请求参数无效" },
    });
    expect(missingResponse.status).toBe(404);
    await expect(missingResponse.json()).resolves.toEqual({
      error: { code: "NOT_FOUND", message: "用户不存在" },
    });
  });

  it("保护当前用户信息和秘密消息", async () => {
    const anonymousMe = await currentUserGet(request("/api/user/me"));
    const authenticatedMe = await currentUserGet(
      request("/api/user/me", {}, true),
    );
    const anonymousSecret = await secretMessageGet(
      request("/api/user/secret-message"),
    );
    const authenticatedSecret = await secretMessageGet(
      request("/api/user/secret-message", {}, true),
    );

    expect(anonymousMe.status).toBe(401);
    await expect(anonymousMe.json()).resolves.toMatchObject({
      error: { code: "UNAUTHORIZED" },
    });
    expect(authenticatedMe.status).toBe(200);
    await expect(authenticatedMe.json()).resolves.toMatchObject({
      id: userId,
      name: "集成测试用户",
    });
    expect(anonymousSecret.status).toBe(401);
    expect(authenticatedSecret.status).toBe(200);
    await expect(authenticatedSecret.json()).resolves.toEqual({
      message: "你可以看到这条秘密信息了！",
    });
  });

  it("校验更新名字请求", async () => {
    const invalidJson = await updateNamePost(
      request(
        "/api/user/update-name",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{invalid",
        },
        true,
      ),
    );
    const invalidName = await updateNamePost(
      request(
        "/api/user/update-name",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "" }),
        },
        true,
      ),
    );
    const anonymous = await updateNamePost(
      request("/api/user/update-name", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "匿名修改" }),
      }),
    );

    expect(invalidJson.status).toBe(400);
    await expect(invalidJson.json()).resolves.toMatchObject({
      error: { code: "BAD_REQUEST", message: "请求正文不是有效的 JSON" },
    });
    expect(invalidName.status).toBe(400);
    await expect(invalidName.json()).resolves.toMatchObject({
      error: { code: "BAD_REQUEST", message: "请求参数无效" },
    });
    expect(anonymous.status).toBe(401);
  });

  it("更新真实数据库中的当前用户名字", async () => {
    const response = await updateNamePost(
      request(
        "/api/user/update-name",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "数据库新名字" }),
        },
        true,
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: userId,
      name: "数据库新名字",
    });
    await expect(
      db.user.findUnique({ where: { id: userId }, select: { name: true } }),
    ).resolves.toEqual({ name: "数据库新名字" });
  });
});
