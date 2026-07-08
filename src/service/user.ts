import "server-only";

import { auth } from "@/lib/better-auth";
import { db } from "@/lib/db";
import { z } from "zod";

const userIdSchema = z.string().min(1);
const updateNameSchema = z.object({
  name: z.string().min(1).max(50),
});

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getHello(text: string) {
  return {
    greeting: `你好 ${text}`,
  };
}

export async function getLoginStatus(headers: Headers) {
  const session = await auth.api.getSession({ headers });

  return {
    status: !!session?.user,
  };
}

export async function getUserById(id: string) {
  const userId = userIdSchema.parse(id);
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });

  if (!user) {
    throw new ApiError(404, "用户不存在");
  }

  return user;
}

export async function getCurrentUser(headers: Headers) {
  const currentUser = await requireUser(headers);
  const user = await db.user.findUnique({
    where: { id: currentUser.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    throw new ApiError(404, "用户不存在");
  }

  return user;
}

export async function getSecretMessage(headers: Headers) {
  await requireUser(headers);

  return "你可以看到这条秘密信息了！";
}

export async function updateCurrentUserName(headers: Headers, input: unknown) {
  const currentUser = await requireUser(headers);
  const { name } = updateNameSchema.parse(input);

  return db.user.update({
    where: { id: currentUser.id },
    data: { name },
    select: { id: true, name: true, email: true, createdAt: true },
  });
}

async function requireUser(headers: Headers) {
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    throw new ApiError(401, "请先登录");
  }

  return session.user;
}
