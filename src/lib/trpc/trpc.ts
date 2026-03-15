/**
 * 你可能不需要编辑这个文件，除非：
 * 1. 你想修改请求上下文（参见第一部分）。
 * 2. 你想创建新的中间件或类型的程序（参见第三部分）。
 *
 * 简而言之 - 这是所有tRPC服务端代码创建和插入的地方。你需要使用的部分
 * 会在文档中相应位置详细说明。
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "@/lib/better-auth";
import { db } from "@/lib/db";

/**
 * 1. 上下文
 *
 * 这一节定义了后端API中可用的"上下文"。
 *
 * 这些允许你在处理请求时访问诸如数据库、会话等信息。
 *
 * 这个辅助函数为tRPC上下文生成"内部"函数。API处理程序和RSC客户端各自
 * 包装这个并提供所需的上下文。
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });
  return {
    db,
    session,
    ...opts,
  };
};

/**
 * 2. 初始化
 *
 * 这是tRPC API初始化的地方，连接上下文和转换器。我们还解析ZodError，
 * 以便在程序因后端验证错误而失败时，你可以在前端获得类型安全。
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 创建服务端调用程序。
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. 路由和程序（重要部分）
 *
 * 这些是你用来构建tRPC API的组件。你应该在"/src/server/api/routers"
 * 目录中大量导入这些。
 */

/**
 * 这是你在tRPC API中创建新路由和子路由的方式。
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * 用于计时程序执行并在开发中添加人为延迟的中间件。
 *
 * 如果你不喜欢它，可以删除它，但它可以帮助捕获不必要的瀑布式请求，
 * 模拟在生产中会发生但本地开发中不会发生的网络延迟。
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // 开发中的人为延迟
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} 执行耗时 ${end - start}ms`);

  return result;
});

/**
 * 公共（未认证）程序
 *
 * 这是你在tRPC API上构建新查询和mutation的基础组件。它不保证
 * 查询的用户已授权，但如果用户已登录，你仍然可以访问用户会话数据。
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * 受保护（已认证）程序
 *
 * 如果你希望查询或mutation只允许已登录的用户访问，请使用此方法。它验证
 * 会话是有效的，并保证 `ctx.session.user` 不为null。
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // 推断 `session` 为非空
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
