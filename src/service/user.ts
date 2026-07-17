import { z } from "zod";

import { ApiError } from "@/lib/http/errors";
import type { ApiContext } from "@/lib/http/server";
import { requireUser } from "@/lib/http/server";

export const helloInput = z.object({ text: z.string().default("") });
export const userByIdInput = z.object({ id: z.string().min(1) });
export const updateNameInput = z.object({
  name: z.string().min(1).max(50),
});

export const userService = {
  getHello(input: z.infer<typeof helloInput>) {
    return {
      greeting: `你好 ${input.text}`,
    };
  },

  getLoginStatus(ctx: ApiContext) {
    return {
      status: !!ctx.session?.user,
    };
  },

  async getById(ctx: ApiContext, input: z.infer<typeof userByIdInput>) {
    const user = await ctx.db.user.findUnique({
      where: { id: input.id },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new ApiError({ code: "NOT_FOUND", message: "用户不存在" });
    }

    return user;
  },

  async getInfo(ctx: ApiContext) {
    const session = requireUser(ctx);
    const user = await ctx.db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      throw new ApiError({ code: "NOT_FOUND", message: "用户不存在" });
    }

    return user;
  },

  getSecretMessage(ctx: ApiContext) {
    requireUser(ctx);

    return "你可以看到这条秘密信息了！";
  },

  async updateName(ctx: ApiContext, input: z.infer<typeof updateNameInput>) {
    const session = requireUser(ctx);

    return ctx.db.user.update({
      where: { id: session.user.id },
      data: { name: input.name },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  },
};
