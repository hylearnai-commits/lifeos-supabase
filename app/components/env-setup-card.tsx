export function EnvSetupCard() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">先配置 Supabase 环境变量</h1>
        <p className="mt-2 text-sm text-zinc-600">
          当前项目缺少必要配置，请在项目根目录创建或补全 .env.local 后刷新页面
        </p>
        <ul className="mt-4 space-y-2 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</li>
          <li>SUPABASE_SECRET_KEY</li>
          <li>NEXT_PUBLIC_SITE_URL</li>
        </ul>
      </section>
    </main>
  );
}
