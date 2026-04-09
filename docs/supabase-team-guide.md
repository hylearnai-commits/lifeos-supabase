# Supabase 能力介绍：它能做什么（LifeOS 团队版）

本文聚焦一个问题：**Supabase 到底能做什么**。  
适合用于给产品、前端、后端、测试同学快速建立统一认知。

## 1. 一句话理解 Supabase

Supabase 是一套以 Postgres 为核心的后端平台，提供：

- 可直接用的数据库能力
- 用户认证与会话管理
- 对象存储与访问控制
- 实时数据推送
- Serverless 函数执行
- 自动生成 API 与权限控制

可以把它理解成：**“可控的云后端基础设施 + 开箱即用的业务能力”**。

## 2. 核心能力总览

### 2.1 数据库（Postgres）

它能做什么：

- 建表、索引、约束、触发器、函数等完整关系型能力
- 复杂查询、事务、聚合统计、分页过滤
- 用 SQL 迁移管理数据库结构变更
- 与业务代码共享同一套数据源

适用场景：

- 业务主数据存储
- 报表与统计
- 关系型建模（用户、项目、任务、日志等）

### 2.2 API 自动生成

它能做什么：

- 基于数据库表自动生成 REST API
- 支持按条件查询、排序、分页、范围读取
- 可配合 RLS 策略自动进行权限过滤

适用场景：

- 快速交付后台 CRUD
- 前后端并行开发（前端先联调 API）

### 2.3 认证（Auth）

它能做什么：

- 邮箱密码登录/注册
- Magic Link（免密码邮箱登录）
- OAuth 第三方登录（例如 Google）
- 会话管理、令牌刷新、登录态获取

适用场景：

- ToC/ToB 账号体系
- 无密码登录体验优化
- 多登录方式并存

### 2.4 权限控制（RLS）

它能做什么：

- 在数据库层按行控制读写权限
- 按 `auth.uid()` 隔离不同用户数据
- 对同一张表配置不同操作策略（查、增、改、删）

适用场景：

- 多租户数据隔离
- “前端可直连数据层”但仍需安全边界
- 防止误操作/越权读取

### 2.5 对象存储（Storage）

它能做什么：

- 上传和管理文件（图片、附件、文档）
- 按 Bucket 管理权限和生命周期
- 生成公开或签名访问链接

适用场景：

- 用户头像、附件、富文本图片
- 需要按用户或组织控制文件访问

### 2.6 实时能力（Realtime）

它能做什么：

- 订阅数据库变更（新增、更新、删除）
- 实时同步前端视图状态
- 支持多人协作场景的即时更新

适用场景：

- 看板、聊天、协作编辑、实时通知

### 2.7 Edge Functions（Serverless）

它能做什么：

- 编写后端函数处理复杂业务逻辑
- 对接第三方 API、Webhook、异步任务
- 承接不适合直接暴露给前端的逻辑

适用场景：

- 支付回调处理
- 风控校验
- 第三方服务编排

### 2.8 运维与治理能力

它能做什么：

- 项目环境管理（开发/测试/生产）
- 数据库备份与恢复能力
- 日志与诊断能力（排查认证、查询、函数问题）

适用场景：

- 生产环境稳定性保障
- 故障排查与审计追踪

## 3. 用 Supabase 能加速什么

对团队协作的直接价值：

- 前端：减少自建后端接口的等待时间，开发闭环更快
- 后端：专注领域逻辑，不必从零搭建认证/存储/权限系统
- 产品：MVP 到可上线版本的迭代周期更短
- 测试：权限与数据隔离规则可通过 RLS 统一验证

## 4. 企业项目里最常见的组合用法

推荐组合：

1. **Postgres + RLS**：先确保数据模型与权限边界
2. **Auth + SSR 会话**：统一登录态与服务端鉴权
3. **Storage + 签名 URL**：文件访问按角色控制
4. **Realtime + Edge Functions**：实时体验与业务编排增强

这四个组合覆盖了绝大多数业务系统的核心后端需求。

## 5. 这个项目里的代码用法（LifeOS 实战）

这一节只讲当前仓库如何使用 Supabase，方便直接对照代码阅读与开发。

### 5.0 实际代码片段

#### A. 服务端 Supabase Client（`lib/supabase/server.ts`）

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase 环境变量未配置完整");
  }

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {}
      },
    },
  });
}
```

#### B. 认证：Magic Link（`app/login/actions.ts`）

```ts
export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    redirect(`/login?message=${encodeURIComponent("请输入邮箱")}`);
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?message=${encodeURIComponent("登录链接已发送，请检查邮箱")}`);
}
```

#### C. 业务写入：新增项目（`app/projects/actions.ts`）

```ts
export async function addProject(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const category = formData.get("category")?.toString().trim() || "work";

  if (!name) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    name,
    category,
    status: "active",
  });

  if (error) {
    redirect(`/projects?message=${encodeURIComponent(`新增项目失败：${error.message}`)}`);
  }

  revalidatePath("/projects");
  revalidatePath("/");
  redirect(`/projects?message=${encodeURIComponent("项目已创建")}`);
}
```

#### D. 数据库权限：RLS 策略（`supabase/migrations/202604090001_init_lifeos.sql`）

```sql
alter table public.projects enable row level security;

drop policy if exists "projects_all_own" on public.projects;
create policy "projects_all_own"
on public.projects
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### 5.1 客户端创建与会话管理

- 浏览器端客户端：`lib/supabase/client.ts`
  - 用于前端场景，读取公开环境变量创建客户端
- 服务端客户端：`lib/supabase/server.ts`
  - 用于 Server Action / Route Handler，通过 cookies 维持会话
- 中间件会话刷新：`lib/supabase/middleware.ts`
  - 每次请求执行 `supabase.auth.getUser()`，同步并刷新会话状态

### 5.2 认证在代码中的落点

- 登录/注册/Magic Link/OAuth：`app/login/actions.ts`
  - `signInWithPassword`
  - `signUpWithPassword`
  - `signInWithMagicLink`
  - `signInWithGoogle`
- 邮件回调确认：`app/auth/confirm/route.ts`
  - `exchangeCodeForSession`（OAuth code）
  - `verifyOtp`（Magic Link token）

当前项目的认证流程是：

1. 在登录页触发 Server Action
2. Supabase Auth 发起登录
3. 回调到 `/auth/confirm` 换取会话
4. 成功后重定向到业务页

### 5.3 业务 CRUD 的统一模式

项目里基本采用同一模式：

1. 在 `actions.ts` 中 `await createClient()`
2. 通过 `supabase.auth.getUser()` 获取当前用户
3. 未登录则 `redirect("/login")`
4. 对业务表执行 `insert/update/delete/select`
5. 写入时带 `user_id: user.id`
6. 成功后 `revalidatePath()` + `redirect()`

### 5.4 各业务模块对应文件

- 任务（首页）：`app/actions.ts`
  - `addTask`、`toggleTask`、`deleteTask`
- 项目：`app/projects/actions.ts`
  - `addProject`、`toggleProjectStatus`、`deleteProject`
- 笔记：`app/notes/actions.ts`
  - `addNote`、`deleteNote`
- 习惯：`app/habits/actions.ts`
  - `addHabit`、`checkInHabit`、`deleteHabit`

### 5.5 数据库与策略在项目中的来源

- 初始化迁移：`supabase/migrations/202604090001_init_lifeos.sql`
- 修复迁移：`supabase/migrations/202604090003_repair_habits.sql`

核心点：

- 表结构和约束（状态枚举、优先级、唯一键）都在迁移里定义
- RLS 策略在迁移中一次性落库
- 代码层与数据库层共同保证“只能操作自己的数据”

### 5.6 参考模板（新功能照这个写）

```ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createX(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("your_table").insert({
    user_id: user.id,
  });

  if (error) {
    redirect(`/your-page?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/your-page");
  redirect(`/your-page?message=${encodeURIComponent("操作成功")}`);
}
```

## 6. 结论

在 LifeOS 里，Supabase 的定位是“完整后端底座”：

- Auth 解决身份和会话
- Postgres 承载核心业务数据
- RLS 提供最终权限边界
- Server Action 作为主要业务入口

如果团队继续按现有模式扩展新模块，可以保持较高开发速度，同时维持权限与数据一致性。
