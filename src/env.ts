import { z } from "zod";

const requiredStringEnv = z.string().trim().min(1);
const optionalStringEnv = z.string().trim().optional();
const nodeEnv = z
  .enum(["development", "test", "production"])
  .default("development");

type ServerEnv = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  NODE_ENV: "development" | "test" | "production";
};

type TestEnv = {
  TEST_DATABASE_URL?: string;
};

export const serverEnv: ServerEnv = {
  get DATABASE_URL() {
    return requiredStringEnv.parse(process.env.DATABASE_URL);
  },
  get BETTER_AUTH_SECRET() {
    return requiredStringEnv.parse(process.env.BETTER_AUTH_SECRET);
  },
  get BETTER_AUTH_URL() {
    return requiredStringEnv.parse(process.env.BETTER_AUTH_URL);
  },
  get NODE_ENV() {
    return nodeEnv.parse(process.env.NODE_ENV);
  },
};

export const testEnv: TestEnv = {
  get TEST_DATABASE_URL() {
    return optionalStringEnv.parse(process.env.TEST_DATABASE_URL);
  },
};
