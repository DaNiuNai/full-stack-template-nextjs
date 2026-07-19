const mocks = vi.hoisted(() => ({
  db: { source: "mock-db" },
  getSession: vi.fn(),
}));

vi.mock("@/lib/better-auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));

vi.mock("@/lib/db", () => ({ db: mocks.db }));

import { ApiError } from "@/lib/http/errors";
import {
  getApiContext,
  getApiContextFromHeaders,
  readJsonObject,
  requireUser,
  searchParamsObject,
} from "@/lib/http/server";

describe("API 上下文", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
  });

  it("使用请求头读取会话并注入数据库", async () => {
    const session = { user: { id: "user-1" } };
    mocks.getSession.mockResolvedValue(session);
    const request = new Request("http://localhost/api/test", {
      headers: { cookie: "session=test-token" },
    });

    const context = await getApiContext(request);

    expect(mocks.getSession).toHaveBeenCalledOnce();
    const [{ headers }] = mocks.getSession.mock.calls[0] as [
      { headers: Headers },
    ];
    expect(headers.get("cookie")).toBe("session=test-token");
    expect(context).toEqual({ db: mocks.db, session, headers });
  });

  it("支持直接从 Headers 创建上下文", async () => {
    mocks.getSession.mockResolvedValue(null);
    const headers = new Headers({ "x-request-id": "request-1" });

    const context = await getApiContextFromHeaders(headers);

    expect(context).toEqual({ db: mocks.db, session: null, headers });
  });
});

describe("requireUser", () => {
  it("返回已登录会话", () => {
    const session = { user: { id: "user-1" }, session: { id: "session-1" } };

    expect(
      requireUser({ session } as unknown as Parameters<typeof requireUser>[0]),
    ).toEqual(session);
  });

  it("拒绝未登录请求", () => {
    expect(() =>
      requireUser({ session: null } as unknown as Parameters<
        typeof requireUser
      >[0]),
    ).toThrowError(
      expect.objectContaining<Partial<ApiError>>({
        code: "UNAUTHORIZED",
        status: 401,
        message: "请先登录",
      }),
    );
  });
});

describe("请求数据解析", () => {
  it("解析 JSON 对象", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "新名字" }),
    });

    await expect(readJsonObject(request)).resolves.toEqual({ name: "新名字" });
  });

  it.each(["", "   \n"])("将空正文 %j 解析为空对象", async (body) => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body,
    });

    await expect(readJsonObject(request)).resolves.toEqual({});
  });

  it("拒绝无效 JSON", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: "{invalid",
    });

    await expect(readJsonObject(request)).rejects.toMatchObject({
      code: "BAD_REQUEST",
      status: 400,
      message: "请求正文不是有效的 JSON",
    });
  });

  it("将查询参数转换为对象", () => {
    const request = new Request(
      "http://localhost/api/test?id=user-1&text=%E4%BD%A0%E5%A5%BD",
    );

    expect(searchParamsObject(request)).toEqual({
      id: "user-1",
      text: "你好",
    });
  });
});
