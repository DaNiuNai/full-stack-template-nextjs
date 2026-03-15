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
      <main className="acid-container">
        <h1 className="acid-title">tRPC SSR</h1>
        <p className="acid-subtitle">{"// 服务端渲染演示 //"}</p>

        <div className="acid-card" style={{ maxWidth: "600px" }}>
          <h2 style={{ color: "var(--acid-green)", marginBottom: "1.5rem" }}>
            服务端直接调用 tRPC
          </h2>

          {/* 示例 1: hello 接口 */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(204, 255, 0, 0.1)",
              borderRadius: "16px",
              border: "2px solid var(--acid-green)",
              marginBottom: "1rem",
            }}
          >
            <p style={{ color: "var(--acid-green)", fontWeight: "bold" }}>
              1. publicProcedure - hello
            </p>
            <p style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
              输入: &quot;服务端渲染&quot;
            </p>
            <p style={{ fontSize: "1.2rem" }}>输出: {helloData.greeting}</p>
          </div>

          {/* 示例 2: isLogged 接口 */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(0, 240, 255, 0.1)",
              borderRadius: "16px",
              border: "2px solid var(--acid-blue)",
              marginBottom: "1rem",
            }}
          >
            <p style={{ color: "var(--acid-blue)", fontWeight: "bold" }}>
              2. publicProcedure - isLogged
            </p>
            <p style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
              登录状态: {loginStatus.status ? "已登录" : "未登录"}
            </p>
          </div>

          {/* 示例 3: getById 接口 */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(138, 43, 226, 0.1)",
              borderRadius: "16px",
              border: "2px solid var(--acid-purple)",
              marginBottom: "1rem",
            }}
          >
            <p style={{ color: "var(--acid-purple)", fontWeight: "bold" }}>
              3. publicProcedure - getById
            </p>
            <p style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
              输入: id = &quot;example-id&quot;
            </p>
            <p style={{ fontSize: "1.2rem" }}>
              输出:{" "}
              {userByIdError
                ? "用户不存在（预期行为）"
                : JSON.stringify(userById)}
            </p>
          </div>

          {/* 示例 4: protectedProcedure - getSecretMessage */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(255, 0, 60, 0.1)",
              borderRadius: "16px",
              border: "2px solid var(--acid-pink)",
              marginBottom: "1rem",
            }}
          >
            <p style={{ color: "var(--acid-pink)", fontWeight: "bold" }}>
              4. protectedProcedure - getSecretMessage (需要登录)
            </p>
            {loginStatus.status ? (
              <p style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
                {secretMessage}
              </p>
            ) : (
              <p style={{ fontSize: "1.2rem", marginTop: "0.5rem", opacity: 0.7 }}>
                未登录，无法访问
              </p>
            )}
          </div>

          {/* 示例 5: protectedProcedure - getInfo */}
          {loginStatus.status && userInfo && (
            <div
              style={{
                padding: "1rem",
                background: "rgba(255, 0, 60, 0.1)",
                borderRadius: "16px",
                border: "2px solid var(--acid-pink)",
                marginBottom: "1rem",
              }}
            >
              <p style={{ color: "var(--acid-pink)", fontWeight: "bold" }}>
                5. protectedProcedure - getInfo (需要登录)
              </p>
              <p style={{ fontSize: "1rem", marginTop: "0.5rem" }}>
                用户ID: {userInfo.id}
              </p>
              <p style={{ fontSize: "1rem" }}>用户名: {userInfo.name || "未设置"}</p>
              <p style={{ fontSize: "1rem" }}>邮箱: {userInfo.email}</p>
              <p style={{ fontSize: "1rem" }}>
                创建时间: {userInfo.createdAt.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="btn-group" style={{ marginTop: "2rem" }}>
          <Link href="/trpc-client" className="acid-btn secondary">
            查看客户端示例
          </Link>
          <Link href="/" className="acid-btn">
            返回首页
          </Link>
        </div>
      </main>
    </HydrateClient>
  );
}