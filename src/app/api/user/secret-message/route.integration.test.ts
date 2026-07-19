import {
  createApiRequest,
  type RouteHandler,
  signUpTestUser,
} from "../../../../../tests/helpers/api";

let get: RouteHandler;
let cookie: string;

beforeAll(async () => {
  ({ GET: get } = await import("./route"));
  ({ cookie } = await signUpTestUser());
});

describe("GET /api/user/secret-message", () => {
  it("保护秘密消息", async () => {
    const anonymousResponse = await get(
      createApiRequest("/api/user/secret-message"),
    );
    const authenticatedResponse = await get(
      createApiRequest("/api/user/secret-message", { cookie }),
    );

    expect(anonymousResponse.status).toBe(401);
    await expect(anonymousResponse.json()).resolves.toMatchObject({
      error: { code: "UNAUTHORIZED" },
    });
    expect(authenticatedResponse.status).toBe(200);
    await expect(authenticatedResponse.json()).resolves.toEqual({
      message: "你可以看到这条秘密信息了！",
    });
  });
});
