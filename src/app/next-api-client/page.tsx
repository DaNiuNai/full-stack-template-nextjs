"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  type CurrentUserData,
  type LoginStatusData,
  type SecretMessageData,
  type UserByIdData,
  fetchCurrentUser,
  fetchHello,
  fetchLoginStatus,
  fetchSecretMessage,
  fetchUserById,
  updateCurrentUserName,
} from "@/lib/user-api-client";

export default function NextApiClientPage() {
  const [inputText, setInputText] = useState("客户端渲染");
  const [helloData, setHelloData] = useState<string | null>(null);
  const [helloLoading, setHelloLoading] = useState(false);

  const [loginStatus, setLoginStatus] = useState<LoginStatusData | null>(null);
  const [searchId, setSearchId] = useState("example-id");
  const [userById, setUserById] = useState<UserByIdData | null>(null);
  const [userByIdError, setUserByIdError] = useState<string | null>(null);

  const [secretMessage, setSecretMessage] = useState<SecretMessageData | null>(
    null,
  );
  const [userInfo, setUserInfo] = useState<CurrentUserData | null>(null);
  const [newName, setNewName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const loadHello = useCallback(async () => {
    setHelloLoading(true);
    try {
      const data = await fetchHello(inputText);
      setHelloData(data.greeting);
    } catch (error) {
      setHelloData(error instanceof Error ? error.message : "请求失败");
    } finally {
      setHelloLoading(false);
    }
  }, [inputText]);

  const loadLoginStatus = useCallback(async () => {
    const data = await fetchLoginStatus();
    setLoginStatus(data);
    return data;
  }, []);

  const loadUserById = useCallback(async () => {
    if (!searchId.trim()) {
      setUserById(null);
      setUserByIdError("请输入用户 ID");
      return;
    }

    try {
      const data = await fetchUserById(searchId.trim());
      setUserById(data);
      setUserByIdError(null);
    } catch (error) {
      setUserById(null);
      setUserByIdError(error instanceof Error ? error.message : "用户不存在");
    }
  }, [searchId]);

  const loadSecretMessage = useCallback(async () => {
    try {
      setSecretMessage(await fetchSecretMessage());
    } catch {
      setSecretMessage(null);
    }
  }, []);

  const loadUserInfo = useCallback(async () => {
    try {
      setUserInfo(await fetchCurrentUser());
    } catch {
      setUserInfo(null);
    }
  }, []);

  useEffect(() => {
    void loadHello();
  }, [loadHello]);

  useEffect(() => {
    void loadLoginStatus();
  }, [loadLoginStatus]);

  useEffect(() => {
    void loadUserById();
  }, [loadUserById]);

  useEffect(() => {
    if (loginStatus?.status) {
      void loadSecretMessage();
      void loadUserInfo();
    } else {
      setSecretMessage(null);
      setUserInfo(null);
    }
  }, [loadSecretMessage, loadUserInfo, loginStatus?.status]);

  const handleUpdateName = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    setUpdateLoading(true);
    try {
      await updateCurrentUserName(trimmedName);
      await loadUserInfo();
      setNewName("");
      alert("用户名更新成功！");
    } catch (error) {
      alert(`更新失败: ${error instanceof Error ? error.message : "请求失败"}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    const status = await loadLoginStatus();
    await Promise.all([loadHello(), loadUserById()]);
    if (status.status) {
      await Promise.all([loadSecretMessage(), loadUserInfo()]);
    }
  };

  return (
    <main>
      <h1>Next.js Client</h1>
      <p>{"// 客户端渲染演示 //"}</p>

      <div>
        <h2>客户端使用 fetch 调用 Route Handlers</h2>

        <div>
          <p>1. GET /api/user/hello</p>
          <div>
            <input
              type="text"
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="输入文字..."
            />
            <p>输出: {helloLoading ? "加载中..." : helloData}</p>
            <button onClick={() => loadHello()}>重新获取</button>
          </div>
        </div>

        <div>
          <p>2. GET /api/user/is-logged</p>
          <p>登录状态: {loginStatus?.status ? "已登录" : "未登录"}</p>
          <button onClick={() => loadLoginStatus()}>刷新</button>
        </div>

        <div>
          <p>3. GET /api/user/by-id</p>
          <div>
            <input
              type="text"
              value={searchId}
              onChange={(event) => setSearchId(event.target.value)}
              placeholder="输入用户ID..."
            />
            <p>
              输出:{" "}
              {userById
                ? `ID: ${userById.id}, Name: ${userById.name || "未设置"}`
                : userByIdError || "用户不存在"}
            </p>
            <button onClick={() => loadUserById()}>查询</button>
          </div>
        </div>

        <div>
          <p>4. GET /api/user/secret-message (需要登录)</p>
          {loginStatus?.status ? (
            <p>{secretMessage?.message || "加载中..."}</p>
          ) : (
            <p>请先登录才能查看</p>
          )}
          <button
            onClick={() => loadSecretMessage()}
            disabled={!loginStatus?.status}
          >
            刷新
          </button>
        </div>

        {loginStatus?.status && (
          <div>
            <p>5. GET /api/user/me (需要登录)</p>
            {userInfo && (
              <div>
                <p>用户ID: {userInfo.id}</p>
                <p>用户名: {userInfo.name || "未设置"}</p>
                <p>邮箱: {userInfo.email}</p>
                <p>创建时间: {new Date(userInfo.createdAt).toLocaleString()}</p>
              </div>
            )}
            <button onClick={() => loadUserInfo()}>刷新</button>
          </div>
        )}

        {loginStatus?.status && (
          <div>
            <p>6. POST /api/user/update-name (需要登录)</p>
            <div>
              <input
                type="text"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="输入新用户名..."
                maxLength={50}
              />
              <button
                onClick={handleUpdateName}
                disabled={updateLoading || !newName.trim()}
              >
                {updateLoading ? "更新中..." : "更新用户名"}
              </button>
              {updateLoading && <p>更新中...</p>}
            </div>
          </div>
        )}

        <button onClick={handleRefreshAll}>刷新全部数据</button>
      </div>

      <div>
        <Link href="/next-api-ssr">查看 SSR 示例</Link>
        <Link href="/">返回首页</Link>
      </div>
    </main>
  );
}
