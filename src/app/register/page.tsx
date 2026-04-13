"use client";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/better-auth/client";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    if (error) console.error("注册失败", error);
    else {
      console.log("注册成功", data);
      router.push("/");
    }
  };
  return (
    <main>
      <div>
        <h2>注册</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="用户名 //"
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="邮箱 //"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="密码 //"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* 使用次要配色按钮保持视觉差异 */}
          <button type="submit">创建账号</button>
        </form>

        <div>
          <Link href="/">&lt;&lt; 返回主页</Link>
        </div>
      </div>
    </main>
  );
}
