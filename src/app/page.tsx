import { auth } from "@/lib/better-auth";
import Link from "next/link";
import { headers } from "next/headers";
import { UserMenu } from "@/components/user-menu";

export default async function Home() {
  // 获取当前请求的 session
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isLoggedIn = !!session?.user;
  return (
    <main>
      <h1>NextJS Template</h1>
      {isLoggedIn ? (
        <div>
          <UserMenu />
        </div>
      ) : (
        <div>
          {/* Next.js 内置路由组件 */}
          <Link href="/login">登录</Link>
          <Link href="/register">注册</Link>
        </div>
      )}
      <div>
        <Link href="/next-api-ssr">Next.js SSR 演示</Link>
        <Link href="/next-api-client">Next.js Client 演示</Link>
      </div>
    </main>
  );
}
