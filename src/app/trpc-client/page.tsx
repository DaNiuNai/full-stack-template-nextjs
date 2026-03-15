"use client";

import { api } from "@/lib/trpc/client";
import Link from "next/link";
import { useState } from "react";

export default function TrpcClientPage() {
  // 客户端使用 tRPC hooks

  // 1. hello 接口 - 带输入参数
  const [inputText, setInputText] = useState("客户端渲染");
  const { data: helloData, isLoading: helloLoading, refetch: helloRefetch } =
    api.user.hello.useQuery({ text: inputText });

  // 2. isLogged - 检查登录状态
  const { data: loginStatus, refetch: loginRefetch } = api.user.isLogged.useQuery();

  // 3. getById - 根据ID获取用户
  const [searchId, setSearchId] = useState("example-id");
  const { data: userById, refetch: userByIdRefetch } = api.user.getById.useQuery(
    { id: searchId },
    { enabled: searchId.length > 0 }
  );

  // 4. getSecretMessage - 需要登录
  const { data: secretMessage, refetch: secretRefetch } =
    api.user.getSecretMessage.useQuery(undefined, {
      enabled: loginStatus?.status === true,
    });

  // 5. getInfo - 需要登录，获取当前用户信息
  const { data: userInfo, refetch: infoRefetch } = api.user.getInfo.useQuery(
    undefined,
    {
      enabled: loginStatus?.status === true,
    }
  );

  // 6. updateName - 使用 useMutation 修改用户名
  const [newName, setNewName] = useState("");
  const updateNameMutation = api.user.updateName.useMutation({
    onSuccess: () => {
      infoRefetch();
      setNewName("");
      alert("用户名更新成功！");
    },
    onError: (error) => {
      alert(`更新失败: ${error.message}`);
    },
  });

  const handleUpdateName = () => {
    if (newName.trim()) {
      updateNameMutation.mutate({ name: newName.trim() });
    }
  };

  const handleRefreshAll = () => {
    helloRefetch();
    loginRefetch();
    userByIdRefetch();
    secretRefetch();
    infoRefetch();
  };

  return (
    <main className="acid-container">
      <h1 className="acid-title">tRPC Client</h1>
      <p className="acid-subtitle">{"// 客户端渲染演示 //"}</p>

      <div className="acid-card" style={{ maxWidth: "600px" }}>
        <h2 style={{ color: "var(--acid-pink)", marginBottom: "1.5rem" }}>
          客户端使用 useQuery / useMutation
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
            1. useQuery - hello (publicProcedure)
          </p>
          <div style={{ marginTop: "0.5rem" }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="acid-input"
              placeholder="输入文字..."
              style={{ marginBottom: "0.5rem" }}
            />
            <p style={{ fontSize: "1.2rem" }}>
              输出: {helloLoading ? "加载中..." : helloData?.greeting}
            </p>
            <button onClick={() => helloRefetch()} className="acid-btn" style={{ marginTop: "0.5rem", padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}>
              重新获取
            </button>
          </div>
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
            2. useQuery - isLogged (publicProcedure)
          </p>
          <p style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
            登录状态: {loginStatus?.status ? "已登录" : "未登录"}
          </p>
          <button onClick={() => loginRefetch()} className="acid-btn secondary" style={{ marginTop: "0.5rem", padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}>
            刷新
          </button>
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
            3. useQuery - getById (publicProcedure)
          </p>
          <div style={{ marginTop: "0.5rem" }}>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="acid-input"
              placeholder="输入用户ID..."
              style={{ marginBottom: "0.5rem" }}
            />
            <p style={{ fontSize: "1rem" }}>
              输出:{" "}
              {userById
                ? `ID: ${userById.id}, Name: ${userById.name || "未设置"}`
                : "用户不存在"}
            </p>
            <button onClick={() => userByIdRefetch()} className="acid-btn" style={{ marginTop: "0.5rem", padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}>
              查询
            </button>
          </div>
        </div>

        {/* 示例 4: getSecretMessage - 需要登录 */}
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
            4. useQuery - getSecretMessage (protectedProcedure)
          </p>
          {loginStatus?.status ? (
            <p style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
              {secretMessage || "加载中..."}
            </p>
          ) : (
            <p style={{ fontSize: "1rem", marginTop: "0.5rem", opacity: 0.7 }}>
              请先登录才能查看
            </p>
          )}
          <button
            onClick={() => secretRefetch()}
            className="acid-btn secondary"
            style={{ marginTop: "0.5rem", padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}
            disabled={!loginStatus?.status}
          >
            刷新
          </button>
        </div>

        {/* 示例 5: getInfo - 需要登录 */}
        {loginStatus?.status && (
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
              5. useQuery - getInfo (protectedProcedure)
            </p>
            {userInfo && (
              <div style={{ marginTop: "0.5rem" }}>
                <p style={{ fontSize: "1rem" }}>用户ID: {userInfo.id}</p>
                <p style={{ fontSize: "1rem" }}>
                  用户名: {userInfo.name || "未设置"}
                </p>
                <p style={{ fontSize: "1rem" }}>邮箱: {userInfo.email}</p>
                <p style={{ fontSize: "1rem" }}>
                  创建时间: {userInfo.createdAt.toLocaleString()}
                </p>
              </div>
            )}
            <button
              onClick={() => infoRefetch()}
              className="acid-btn secondary"
              style={{ marginTop: "0.5rem", padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}
            >
              刷新
            </button>
          </div>
        )}

        {/* 示例 6: updateName - useMutation */}
        {loginStatus?.status && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(255, 165, 0, 0.1)",
              borderRadius: "16px",
              border: "2px solid orange",
              marginBottom: "1rem",
            }}
          >
            <p style={{ color: "orange", fontWeight: "bold" }}>
              6. useMutation - updateName (protectedProcedure)
            </p>
            <div style={{ marginTop: "0.5rem" }}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="acid-input"
                placeholder="输入新用户名..."
                style={{ marginBottom: "0.5rem" }}
                maxLength={50}
              />
              <button
                onClick={handleUpdateName}
                className="acid-btn"
                style={{ marginTop: "0.5rem", padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}
                disabled={updateNameMutation.isPending || !newName.trim()}
              >
                {updateNameMutation.isPending ? "更新中..." : "更新用户名"}
              </button>
              {updateNameMutation.isPending && (
                <p style={{ marginTop: "0.5rem", opacity: 0.7 }}>更新中...</p>
              )}
            </div>
          </div>
        )}

        {/* 刷新全部按钮 */}
        <button
          onClick={handleRefreshAll}
          className="acid-btn secondary"
          style={{ width: "100%", marginTop: "1rem" }}
        >
          刷新全部数据
        </button>
      </div>

      <div className="btn-group" style={{ marginTop: "2rem" }}>
        <Link href="/trpc-ssr" className="acid-btn secondary">
          查看 SSR 示例
        </Link>
        <Link href="/" className="acid-btn">
          返回首页
        </Link>
      </div>
    </main>
  );
}