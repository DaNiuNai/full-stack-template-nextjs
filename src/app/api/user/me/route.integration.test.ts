import {
  createApiRequest,
  type RouteHandler,
  signUpTestUser,
  type TestUser,
} from "@tests/helpers/api";

let get: RouteHandler;
let cookie: string;
let user: TestUser;

beforeAll(async () => {
  ({ GET: get } = await import("./route"));
  ({ cookie, user } = await signUpTestUser());
});

describe("GET /api/user/me", () => {
  it("仅向已登录用户返回当前用户信息", async () => {
    const anonymousResponse = await get(createApiRequest("/api/user/me"));
    const authenticatedResponse = await get(
      createApiRequest("/api/user/me", { cookie }),
    );

    expect(anonymousResponse.status).toBe(401);
    await expect(anonymousResponse.json()).resolves.toMatchObject({
      error: { code: "UNAUTHORIZED" },
    });
    expect(authenticatedResponse.status).toBe(200);
    await expect(authenticatedResponse.json()).resolves.toMatchObject({
      id: user.id,
      name: "集成测试用户",
    });
  });
});
