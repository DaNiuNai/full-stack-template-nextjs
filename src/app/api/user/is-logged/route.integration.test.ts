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

describe("GET /api/user/is-logged", () => {
  it("区分匿名和已登录请求", async () => {
    const anonymousResponse = await get(
      createApiRequest("/api/user/is-logged"),
    );
    const authenticatedResponse = await get(
      createApiRequest("/api/user/is-logged", { cookie }),
    );

    await expect(anonymousResponse.json()).resolves.toEqual({ status: false });
    await expect(authenticatedResponse.json()).resolves.toEqual({
      status: true,
    });
  });
});
