# Full-Stack Template Next.js

一个开箱即用的全栈 Next.js 项目模板，集成了 tRPC、Better Auth、Prisma 和 PostgreSQL。

## 技术栈

| 技术        | 版本    | 说明              |
| ----------- | ------- | ----------------- |
| Next.js     | 16.1.6  | React 全栈框架    |
| tRPC        | 11.11.0 | 类型安全的 API 层 |
| Better Auth | 1.4.20  | 现代身份认证方案  |
| Prisma      | 7.4.2   | TypeScript ORM    |
| PostgreSQL  | -       | 关系型数据库      |
| React Query | 5.90.21 | 服务端状态管理    |
| Zod         | 4.3.6   | Schema 校验       |

## 功能特性

- **类型安全的 API** - tRPC 提供端到端的类型安全
- **SSR & CSR** - 支持服务端渲染和客户端渲染
- **用户认证** - 内置登录、注册、会话管理
- **数据库集成** - Prisma + PostgreSQL 完整配置

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd full-stack-template-nextjs
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

**生成 BETTER_AUTH_SECRET：**

```bash
# 使用 openssl (Linux/Mac)
cat /dev/urandom | tr -dc 'A-Za-z0-9' | head -c 64; echo

# 使用 PowerShell (Windows)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 4. 初始化数据库

```bash
# 推送 schema 到数据库
pnpm dlx prisma db push

# 生成 Prisma Client
pnpm dlx prisma generate
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/                      # Next.js App Router
│   ├── api/
│   │   ├── auth/[...all]/  # Better Auth API 路由
│   │   └── trpc/[trpc]/    # tRPC API 处理器
│   ├── login/               # 登录页面
│   ├── register/            # 注册页面
│   ├── trpc-ssr/           # SSR 示例页面
│   ├── trpc-client/        # CSR 示例页面
│   ├── layout.tsx          # 根布局 (含 Providers)
│   └── page.tsx            # 首页
├── components/              # React 组件
│   └── user-menu.tsx       # 用户菜单组件
├── lib/
│   ├── better-auth/        # 认证配置
│   │   ├── client.ts       # 客户端认证
│   │   ├── config.ts       # 认证配置
│   │   ├── index.ts        # 认证实例
│   │   └── server.ts       # 服务端会话辅助
│   ├── trpc/              # tRPC 配置
│   │   ├── client.tsx      # 客户端 Provider & Hooks
│   │   ├── query-client.ts # React Query 配置
│   │   ├── server.ts       # SSR 服务端调用
│   │   └── trpc.ts         # tRPC 初始化
│   └── db.ts              # Prisma 客户端
├── server/
│   └── api/
│       ├── root.ts         # 路由入口
│       └── routers/        # API 路由
│           └── user.ts    # 用户相关 API
└── style/
    └── globals.css         # 全局样式
```

## tRPC 使用指南

### 客户端使用 (CSR)

使用 `useQuery` 和 `useMutation` Hooks：

```tsx
import { api } from "@/lib/trpc/client";

// 查询
const { data } = api.user.hello.useQuery({ text: "world" });

// 变更
const mutation = api.user.updateName.useMutation();
mutation.mutate({ name: "新名字" });
```

### 服务端使用 (SSR)

在 Server Components 中直接调用：

```tsx
import { api } from "@/lib/trpc/server";

export default async function Page() {
  const data = await api.user.hello({ text: "服务端" });
  return <div>{data.greeting}</div>;
}
```

### 路由定义

在 `src/server/api/routers/` 中添加新的路由：

```typescript
// src/server/api/routers/example.ts
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/lib/trpc/trpc";

export const exampleRouter = createTRPCRouter({
  // 公开接口
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return { greeting: `你好 ${input.text}` };
    }),

  // 需要登录的接口
  getSecret: protectedProcedure.query(() => {
    return "这是秘密信息";
  }),
});
```

然后在 `src/server/api/root.ts` 中注册：

```typescript
import { exampleRouter } from "@/server/api/routers/example";

export const appRouter = createTRPCRouter({
  user: userRouter,
  example: exampleRouter, // 添加新路由
});
```

### Procedure 类型

| 类型                 | 说明               | 使用场景               |
| -------------------- | ------------------ | ---------------------- |
| `publicProcedure`    | 公开接口，无需登录 | 公开数据、登录检查     |
| `protectedProcedure` | 需要登录           | 用户专属数据、变更操作 |

## 认证功能

### 登录

访问 `/login` 页面进行登录。

### 注册

访问 `/register` 页面创建新账户。

### 受保护路由

使用 `protectedProcedure` 确保只有登录用户才能访问：

```typescript
const getUserData = protectedProcedure.query(async ({ ctx }) => {
  // ctx.session 包含用户信息
  return ctx.session.user;
});
```

## 可用 API

| 端点                    | 类型     | 说明                      |
| ----------------------- | -------- | ------------------------- |
| `user.hello`            | query    | 测试接口，返回问候语      |
| `user.isLogged`         | query    | 检查登录状态              |
| `user.getById`          | query    | 根据 ID 获取用户          |
| `user.getInfo`          | query    | 获取当前用户信息 (需登录) |
| `user.getSecretMessage` | query    | 获取秘密信息 (需登录)     |
| `user.updateName`       | mutation | 更新用户名 (需登录)       |

## 命令

```bash
# 开发
pnpm dev              # 启动开发服务器

# 构建
pnpm build            # 生产构建
pnpm start            # 启动生产服务器

# 代码质量
pnpm lint             # ESLint 检查
```

## 环境变量

| 变量                 | 必填 | 说明                          |
| -------------------- | ---- | ----------------------------- |
| `DATABASE_URL`       | 是   | PostgreSQL 连接字符串         |
| `BETTER_AUTH_SECRET` | 是   | 认证密钥 (32位随机字符串)     |
| `BETTER_AUTH_URL`    | 是   | 应用 URL (生产环境需要 HTTPS) |

## 扩展项目

### 添加新的数据模型

1. 编辑 `prisma/schema.prisma`
2. 运行 `pnpm dlx prisma db push`
3. 运行 `pnpm dlx prisma generate`

添加Better Auth插件后需要执行:
```bash
pnpm dlx auth generate --config src/lib/better-auth/config.ts
```

### 添加新的 API 路由

1. 在 `src/server/api/routers/` 创建新文件
2. 定义 procedure
3. 在 `src/server/api/root.ts` 注册

### 添加新的页面

在 `src/app/` 下创建新目录和 `page.tsx`：

```tsx
// src/app/new-page/page.tsx
export default function NewPage() {
  return <h1>新页面</h1>;
}
```

## 许可证

MIT
