import { redirect } from "next/navigation";
import { signInWithMagicLink } from "./actions";
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
          使用 Supabase Magic Link 登录你的个人工作生活面板
        </p>
        <form action={signInWithMagicLink} className="mt-6 space-y-4">
          <input
            required
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            发送登录链接
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
