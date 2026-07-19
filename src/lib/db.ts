import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@generated/prisma/client";

import { serverEnv } from "@/env";

const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (serverEnv.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
