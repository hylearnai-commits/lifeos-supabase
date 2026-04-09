import { redirect } from "next/navigation";
import { addHabit, checkInHabit, deleteHabit } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "../components/top-nav";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { EnvSetupCard } from "../components/env-setup-card";

export default async function HabitsPage() {
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

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-zinc-900">习惯追踪</h1>
        <p className="mt-2 text-sm text-zinc-500">每天打卡，让小行动累积成长</p>
      </header>
      <TopNav />

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">新增习惯</h2>
        <form action={addHabit} className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_120px_100px]">
          <input
            name="name"
            required
            placeholder="例如：阅读 30 分钟"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <select
            name="frequency"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          >
            <option value="daily">每日</option>
            <option value="weekly">每周</option>
          </select>
          <input
            min={1}
            name="targetValue"
            type="number"
            defaultValue={1}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            添加
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">今日打卡</h2>
        <ul className="mt-4 space-y-3">
          {habits.length ? (
            habits.map((habit) => {
              const checked = checkedSet.has(habit.id);
              return (
                <li
                  key={habit.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{habit.name}</p>
                    <p className="text-xs text-zinc-500">
                      {habit.frequency === "daily" ? "每日" : "每周"} · 目标 {habit.target_value}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {checked ? (
                      <span className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                        今日已打卡
                      </span>
                    ) : (
                      <form action={checkInHabit}>
                        <input type="hidden" name="habitId" value={habit.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-900"
                        >
                          立即打卡
                        </button>
                      </form>
                    )}
                    <form action={deleteHabit}>
                      <input type="hidden" name="id" value={habit.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-300 hover:text-red-700"
                      >
                        删除
                      </button>
                    </form>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="rounded-lg bg-zinc-50 px-3 py-6 text-center text-sm text-zinc-500">
              暂无习惯，先创建一个
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
