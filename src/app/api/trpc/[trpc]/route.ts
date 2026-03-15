import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/lib/trpc/trpc";

/**
 * 这个包装了 `createTRPCContext` 辅助函数，并在处理HTTP请求时提供
 * 所需的tRPC API上下文（例如当你从客户端组件发起请求时）。
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC 在 ${path ?? "<no-path>"} 上失败：${error.message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
