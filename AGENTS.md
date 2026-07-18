# 仓库指南

## 项目结构与模块组织

这是一个 Next.js 16 App Router 应用。
页面和路由处理程序位于 `src/app/` 中；
API 端点位于 `src/app/api/` 下。
可复用的 UI 组件放在 `src/components/` 中，业务逻辑和 Zod schema 放在 `src/service/` 中，共享基础设施放在 `src/lib/` 中。
全局样式位于 `src/styles/`，静态文件位于 `public/`，Prisma schema 文件为 `prisma/schema.prisma`。

保持后端流程`路由 -> 服务 -> lib/http`：路由处理程序适配 HTTP 输入/输出，服务层负责可复用的业务规则，HTTP 辅助工具提供上下文、身份验证、解析和错误响应。

## 构建、测试和开发命令

使用 pnpm 并保持 `pnpm-lock.yaml` 同步。

- `pnpm install` 安装依赖。
- `pnpm dev` 启动开发服务器，地址为 `http://localhost:3000`。
- `pnpm build` 创建生产构建；`pnpm start` 启动生产服务器。
- `pnpm lint` 运行 Next.js ESLint 配置。
- `pnpm typecheck` 运行严格的 TypeScript 检查而不生成文件。
- `pnpm format` 使用 Prettier 格式化支持的源文件并对 Tailwind 类名排序。
- `pnpm db:push` 应用 `prisma/schema.prisma`；`pnpm db:generate` 重新生成 Prisma 客户端。
- `pnpm test` 运行 vitest 单测。

## 提交和 Pull Request 指南

最近的提交历史遵循 Conventional Commit 风格的标题，例如 `feat(database): ...`、`refactor(api): ...` 和 `docs(README): ...`。使用祈使语气、重点突出的标题，可选的作用域，并将不相关的更改分开。PR 应说明目的和实现方式，列出验证命令，链接相关问题，并在有 UI 更改时附上截图。明确标注 schema 或环境变量的更改。

## 编码风格与命名规范

遵循 Prettier 默认配置
使用严格的类型检查来编写 TypeScript 和 React。使用 `@/` 别名从 `src/` 导入。
遵循现有模块风格：ESM 导入、函数式 React 组件、组件文件位于 `src/` 目录下。
定义普通组件的文件名使用 PascalCase 命名，例如 `Navbar.tsx`。
文件夹用 kebab-case 命名，例如 `src/app/api/user-profile`。
Next.js 特殊文件命名按照官方约定。

## 测试指南

通过 `pnpm lint`、`pnpm typecheck` 和相应的 `pnpm build`、`pnpm --filter test` 来验证更改。添加测试时，将测试文件放置在所覆盖代码附近或包级别的测试目录中，并使用如 `ComponentName.test.tsx` 或 `utils.test.ts` 的命名方式。

## 开发指导

运行`pnpm`之类的命令需要在沙箱外运行（此条规则仅Codex需要遵守）

如果需要启动开发服务器`pnpm dev`、请告知用户，让用户手动运行命令
禁止读取 `.env` 文件，如需查看环境变量结构请查看 `.env.example` 文件
