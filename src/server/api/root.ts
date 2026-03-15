import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/lib/trpc/trpc";

/**
 * 这是你的服务器的主路由。
 *
 * 在 /api/routers 中添加的所有路由都应手动添加到这里。
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
});

// 导出API的类型定义
export type AppRouter = typeof appRouter;

/**
 * 为tRPC API创建服务端调用程序。
 * @例子
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
