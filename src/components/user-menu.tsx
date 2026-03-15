"use client";

import { api } from "@/lib/trpc/client";
import { authClient } from "@/lib/better-auth/client";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const router = useRouter();
  const meQuery = api.user.getInfo.useQuery(undefined, {
    enabled: false,
    retry: false,
  });

  const handleLogout = () => {
    authClient.signOut();
    router.push("/login");
  };

  const handleGetInfo = async () => {
    const result = await meQuery.refetch();
    console.log(result.data);
  };

  return (
    <>
      <button onClick={handleGetInfo} className="acid-btn">
        查询
      </button>
      <button onClick={handleLogout} className="acid-btn secondary">
        登出
      </button>
    </>
  );
}
