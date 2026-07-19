import type { PrismaClient } from "@generated/prisma/client";

import {
  createApiRequest,
  type RouteHandler,
  signUpTestUser,
  type TestUser,
} from "@tests/helpers/api";

let db: PrismaClient;
let post: RouteHandler;
let cookie: string;
let user: TestUser;

beforeAll(async () => {
  ({ db } = await import("@/lib/db"));
  ({ POST: post } = await import("./route"));
  ({ cookie, user } = await signUpTestUser());
});

afterAll(async () => {
  await db?.$disconnect();
});

describe("POST /api/user/update-name", () => {
  it("校验请求正文和登录状态", async () => {
    const invalidJson = await post(
      createApiRequest("/api/user/update-name", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{invalid",
        cookie,
      }),
    );
    const invalidName = await post(
      createApiRequest("/api/user/update-name", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "" }),
        cookie,
      }),
    );
    const anonymous = await post(
      createApiRequest("/api/user/update-name", {
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
    const response = await post(
      createApiRequest("/api/user/update-name", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "数据库新名字" }),
        cookie,
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: user.id,
      name: "数据库新名字",
    });
    await expect(
      db.user.findUnique({ where: { id: user.id }, select: { name: true } }),
    ).resolves.toEqual({ name: "数据库新名字" });
  });
});
