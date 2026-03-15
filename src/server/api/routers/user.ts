import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/lib/trpc/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  // 演示公开的API
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `你好 ${input.text}`,
      };
    }),

  // 演示需要登录才能访问的 API
  getSecretMessage: protectedProcedure.query(() => {
    return "你可以看到这条秘密信息了！";
  }),

  // 获取用户信息
  getInfo: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
    }

    return user;
  }),

  // 根据 ID 获取用户基础信息
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) })) // 用 zod 校验输入
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: { id: true, name: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
      }

      return user;
    }),

  // 更新当前用户名
  updateName: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { name: input.name },
      });

      return updated;
    }),

  // 用户是否已登录的简单查询（不需要登录）
  isLogged: publicProcedure.query(async ({ ctx }) => {
    if (ctx.session?.user) {
      return { status: true };
    }
    return { status: false };
  }),
});
