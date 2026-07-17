import Link from "next/link";
import { headers } from "next/headers";

import { getApiContextFromHeaders } from "@/lib/http/server";
import { userService } from "@/service/user";

export default async function NextApiSSRPage() {
  const requestHeaders = await headers();
  const ctx = await getApiContextFromHeaders(requestHeaders);
  const helloData = userService.getHello({ text: "服务端渲染" });
  const loginStatus = await userService.getLoginStatus(ctx);

  let userById: Awaited<ReturnType<typeof userService.getById>> | null = null;
  let userByIdError = false;
  try {
    userById = await userService.getById(ctx, { id: "example-id" });
  } catch {
    userByIdError = true;
  }

  let secretMessage: string | null = null;
  let userInfo: Awaited<ReturnType<typeof userService.getInfo>> | null = null;
  if (loginStatus.status) {
    try {
      secretMessage = await userService.getSecretMessage(ctx);
      userInfo = await userService.getInfo(ctx);
    } catch {
      // 登录状态变化时，受保护数据可能无法读取。
    }
  }

  return (
    <main>
      <h1>Next.js SSR</h1>
      <p>{"// 服务端渲染演示 //"}</p>

      <div>
        <h2>服务端直接调用后端函数</h2>

        <div>
          <p>1. GET /api/user/hello</p>
          <p>输入: &quot;服务端渲染&quot;</p>
          <p>输出: {helloData.greeting}</p>
        </div>

        <div>
          <p>2. GET /api/user/is-logged</p>
          <p>登录状态: {loginStatus.status ? "已登录" : "未登录"}</p>
        </div>

        <div>
          <p>3. GET /api/user/by-id</p>
          <p>输入: id = &quot;example-id&quot;</p>
          <p>
            输出:{" "}
            {userByIdError
              ? "用户不存在（预期行为）"
              : JSON.stringify(userById)}
          </p>
        </div>

        <div>
          <p>4. GET /api/user/secret-message (需要登录)</p>
          {loginStatus.status ? (
            <p>{secretMessage}</p>
          ) : (
            <p>未登录，无法访问</p>
          )}
        </div>

        {loginStatus.status && userInfo && (
          <div>
            <p>5. GET /api/user/me (需要登录)</p>
            <p>用户ID: {userInfo.id}</p>
            <p>用户名: {userInfo.name || "未设置"}</p>
            <p>邮箱: {userInfo.email}</p>
            <p>创建时间: {userInfo.createdAt.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div>
        <Link href="/next-api-client">查看客户端示例</Link>
        <Link href="/">返回首页</Link>
      </div>
    </main>
  );
}
