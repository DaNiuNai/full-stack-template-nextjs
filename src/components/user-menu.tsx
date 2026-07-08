"use client";

import { authClient } from "@/lib/better-auth/client";
import { fetchCurrentUser } from "@/lib/user-api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    authClient.signOut();
    router.push("/login");
  };

  const handleGetInfo = async () => {
    setLoading(true);
    try {
      console.log(await fetchCurrentUser());
    } catch (error) {
      console.error("查询用户信息失败", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleGetInfo} disabled={loading}>
        {loading ? "查询中..." : "查询"}
      </button>
      <button onClick={handleLogout}>登出</button>
    </>
  );
}
