import {
  ApiClientError,
  fetchCurrentUser,
  fetchHello,
  fetchLoginStatus,
  fetchSecretMessage,
  fetchUserById,
  updateCurrentUserName,
} from "@/lib/user-api-client";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("用户 API 客户端", () => {
  it("编码问候语查询参数并返回 JSON", async () => {
    fetchMock.mockResolvedValue(Response.json({ greeting: "你好 张 三" }));

    await expect(fetchHello("张 三")).resolves.toEqual({
      greeting: "你好 张 三",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/hello?text=%E5%BC%A0+%E4%B8%89",
      undefined,
    );
  });

  it.each([
    [fetchLoginStatus, "/api/user/is-logged", { status: true }],
    [fetchCurrentUser, "/api/user/me", { id: "user-1" }],
    [fetchSecretMessage, "/api/user/secret-message", { message: "秘密" }],
  ] as const)("调用 %s", async (request, url, data) => {
    fetchMock.mockResolvedValue(Response.json(data));

    await expect(request()).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(url, undefined);
  });

  it("编码用户 ID", async () => {
    fetchMock.mockResolvedValue(Response.json({ id: "用户/1", name: "测试" }));

    await fetchUserById("用户/1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/by-id?id=%E7%94%A8%E6%88%B7%2F1",
      undefined,
    );
  });

  it("使用 JSON POST 更新当前用户名字", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ id: "user-1", name: "新名字" }),
    );

    await updateCurrentUserName("新名字");

    expect(fetchMock).toHaveBeenCalledWith("/api/user/update-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "新名字" }),
    });
  });

  it("将结构化错误转换为 ApiClientError", async () => {
    const issues = { fieldErrors: { name: ["名字不能为空"] } };
    fetchMock.mockResolvedValue(
      Response.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "请求参数无效",
            issues,
          },
        },
        { status: 400 },
      ),
    );

    const promise = updateCurrentUserName("");

    await expect(promise).rejects.toBeInstanceOf(ApiClientError);
    await expect(promise).rejects.toMatchObject({
      name: "ApiClientError",
      code: "BAD_REQUEST",
      status: 400,
      message: "请求参数无效",
      issues,
    });
  });

  it("兼容字符串错误响应", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ error: "服务暂不可用" }, { status: 503 }),
    );

    await expect(fetchCurrentUser()).rejects.toMatchObject({
      code: "UNKNOWN",
      status: 503,
      message: "服务暂不可用",
    });
  });

  it("为非 JSON 错误响应提供后备错误", async () => {
    fetchMock.mockResolvedValue(
      new Response("上游异常", {
        status: 502,
        headers: { "content-type": "text/plain" },
      }),
    );

    await expect(fetchCurrentUser()).rejects.toMatchObject({
      code: "UNKNOWN",
      status: 502,
      message: "请求失败 (502)",
      issues: undefined,
    });
  });
});
