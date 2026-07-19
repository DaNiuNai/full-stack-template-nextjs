import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { serverEnv } from "@/env";
import { db } from "@/lib/db";

export const auth = betterAuth({
  baseURL: serverEnv.BETTER_AUTH_URL,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: serverEnv.BETTER_AUTH_SECRET,
});

export type Session = typeof auth.$Infer.Session;
