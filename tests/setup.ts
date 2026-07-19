import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";

import { Client } from "pg";

import { testEnv } from "@/env";

const execFileAsync = promisify(execFile);
const temporaryDatabaseMarker = "_vitest_";

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function createDatabaseName(baseUrl: URL) {
  const baseName = decodeURIComponent(baseUrl.pathname.slice(1)) || "app_test";
  const prefix = baseName.toLowerCase().replaceAll(/[^a-z0-9_]/g, "_");
  const suffix = `${Date.now()}_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;

  return `${prefix}${temporaryDatabaseMarker}${suffix}`.slice(0, 63);
}

async function dropDatabase(connectionString: string, databaseName: string) {
  if (!databaseName.includes(temporaryDatabaseMarker)) {
    throw new Error(`拒绝删除非 Vitest 临时数据库：${databaseName}`);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
      [databaseName],
    );
    await client.query(
      `DROP DATABASE IF EXISTS ${quoteIdentifier(databaseName)}`,
    );
  } finally {
    await client.end();
  }
}

export default async function setup() {
  const testDatabaseUrl = testEnv.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error(
      "运行集成测试前必须设置 TEST_DATABASE_URL（它应指向具有创建数据库权限的 PostgreSQL 实例）",
    );
  }

  const baseUrl = new URL(testDatabaseUrl);
  if (!new Set(["postgres:", "postgresql:"]).has(baseUrl.protocol)) {
    throw new Error("TEST_DATABASE_URL 必须是 PostgreSQL 连接地址");
  }

  const maintenanceUrl = new URL(baseUrl);
  maintenanceUrl.pathname = "/postgres";
  const databaseName = createDatabaseName(baseUrl);
  const temporaryUrl = new URL(baseUrl);
  temporaryUrl.pathname = `/${databaseName}`;

  const client = new Client({ connectionString: maintenanceUrl.toString() });
  await client.connect();

  try {
    await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
  } finally {
    await client.end();
  }

  try {
    process.env.DATABASE_URL = temporaryUrl.toString();
    process.env.BETTER_AUTH_SECRET =
      "vitest-only-secret-at-least-32-characters-long";
    process.env.BETTER_AUTH_URL = "http://localhost:3000";

    const prismaCli = resolve(
      process.cwd(),
      "node_modules/prisma/build/index.js",
    );
    await execFileAsync(process.execPath, [prismaCli, "db", "push"], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: temporaryUrl.toString() },
      windowsHide: true,
    });
    await execFileAsync(process.execPath, [prismaCli, "generate"], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: temporaryUrl.toString() },
      windowsHide: true,
    });
  } catch (error) {
    await dropDatabase(maintenanceUrl.toString(), databaseName);
    throw error;
  }

  return async () => {
    await dropDatabase(maintenanceUrl.toString(), databaseName);
  };
}
