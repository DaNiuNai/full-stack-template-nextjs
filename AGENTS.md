# 仓库指南

## 技术栈与目录

- 使用 Next.js App Router、React 和严格模式 TypeScript；具体版本以 `package.json` 为准。
- `src/app/`：页面和路由处理程序。
- `src/app/api/`：业务 API 保持为薄层，业务逻辑放在 `src/service/`；第三方框架适配路由除外。
- `src/lib/`：共享基础设施。
- `src/components/`：可复用 UI 组件。
- `src/styles/`：全局样式。
- `public/`：静态文件。
- `prisma/schema.prisma`：Prisma schema；客户端生成到 `generated/prisma/`，使用 `@generated/prisma/client` 导入。

## 常用命令

使用 pnpm 管理依赖；依赖变更必须同步更新 `pnpm-lock.yaml`。

- `pnpm lint`：运行 ESLint。
- `pnpm typecheck`：运行严格 TypeScript 检查，不生成文件。
- `pnpm test`：运行全部 Vitest 测试，包括单元测试和集成测试。
- `pnpm build`：创建生产构建。
- `pnpm format`：使用 Prettier 格式化。
- `pnpm db:push`：应用 `prisma/schema.prisma`；
- `pnpm db:generate`：重新生成 Prisma 客户端。

## 编码与命名

- Prettier 是格式规范的唯一依据，默认使用两空格缩进、双引号、分号和尾随逗号。
- 从 `src/`、`generated/` 和 `tests/` 导入时，分别使用 `@/`、`@generated/` 和 `@tests/` 别名，避免深层相对路径。
- 普通组件文件使用 kebab-case，例如 `user-menu.tsx`。
- 自定义目录使用 kebab-case；Next.js 特殊文件和动态路由段遵循框架约定。
- 项目 API 端点仅使用 `GET` 和 `POST`，禁止使用其他 HTTP 方法。

## 测试与验证

- 普通代码变更运行 `pnpm lint`、`pnpm typecheck` 和相关测试；构建、路由或配置变更还需运行 `pnpm build`。
- 测试放在被测代码附近；单元测试命名为 `*.test.ts` 或 `*.test.tsx`，集成测试命名为 `*.integration.test.ts`。
- 为业务规则添加针对性的单元测试，为数据库工作流添加集成测试。
- 从 `tests/` 导入共享测试辅助模块时使用 `@tests/*`。

## 提交与 Pull Request

提交标题遵循 Conventional Commits，使用祈使语气和可选作用域，不相关的更改应分开提交。PR 应说明目的、实现方式和验证命令；UI 更改附截图，并明确标注 schema 或环境变量变更。

## Agent 约束

- Codex 执行 `pnpm` 命令时必须申请沙箱外权限。
- 不要自行启动 `pnpm dev`；需要开发服务器时，请用户手动启动。
- 禁止读取 `.env`、`.env.local` 等实际环境文件；环境变量结构仅查看 `.env.example`。
