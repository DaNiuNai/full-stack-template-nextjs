import { api, HydrateClient } from "@/lib/trpc/server";
import Link from "next/link";

export default async function TrpcSSRPage() {
  // 服务端直接调用 tRPC
  // 这会在服务器渲染时执行

  // 1. 公开的 hello 接口
  const helloData = await api.user.hello({ text: "服务端渲染" });

  // 2. 公开的登录状态检查
  const loginStatus = await api.user.isLogged();

  // 3. 公开的根据ID获取用户 (使用一个示例ID)
  let userById: { id: string; name: string | null } | null = null;
  let userByIdError = false;
  try {
    userById = await api.user.getById({ id: "example-id" });
  } catch {
    // 用户不存在是正常的
    userByIdError = true;
  }

  // 4. 需要登录的接口 (如果已登录)
  let secretMessage = null;
  let userInfo = null;
  if (loginStatus.status) {
    try {
      secretMessage = await api.user.getSecretMessage();
      userInfo = await api.user.getInfo();
    } catch {
      // 未登录时无法访问
    }
  }

  return (
    <HydrateClient>
      <main>
        <h1>tRPC SSR</h1>
        <p>{"// 服务端渲染演示 //"}</p>

        <div>
          <h2>服务端直接调用 tRPC</h2>
          {/* 示例 1: hello 接口 */}

          <div>
            <p>1. publicProcedure - hello</p>
            <p>输入: &quot;服务端渲染&quot;</p>
            <p>输出: {helloData.greeting}</p>
          </div>

          {/* 示例 2: isLogged 接口 */}
          <div>
            <p>2. publicProcedure - isLogged</p>
            <p>登录状态: {loginStatus.status ? "已登录" : "未登录"}</p>
          </div>

          {/* 示例 3: getById 接口 */}
          <div>
            <p>3. publicProcedure - getById</p>
            <p>输入: id = &quot;example-id&quot;</p>
            <p>
              输出:{" "}
              {userByIdError
                ? "用户不存在（预期行为）"
                : JSON.stringify(userById)}
            </p>
          </div>

          {/* 示例 4: protectedProcedure - getSecretMessage */}
          <div>
            <p>4. protectedProcedure - getSecretMessage (需要登录)</p>
            {loginStatus.status ? (
              <p>{secretMessage}</p>
            ) : (
              <p>未登录，无法访问</p>
            )}
          </div>

          {/* 示例 5: protectedProcedure - getInfo */}
          {loginStatus.status && userInfo && (
            <div>
              <p>5. protectedProcedure - getInfo (需要登录)</p>
              <p>用户ID: {userInfo.id}</p>
              <p>用户名: {userInfo.name || "未设置"}</p>
              <p>邮箱: {userInfo.email}</p>
              <p>创建时间: {userInfo.createdAt.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div>
          <Link href="/trpc-client">查看客户端示例</Link>
          <Link href="/">返回首页</Link>
        </div>
      </main>
    </HydrateClient>
  );
}
