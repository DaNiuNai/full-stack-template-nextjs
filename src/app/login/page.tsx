"use client";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/better-auth/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });
    if (error) console.error("登录失败", error);
    else {
      console.log("登录成功", data);
      router.push("/");
    }
  };
  return (
    <main>
      <div>
        <h2>登录</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="邮箱"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="密码"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">登录账号</button>
        </form>

        <div>
          <Link href="/">&lt;&lt; 返回主页</Link>
        </div>
      </div>
    </main>
  );
}
