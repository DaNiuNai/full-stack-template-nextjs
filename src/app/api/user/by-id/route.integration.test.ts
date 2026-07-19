import {
  createApiRequest,
  type RouteHandler,
  signUpTestUser,
  type TestUser,
} from "../../../../../tests/helpers/api";

let get: RouteHandler;
let user: TestUser;

beforeAll(async () => {
  ({ GET: get } = await import("./route"));
  ({ user } = await signUpTestUser());
});

describe("GET /api/user/by-id", () => {
  it("从真实数据库按 ID 查询用户", async () => {
    const response = await get(
      createApiRequest(`/api/user/by-id?id=${encodeURIComponent(user.id)}`),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: user.id,
      name: "集成测试用户",
    });
  });

  it("返回查询参数校验错误和用户不存在错误", async () => {
    const invalidResponse = await get(createApiRequest("/api/user/by-id"));
    const missingResponse = await get(
      createApiRequest("/api/user/by-id?id=missing-user"),
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
});
