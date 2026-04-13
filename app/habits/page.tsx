import { redirect } from "next/navigation";
import { addHabit, checkInHabit, deleteHabit } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { EnvSetupCard } from "../components/env-setup-card";
import { DashboardShell } from "../components/dashboard-shell";
import { Card, CardHeader, CardBody, Button, Input, Chip } from "../components/nextui";

type HabitsPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function HabitsPage({ searchParams }: HabitsPageProps) {
  if (!hasSupabaseEnv()) {
    return <EnvSetupCard />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);
  const [habitsResult, logsResult] = await Promise.all([
    supabase
      .from("habits")
      .select("id,name,frequency,target_value,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("user_id", user.id)
      .eq("log_date", today),
  ]);

  const habits = habitsResult.data ?? [];
  const checkedSet = new Set((logsResult.data ?? []).map((item) => item.habit_id));
  const { message } = await searchParams;

  return (
    <DashboardShell currentPath="/habits">
      <main className="min-h-screen w-full px-6 py-12 md:px-8 md:py-20 xl:px-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary-500 tracking-wider uppercase">HABITS</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">习惯追踪</h1>
          <p className="mt-2 text-sm text-default-500">每天打卡，让小行动累积成长</p>
        </div>
      </header>
      {message ? (
        <div className="mb-4 rounded-lg bg-primary-50 p-4 text-sm text-primary-700">
          {message}
        </div>
      ) : null}

      <Card className="mt-8 border-none" shadow="sm">
        <CardHeader className="px-6 pt-6 pb-0">
          <h2 className="text-xl font-bold">新增习惯</h2>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <form action={addHabit} className="grid gap-4 md:grid-cols-[1fr_160px_120px_100px] items-start">
            <Input
              name="name"
              isRequired
              placeholder="例如：阅读 30 分钟"
              variant="flat"
              radius="lg"
              classNames={{
                inputWrapper: "bg-default-100 hover:bg-default-200 transition-colors h-12",
              }}
            />
            <div className="relative">
              <select
                name="frequency"
                className="h-12 w-full appearance-none rounded-lg bg-default-100 px-4 text-sm outline-none transition-colors hover:bg-default-200 focus:bg-default-100 focus:ring-2 focus:ring-primary/50"
                aria-label="频率"
              >
                <option value="daily">📅 每日</option>
                <option value="weekly">📆 每周</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-default-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <Input
              min={1}
              name="targetValue"
              type="number"
              defaultValue="1"
              variant="flat"
              radius="lg"
              classNames={{
                inputWrapper: "bg-default-100 hover:bg-default-200 transition-colors h-12",
              }}
              aria-label="目标值"
            />
            <Button type="submit" color="primary" className="font-semibold h-12 shadow-md">
              添加
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-8 border-none" shadow="sm">
        <CardHeader className="px-6 pt-6 pb-0 flex justify-between items-center">
          <h2 className="text-xl font-bold">今日打卡</h2>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <ul className="flex flex-col gap-4">
            {habits.length ? (
              habits.map((habit) => {
                const checked = checkedSet.has(habit.id);
                return (
                  <li
                    key={habit.id}
                    className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                      checked
                        ? "border-success-200 bg-success-50/50"
                        : "border-default-200 bg-background hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                          checked ? "bg-success-100 text-success-600" : "bg-primary-100 text-primary-600"
                        }`}>
                          {checked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                          )}
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${checked ? "text-success-700" : "text-foreground"}`}>
                            {habit.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Chip size="sm" variant="flat" color={checked ? "success" : "default"} classNames={{ base: "border-none h-5" }}>
                              {habit.frequency === "daily" ? "每日" : "每周"}
                            </Chip>
                            <span className="text-xs font-medium text-default-400">
                              目标: {habit.target_value} 次
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {checked ? (
                          <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-success-100 text-success-700 text-sm font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            今日已打卡
                          </div>
                        ) : (
                          <form action={checkInHabit}>
                            <input type="hidden" name="habitId" value={habit.id} />
                            <Button
                              type="submit"
                              color="primary"
                              variant="flat"
                              className="font-bold px-6 shadow-sm hover:shadow-md"
                            >
                              立即打卡
                            </Button>
                          </form>
                        )}
                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                          <form action={deleteHabit}>
                            <input type="hidden" name="id" value={habit.id} />
                            <Button
                              type="submit"
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              aria-label="删除习惯"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default-200 bg-default-50 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-100 mb-3 text-default-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <p className="text-sm font-medium text-default-500">暂无习惯</p>
                <p className="text-xs text-default-400 mt-1">在上方输入框创建一个新习惯吧</p>
              </li>
            )}
          </ul>
        </CardBody>
      </Card>
      </main>
    </DashboardShell>
  );
}
