# Full-Stack Template Next.js

一个开箱即用的全栈 Next.js 项目模板，集成了 Next.js Route Handlers、Better Auth、Prisma 和 PostgreSQL。

## 技术栈

| 技术        | 版本    | 说明              |
| ----------- | ------- | ----------------- |
| Next.js     | 16.1.6  | React 全栈框架    |
| Better Auth | 1.4.20  | 现代身份认证方案  |
| Prisma      | 7.4.2   | TypeScript ORM    |
| PostgreSQL  | -       | 关系型数据库      |
| Zod         | 4.3.6   | Schema 校验       |

## 功能特性

- **Next.js 原生后端** - 使用 App Router Route Handlers 提供 GET / POST API
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
│   │   ├── auth/[...all]/      # Better Auth API 路由
│   │   └── user/               # 用户相关 Route Handlers
│   ├── login/               # 登录页面
│   ├── register/            # 注册页面
│   ├── next-api-ssr/        # SSR 示例页面
│   ├── next-api-client/     # CSR 示例页面
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页
├── components/              # React 组件
│   └── user-menu.tsx       # 用户菜单组件
├── lib/
│   ├── better-auth/        # 认证配置
│   │   ├── client.ts       # 客户端认证
│   │   ├── config.ts       # 认证配置
│   │   ├── index.ts        # 认证实例
│   │   └── server.ts       # 服务端会话辅助
│   ├── user-api-client.ts  # 客户端 fetch 封装
│   └── db.ts              # Prisma 客户端
├── service/
│   ├── http.ts             # API 错误响应辅助
│   └── user.ts             # 用户相关服务端逻辑
└── style/
    └── globals.css         # 全局样式
```

## Next.js 后端使用指南

### 客户端使用 (CSR)

客户端组件通过 `fetch` 调用 Route Handlers：

```tsx
import { fetchHello, updateCurrentUserName } from "@/lib/user-api-client";

const data = await fetchHello("world");

await updateCurrentUserName("新名字");
```

### 服务端使用 (SSR)

Server Components 直接调用服务端函数：

```tsx
import { getHello } from "@/service/user";

export default function Page() {
  const data = getHello("服务端");
  return <div>{data.greeting}</div>;
}
```

### 路由定义

在 `src/app/api/` 中添加 `route.ts` 文件，并导出 `GET` 或 `POST`：

```typescript
// src/app/api/example/route.ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ message: "hello" });
}

export async function POST(request: Request) {
  const input = await request.json();
  return NextResponse.json(input);
}
```

## 认证功能

### 登录

访问 `/login` 页面进行登录。

### 注册

访问 `/register` 页面创建新账户。

### 受保护路由

在 Route Handler 或服务端函数中读取 Better Auth session，确保只有登录用户才能访问：

```typescript
import { auth } from "@/lib/better-auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return Response.json({ error: "请先登录" }, { status: 401 });
  }

  return Response.json(session.user);
}
```

## 可用 API

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/api/user/hello?text=world` | GET | 测试接口，返回问候语 |
| `/api/user/is-logged` | GET | 检查登录状态 |
| `/api/user/by-id?id=<id>` | GET | 根据 ID 获取用户 |
| `/api/user/me` | GET | 获取当前用户信息 (需登录) |
| `/api/user/secret-message` | GET | 获取秘密信息 (需登录) |
| `/api/user/update-name` | POST | 更新用户名 (需登录) |

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
pnpm db:push
pnpm db:generate
```

### 添加新的 API 路由

1. 在 `src/service/` 中添加可复用的服务端函数
2. 在 `src/app/api/` 下创建对应的 `route.ts`
3. 导出 `GET` 或 `POST` 处理函数

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
