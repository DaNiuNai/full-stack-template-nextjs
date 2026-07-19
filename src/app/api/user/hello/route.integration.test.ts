import { createApiRequest, type RouteHandler } from "@tests/helpers/api";

let get: RouteHandler;

beforeAll(async () => {
  ({ GET: get } = await import("./route"));
});

describe("GET /api/user/hello", () => {
  it("返回问候语并应用默认输入", async () => {
    const namedResponse = await get(
      createApiRequest("/api/user/hello?text=%E5%B0%8F%E6%98%8E"),
    );
    const defaultResponse = await get(createApiRequest("/api/user/hello"));

    expect(namedResponse.status).toBe(200);
    await expect(namedResponse.json()).resolves.toEqual({
      greeting: "你好 小明",
    });
    await expect(defaultResponse.json()).resolves.toEqual({
      greeting: "你好 ",
    });
  });
});
