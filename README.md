# LifeOS

基于 Next.js + Supabase 的个人工作生活面板。

## 本地启动

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填入 Supabase 项目的值：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`（可选，本地默认 `http://localhost:3000`）

3. 启动开发环境

```bash
npm run dev
```

## Supabase 数据库初始化

在 Supabase SQL Editor 执行：

- `supabase/migrations/202604090001_init_lifeos.sql`

该迁移会创建：

- `profiles`
- `projects`
- `tasks`
- `notes`
- `habits`
- `habit_logs`

并启用 RLS 与按 `auth.uid()` 进行个人数据隔离策略。

## 已实现功能

- Magic Link 登录
- 今日总览首页
- 任务新增与完成切换
- 基础统计卡片
- Projects 页面（新增与归档）
- Notes 页面（新增与查看）
- Habits 页面（新增与每日打卡）
