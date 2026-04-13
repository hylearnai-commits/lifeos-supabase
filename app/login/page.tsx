import { redirect } from "next/navigation";
import {
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
} from "./actions";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { EnvSetupCard } from "../components/env-setup-card";
import { Card, CardHeader, CardBody, Input, Button } from "../components/nextui";

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
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <Card className="w-full max-w-md p-4 shadow-xl">
        <CardHeader className="flex flex-col items-center justify-center gap-1 pb-2">
          <h1 className="text-2xl font-bold">LifeOS</h1>
          <p className="text-small text-default-500">
            登录你的个人工作生活面板
          </p>
        </CardHeader>
        <CardBody className="gap-4">
          {message && (
            <div className="rounded-lg bg-danger-50 p-3 text-small text-danger">
              {message}
            </div>
          )}

          <div className="space-y-5">
            <section className="rounded-xl border border-default-200 p-4">
              <h2 className="mb-3 text-sm font-semibold text-default-700">登录</h2>
              <form action={signInWithPassword} className="flex flex-col gap-4">
                <Input
                  isRequired
                  name="email"
                  type="email"
                  label="邮箱"
                  placeholder="you@example.com"
                  variant="bordered"
                />
                <Input
                  isRequired
                  name="password"
                  type="password"
                  label="密码"
                  placeholder="请输入密码"
                  variant="bordered"
                />
                <Button type="submit" color="primary" fullWidth className="mt-1 font-medium">
                  登录
                </Button>
              </form>
            </section>

            <section className="rounded-xl border border-default-200 p-4">
              <h2 className="mb-2 text-sm font-semibold text-default-700">注册</h2>
              <p className="mb-3 text-xs text-default-500">首次使用请先注册，注册后前往邮箱完成验证。</p>
              <form action={signUpWithPassword} className="flex flex-col gap-4">
                <Input
                  isRequired
                  name="email"
                  type="email"
                  label="邮箱"
                  placeholder="you@example.com"
                  variant="bordered"
                />
                <Input
                  isRequired
                  name="password"
                  type="password"
                  label="密码"
                  placeholder="至少 6 位密码"
                  variant="bordered"
                />
                <Button type="submit" color="secondary" fullWidth className="mt-1 font-medium">
                  注册新账号
                </Button>
              </form>
            </section>

            <section className="rounded-xl border border-default-200 p-4">
              <h2 className="mb-2 text-sm font-semibold text-default-700">Magic Link</h2>
              <p className="mb-3 text-xs text-default-500">无需密码，通过邮箱验证链接快速登录。</p>
              <form action={signInWithMagicLink} className="flex flex-col gap-4">
                <Input
                  isRequired
                  name="email"
                  type="email"
                  label="邮箱"
                  placeholder="you@example.com"
                  variant="bordered"
                />
                <Button type="submit" variant="flat" color="default" fullWidth className="mt-1 font-medium">
                  发送 Magic Link
                </Button>
              </form>
            </section>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
