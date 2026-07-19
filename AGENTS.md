# 仓库指南

## 项目结构与模块组织

- 框架：Next.js 16（App Router）、React 19、TypeScript 5（严格）。

- `src/app/` 页面和路由处理程序
- `src/app/api/*` api路由端点 → `src/service/*` 业务逻辑
- `src/lib/*` 共享基础设施
- `src/components/` 可复用的 UI 组件放在
- `src/styles/`全局样式位于
- `public/` 静态文件
- `prisma/schema.prisma` Prisma schema 文件

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

Prettier 是权威标准：使用两空格缩进、双引号、分号和尾随逗号。
使用严格的类型检查来编写 TypeScript 和 React。使用 `@/` 别名从 `src/` 导入。
遵循现有模块风格：ESM 导入、函数式 React 组件、组件文件位于 `src/` 目录下。
定义普通组件的文件名使用 PascalCase 命名，例如 `Navbar.tsx`。
文件夹用 kebab-case 命名，例如 `src/app/api/user-profile`。
Next.js 特殊文件命名按照官方约定。
Next.js 应用的API端点只使用GET和POST方法，禁止使用其他方法

## 测试指南

通过 `pnpm lint`、`pnpm typecheck` 和相应的 `pnpm build`、`pnpm test` 来验证更改。
添加测试时，将测试文件放置在所覆盖代码附近或包级别的测试目录中，并使用如 `ComponentName.test.tsx` 或 `utils.test.ts` 的命名方式。
将集成测试命名为 `*.integration.test.ts`。
为业务规则添加针对性的单元测试，为数据库工作流添加集成测试。
从 `tests/` 导入共享测试辅助模块时使用 `@tests/*` 别名，避免深层相对路径。

## 其他

Prisma生成在./generated/prisma中，使用@generated导入

## Agent说明

运行`pnpm`之类的命令需要在沙箱外运行（此条规则仅Codex需要遵守）

如果需要启动开发服务器`pnpm dev`、请告知用户，让用户手动运行命令
禁止读取 `.env` 文件，如需查看环境变量结构请查看 `.env.example` 文件
