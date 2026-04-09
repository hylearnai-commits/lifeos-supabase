import { Card, CardHeader, CardBody } from "./nextui";

export function EnvSetupCard() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <Card className="w-full max-w-2xl p-4 shadow-xl">
        <CardHeader className="flex flex-col items-start gap-1 pb-2">
          <h1 className="text-2xl font-bold">先配置 Supabase 环境变量</h1>
          <p className="text-sm text-default-500">
            当前项目缺少必要配置，请在项目根目录创建或补全 .env.local 后刷新页面
          </p>
        </CardHeader>
        <CardBody>
          <ul className="space-y-2 rounded-lg bg-default-100 p-4 text-sm font-mono text-default-700">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</li>
            <li>SUPABASE_SECRET_KEY</li>
            <li>NEXT_PUBLIC_SITE_URL</li>
          </ul>
        </CardBody>
      </Card>
    </main>
  );
}
