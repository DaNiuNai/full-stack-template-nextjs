# Full-Stack Template Next.js

一个开箱即用的全栈 Next.js 项目模板，集成了 Next.js Route Handlers、Better Auth、Prisma 和 SQLite。

## 技术栈

| 技术        | 版本   | 说明             |
| ----------- | ------ | ---------------- |
| Next.js     | 16.1.6 | React 全栈框架   |
| Better Auth | 1.4.20 | 现代身份认证方案 |
| Prisma      | 7.4.2  | TypeScript ORM   |
| SQLite      | -      | 关系型数据库     |
| Zod         | 4.3.6  | Schema 校验      |

## 功能特性

- **Next.js 原生后端** - 使用 App Router Route Handlers 提供 GET / POST API
- **清晰的 API 分层** - Route Handler 负责协议适配，Service 负责业务逻辑，`lib/http` 提供统一 HTTP 基础设施
- **SSR & CSR** - 支持服务端渲染和客户端渲染
- **用户认证** - 内置登录、注册、会话管理
- **数据库集成** - Prisma + SQLite 完整配置

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
DATABASE_URL="file:./dev.db"
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
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
pnpm db:push

# 生成 Prisma Client
pnpm db:generate
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/                     # Next.js App Router
│   ├── api/
│   │   ├── auth/[...all]/  # Better Auth API 路由
│   │   └── user/           # 用户相关 Route Handlers
│   ├── login/              # 登录页面
│   ├── register/           # 注册页面
│   ├── next-api-ssr/       # SSR 示例页面
│   ├── next-api-client/    # CSR 示例页面
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页
├── components/             # React 组件
│   └── user-menu.tsx       # 用户菜单组件
├── lib/
│   ├── better-auth/         # 认证配置
│   ├── http/
│   │   ├── errors.ts        # API 错误、统一错误响应
│   │   └── server.ts        # ApiContext、认证与请求解析辅助
│   ├── db.ts                # Prisma 客户端
│   └── user-api-client.ts   # 客户端 fetch 封装
├── service/
│   └── user.ts              # 用户业务逻辑与输入 Schema
└── style/
    └── globals.css          # 全局样式
```

## Next.js 后端使用指南

请求按 `route → service → lib/http` 分层：Route Handler 解析 HTTP 输入并输出响应；Service 接收已校验的输入和 `ApiContext`，执行可复用业务逻辑；`lib/http` 统一提供上下文、认证、请求解析和错误响应。

### 客户端使用 (CSR)

客户端组件通过 `fetch` 调用 Route Handlers：

```tsx
import {
  ApiClientError,
  fetchHello,
  updateCurrentUserName,
} from "@/lib/user-api-client";

const data = await fetchHello("world");

try {
  await updateCurrentUserName("新名字");
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(error.code, error.message, error.issues);
  }
}
```

### 服务端使用 (SSR)

Server Components 直接调用服务端函数：

```tsx
import { headers } from "next/headers";

import { getApiContextFromHeaders } from "@/lib/http/server";
import { userService } from "@/service/user";

export default async function Page() {
  const ctx = await getApiContextFromHeaders(await headers());
  const data = userService.getHello({ text: "服务端" });
  const loginStatus = await userService.getLoginStatus(ctx);

  return (
    <div>
      {data.greeting}，{loginStatus.status ? "已登录" : "未登录"}
    </div>
  );
}
```

`ApiContext` 包含当前请求的 `headers`、session 和数据库实例。SSR 与 Route Handler 使用同一套 Service，不需要在服务端组件中再次请求自身 API。

### Route Handler 与参数校验

输入 Schema 与业务逻辑放在 Service 中，Route Handler 只负责创建上下文、读取并校验参数、调用 Service。所有异常交给 `withApiError` 转换：

```typescript
// src/app/api/user/update-name/route.ts
import { withApiError } from "@/lib/http/errors";
import { getApiContext, readJsonObject } from "@/lib/http/server";
import { updateNameInput, userService } from "@/service/user";

export function POST(request: Request) {
  return withApiError(async () => {
    const ctx = await getApiContext(request);
    const input = updateNameInput.parse(await readJsonObject(request));
    return Response.json(await userService.updateName(ctx, input));
  });
}
```

错误响应统一为以下结构。Zod 参数校验失败时，`issues` 会包含字段级错误详情：

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "请求参数无效",
    "issues": {}
  }
}
```

## 认证功能

### 登录

访问 `/login` 页面进行登录。

### 注册

访问 `/register` 页面创建新账户。

### 受保护路由

`getApiContext` / `getApiContextFromHeaders` 会读取 Better Auth session。受保护的业务逻辑在 Service 中调用 `requireUser`：

```typescript
import type { ApiContext } from "@/lib/http/server";
import { requireUser } from "@/lib/http/server";

export async function getProtectedData(ctx: ApiContext) {
  const session = requireUser(ctx);

  return { userId: session.user.id };
}
```

未登录时会得到 `401` 和 `UNAUTHORIZED` 错误码；业务代码不需要自行拼装错误响应。

## 可用 API

| 端点                         | 方法 | 说明                      |
| ---------------------------- | ---- | ------------------------- |
| `/api/user/hello?text=world` | GET  | 测试接口，返回问候语      |
| `/api/user/is-logged`        | GET  | 检查登录状态              |
| `/api/user/by-id?id=<id>`    | GET  | 根据 ID 获取用户          |
| `/api/user/me`               | GET  | 获取当前用户信息 (需登录) |
| `/api/user/secret-message`   | GET  | 获取秘密信息 (需登录)     |
| `/api/user/update-name`      | POST | 更新用户名 (需登录)       |

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
| `DATABASE_URL`       | 是   | SQLite 数据库文件地址         |
| `BETTER_AUTH_SECRET` | 是   | 认证密钥 (32位随机字符串)     |
| `BETTER_AUTH_URL`    | 是   | 应用 URL (生产环境需要 HTTPS) |

## 扩展项目

### 添加新的数据模型

1. 编辑 `prisma/schema.prisma`
2. 运行 `pnpm db:push`
3. 运行 `pnpm db:generate`

添加Better Auth插件后需要执行:

```bash
pnpm dlx auth generate --config src/lib/better-auth/config.ts
pnpm db:push
pnpm db:generate
```

### 添加新的 API 路由

1. 在 `src/service/` 中定义 Zod 输入 Schema 和可复用业务方法
2. 在 `src/app/api/` 下创建对应的 `route.ts`
3. 使用 `getApiContext`、请求解析辅助函数和 Schema 取得已校验输入
4. 使用 `withApiError` 调用 Service 并返回响应

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
