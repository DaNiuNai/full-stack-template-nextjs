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
    <main className="acid-container">
      <div className="acid-card">
        <h2 className="form-title">登录</h2>

        {/* 仅作样式展示，未绑定实际 API 提交逻辑 */}
        <form className="acid-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="邮箱"
            className="acid-input"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="密码"
            className="acid-input"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="acid-btn"
            style={{ width: "100%", marginTop: "1rem" }}
          >
            登录账号
          </button>
        </form>

        <div
          style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem" }}
        >
          <Link
            href="/"
            style={{ color: "var(--acid-blue)", textDecoration: "none" }}
          >
            &lt;&lt; 返回主页
          </Link>
        </div>
      </div>
    </main>
  );
}
