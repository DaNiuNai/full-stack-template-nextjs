"use client";

import { api } from "@/lib/trpc/client";
import Link from "next/link";
import { useState } from "react";

export default function TrpcClientPage() {
  // 客户端使用 tRPC hooks

  // 1. hello 接口 - 带输入参数
  const [inputText, setInputText] = useState("客户端渲染");
  const {
    data: helloData,
    isLoading: helloLoading,
    refetch: helloRefetch,
  } = api.user.hello.useQuery({ text: inputText });

  // 2. isLogged - 检查登录状态
  const { data: loginStatus, refetch: loginRefetch } =
    api.user.isLogged.useQuery();

  // 3. getById - 根据ID获取用户
  const [searchId, setSearchId] = useState("example-id");
  const { data: userById, refetch: userByIdRefetch } =
    api.user.getById.useQuery(
      { id: searchId },
      { enabled: searchId.length > 0 },
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
    },
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
    <main>
      <h1>tRPC Client</h1>
      <p>{"// 客户端渲染演示 //"}</p>

      <div>
        <h2>客户端使用 useQuery / useMutation</h2>

        {/* 示例 1: hello 接口 */}
        <div>
          <p>1. useQuery - hello (publicProcedure)</p>
          <div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入文字..."
            />
            <p>输出: {helloLoading ? "加载中..." : helloData?.greeting}</p>
            <button onClick={() => helloRefetch()}>重新获取</button>
          </div>
        </div>

        {/* 示例 2: isLogged 接口 */}
        <div>
          <p>2. useQuery - isLogged (publicProcedure)</p>
          <p>登录状态: {loginStatus?.status ? "已登录" : "未登录"}</p>
          <button onClick={() => loginRefetch()}>刷新</button>
        </div>

        {/* 示例 3: getById 接口 */}
        <div>
          <p>3. useQuery - getById (publicProcedure)</p>
          <div>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="输入用户ID..."
            />
            <p>
              输出:{" "}
              {userById
                ? `ID: ${userById.id}, Name: ${userById.name || "未设置"}`
                : "用户不存在"}
            </p>
            <button onClick={() => userByIdRefetch()}>查询</button>
          </div>
        </div>

        {/* 示例 4: getSecretMessage - 需要登录 */}
        <div>
          <p>4. useQuery - getSecretMessage (protectedProcedure)</p>
          {loginStatus?.status ? (
            <p>{secretMessage || "加载中..."}</p>
          ) : (
            <p>请先登录才能查看</p>
          )}
          <button
            onClick={() => secretRefetch()}
            disabled={!loginStatus?.status}
          >
            刷新
          </button>
        </div>

        {/* 示例 5: getInfo - 需要登录 */}
        {loginStatus?.status && (
          <div>
            <p>5. useQuery - getInfo (protectedProcedure)</p>
            {userInfo && (
              <div>
                <p>用户ID: {userInfo.id}</p>
                <p>用户名: {userInfo.name || "未设置"}</p>
                <p>邮箱: {userInfo.email}</p>
                <p>创建时间: {userInfo.createdAt.toLocaleString()}</p>
              </div>
            )}
            <button onClick={() => infoRefetch()}>刷新</button>
          </div>
        )}

        {/* 示例 6: updateName - useMutation */}
        {loginStatus?.status && (
          <div>
            <p>6. useMutation - updateName (protectedProcedure)</p>
            <div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="输入新用户名..."
                maxLength={50}
              />
              <button
                onClick={handleUpdateName}
                disabled={updateNameMutation.isPending || !newName.trim()}
              >
                {updateNameMutation.isPending ? "更新中..." : "更新用户名"}
              </button>
              {updateNameMutation.isPending && <p>更新中...</p>}
            </div>
          </div>
        )}

        {/* 刷新全部按钮 */}
        <button onClick={handleRefreshAll}>刷新全部数据</button>
      </div>

      <div>
        <Link href="/trpc-ssr">查看 SSR 示例</Link>
        <Link href="/">返回首页</Link>
      </div>
    </main>
  );
}
