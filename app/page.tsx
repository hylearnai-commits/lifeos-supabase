import { redirect } from "next/navigation";
import { addTask, signOut, toggleTask } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "./components/top-nav";
import { EnvSetupCard } from "./components/env-setup-card";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function Home() {
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

  const [tasksResult, notesResult, habitsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id,title,status,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("habit_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const tasks = tasksResult.data ?? [];
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const todoCount = tasks.length - doneCount;
  const notesCount = notesResult.count ?? 0;
  const habitCheckinCount = habitsResult.count ?? 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">欢迎回来</p>
          <h1 className="text-3xl font-semibold text-zinc-900">LifeOS 今日总览</h1>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-900"
          >
            退出登录
          </button>
        </form>
      </header>
      <TopNav />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">待办任务</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{todoCount}</p>
        </article>
        <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">已完成任务</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{doneCount}</p>
        </article>
        <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">记录总数</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {notesCount + habitCheckinCount}
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">快速新增任务</h2>
        <form action={addTask} className="mt-4 flex gap-3">
          <input
            name="title"
            required
            placeholder="输入今天要完成的一件事"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
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
        <h2 className="text-lg font-semibold text-zinc-900">最近任务</h2>
        <ul className="mt-4 space-y-3">
          {tasks.length === 0 ? (
            <li className="rounded-lg bg-zinc-50 px-3 py-6 text-center text-sm text-zinc-500">
              还没有任务，先添加一个吧
            </li>
          ) : (
            tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-3"
              >
                <p className={task.status === "done" ? "text-zinc-400 line-through" : "text-zinc-900"}>
                  {task.title}
                </p>
                <form action={toggleTask}>
                  <input type="hidden" name="id" value={task.id} />
                  <input type="hidden" name="status" value={task.status} />
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-900"
                  >
                    {task.status === "done" ? "设为待办" : "完成"}
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
