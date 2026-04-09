import { redirect } from "next/navigation";
import {
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
} from "./actions";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { EnvSetupCard } from "../components/env-setup-card";

type LoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (!hasSupabaseEnv()) {
    return <EnvSetupCard />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { message } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">LifeOS 登录</h1>
        <p className="mt-2 text-sm text-zinc-600">
          使用邮箱+密码登录你的个人工作生活面板
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          首次使用请先注册，再到邮箱完成验证；验证后再用邮箱密码登录
        </p>
        <form action={signInWithPassword} className="mt-6 space-y-4">
          <input
            required
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          <input
            required
            name="password"
            type="password"
            placeholder="请输入密码（至少 6 位）"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            邮箱密码登录
          </button>
        </form>
        <form action={signUpWithPassword} className="mt-3 space-y-4">
          <input
            required
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          <input
            required
            name="password"
            type="password"
            placeholder="请输入密码（至少 6 位）"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-500"
          >
            注册新账号
          </button>
        </form>
        <div className="my-4 text-center text-xs text-zinc-400">或继续使用</div>
        <form action={signInWithMagicLink} className="space-y-3">
          <input
            required
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-500"
          >
            发送 Magic Link
          </button>
        </form>
        {message ? (
          <p className="mt-4 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
            {message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
