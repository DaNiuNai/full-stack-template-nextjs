"use client";
import { api } from "@/lib/trpc/client";
import { authClient } from "@/lib/better-auth/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Root() {
  const router = useRouter();
  const meQuery = api.user.getInfo.useQuery(undefined, {
    enabled: false,
    retry: false,
  });
  const loginStatus = api.user.isLogged.useQuery(undefined, {
    enabled: false,
    retry: false,
  });
  const loginStatusRef = useRef(loginStatus);

  useEffect(() => {
    loginStatusRef.current.refetch();
  }, []);

  const handleLogout = () => {
    authClient.signOut();
    router.push("/login");
  };

  const handleGetInfo = async () => {
    const result = await meQuery.refetch();
    console.log(result.data);
  };

  return (
    <main className="acid-container">
      <h1 className="acid-title">
        NextJS
        <br />
        Template
      </h1>
      <p className="acid-subtitle">{"// 好奇心是指南针 //"}</p>
      {loginStatus.data?.status ? (
        <div className="btn-group">
          <button onClick={handleGetInfo} className="acid-btn">
            查询
          </button>
          <button onClick={handleLogout} className="acid-btn secondary">
            登出
          </button>
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
    </main>
  );
}
