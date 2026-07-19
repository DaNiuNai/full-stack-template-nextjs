const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/http/server", () => ({
  requireUser: mocks.requireUser,
}));

import { ApiError } from "@/lib/http/errors";
import type { ApiContext } from "@/lib/http/server";
import {
  helloInput,
  updateNameInput,
  userByIdInput,
  userService,
} from "@/service/user";

const findUnique = vi.fn();
const update = vi.fn();

function createContext(userId?: string) {
  const session = userId ? { user: { id: userId } } : null;

  return {
    db: { user: { findUnique, update } },
    session,
    headers: new Headers(),
  } as unknown as ApiContext;
}

describe("用户输入校验", () => {
  it("为问候语提供空字符串默认值", () => {
    expect(helloInput.parse({})).toEqual({ text: "" });
  });

  it("要求非空用户 ID", () => {
    expect(() => userByIdInput.parse({ id: "" })).toThrow();
  });

  it.each(["", "a".repeat(51)])("拒绝无效名字 %j", (name) => {
    expect(() => updateNameInput.parse({ name })).toThrow();
  });
});

describe("userService", () => {
  beforeEach(() => {
    findUnique.mockReset();
    update.mockReset();
    mocks.requireUser.mockReset();
    mocks.requireUser.mockImplementation((context: ApiContext) => {
      if (!context.session?.user) {
        throw new ApiError({ code: "UNAUTHORIZED", message: "请先登录" });
      }

      return context.session;
    });
  });

  it("生成问候语", () => {
    expect(userService.getHello({ text: "小明" })).toEqual({
      greeting: "你好 小明",
    });
  });

  it.each([
    [createContext(), false],
    [createContext("user-1"), true],
  ])("返回登录状态", (context, status) => {
    expect(userService.getLoginStatus(context)).toEqual({ status });
  });

  it("按 ID 返回公开用户信息", async () => {
    const user = { id: "user-1", name: "测试用户" };
    findUnique.mockResolvedValue(user);
    const context = createContext();

    await expect(userService.getById(context, { id: "user-1" })).resolves.toBe(
      user,
    );
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { id: true, name: true },
    });
  });

  it("找不到指定用户时抛出 NOT_FOUND", async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      userService.getById(createContext(), { id: "missing" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
      message: "用户不存在",
    });
  });

  it("返回当前用户完整信息", async () => {
    const user = {
      id: "user-1",
      name: "测试用户",
      email: "test@example.com",
      createdAt: new Date(),
    };
    findUnique.mockResolvedValue(user);
    const context = createContext("user-1");

    await expect(userService.getInfo(context)).resolves.toBe(user);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  });

  it("当前用户已被删除时抛出 NOT_FOUND", async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      userService.getInfo(createContext("deleted")),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });

  it("拒绝未登录用户读取个人信息", async () => {
    await expect(userService.getInfo(createContext())).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("仅向已登录用户返回秘密消息", () => {
    expect(userService.getSecretMessage(createContext("user-1"))).toBe(
      "你可以看到这条秘密信息了！",
    );
    expect(() => userService.getSecretMessage(createContext())).toThrowError(
      expect.objectContaining({ code: "UNAUTHORIZED" }),
    );
  });

  it("更新当前用户名字并限制返回字段", async () => {
    const updatedUser = {
      id: "user-1",
      name: "新名字",
      email: "test@example.com",
      createdAt: new Date(),
    };
    update.mockResolvedValue(updatedUser);
    const context = createContext("user-1");

    await expect(
      userService.updateName(context, { name: "新名字" }),
    ).resolves.toBe(updatedUser);
    expect(update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "新名字" },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  });

  it("拒绝未登录用户更新名字", async () => {
    await expect(
      userService.updateName(createContext(), { name: "新名字" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED", status: 401 });
    expect(update).not.toHaveBeenCalled();
  });
});
