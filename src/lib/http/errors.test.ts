import { z } from "zod";

import { ApiError, apiErrorResponse, withApiError } from "@/lib/http/errors";

describe("ApiError", () => {
  it.each([
    ["BAD_REQUEST", 400],
    ["UNAUTHORIZED", 401],
    ["FORBIDDEN", 403],
    ["NOT_FOUND", 404],
    ["CONFLICT", 409],
    ["INTERNAL_SERVER_ERROR", 500],
  ] as const)("将 %s 映射为 %i", (code, status) => {
    const error = new ApiError({ code });

    expect(error).toMatchObject({
      name: "ApiError",
      code,
      status,
      message: code,
    });
  });
});

describe("apiErrorResponse", () => {
  it("序列化业务错误", async () => {
    const response = apiErrorResponse(
      new ApiError({ code: "NOT_FOUND", message: "资源不存在" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: "NOT_FOUND", message: "资源不存在" },
    });
  });

  it("序列化 Zod 校验错误", async () => {
    const schema = z.object({ id: z.string().min(1) });
    const result = schema.safeParse({ id: "" });

    expect(result.success).toBe(false);
    if (result.success) return;

    const response = apiErrorResponse(result.error);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: "BAD_REQUEST",
        message: "请求参数无效",
        issues: {
          fieldErrors: { id: expect.any(Array) },
        },
      },
    });
  });

  it("隐藏未知异常的内部信息并记录日志", async () => {
    const error = new Error("数据库密码不应返回给客户端");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const response = apiErrorResponse(error);

    expect(consoleError).toHaveBeenCalledWith("API request failed", error);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "服务器内部错误",
      },
    });

    consoleError.mockRestore();
  });
});

describe("withApiError", () => {
  it("返回处理器的正常响应", async () => {
    const expected = Response.json({ ok: true });

    await expect(withApiError(() => expected)).resolves.toBe(expected);
  });

  it("将处理器抛出的异常转换为响应", async () => {
    const response = await withApiError(() => {
      throw new ApiError({ code: "UNAUTHORIZED", message: "请登录" });
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: { code: "UNAUTHORIZED", message: "请登录" },
    });
  });
});
