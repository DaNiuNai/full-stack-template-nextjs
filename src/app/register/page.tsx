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
    <main className="acid-container">
      <div
        className="acid-card"
        style={{ boxShadow: "8px 8px 0px var(--acid-blue)" }}
      >
        <h2 className="form-title" style={{ color: "var(--acid-pink)" }}>
          注册
        </h2>

        <form className="acid-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="用户名 //"
            className="acid-input"
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="邮箱 //"
            className="acid-input"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="密码 //"
            className="acid-input"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* 使用次要配色按钮保持视觉差异 */}
          <button
            type="submit"
            className="acid-btn secondary"
            style={{ width: "100%", marginTop: "1rem" }}
          >
            创建账号
          </button>
        </form>

        <div
          style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem" }}
        >
          <Link
            href="/"
            style={{ color: "var(--acid-green)", textDecoration: "none" }}
          >
            &lt;&lt; 返回主页
          </Link>
        </div>
      </div>
    </main>
  );
}
