import { auth } from "@/lib/better-auth";
import Link from "next/link";
import { headers } from "next/headers";
import { UserMenu } from "@/components/user-menu";

export default async function Root() {
  // 获取当前请求的 session
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isLoggedIn = !!session?.user;
  return (
    <main className="acid-container">
      <h1 className="acid-title">
        NextJS
        <br />
        Template
      </h1>
      <p className="acid-subtitle">{"// 好奇心是指南针 //"}</p>
      {isLoggedIn ? (
        <div className="btn-group">
          <UserMenu />
        </div>
      ) : (
        <div className="btn-group">
          {/* Next.js 内置路由组件 */}
          <Link href="/login" className="acid-btn">
            登录
          </Link>
          <Link href="/register" className="acid-btn secondary">
            注册
          </Link>
        </div>
      )}
      <div className="btn-group" style={{ marginTop: "2rem" }}>
        <Link href="/trpc-ssr" className="acid-btn secondary">
          tRPC SSR 演示
        </Link>
        <Link href="/trpc-client" className="acid-btn">
          tRPC Client 演示
        </Link>
      </div>
    </main>
  );
}
