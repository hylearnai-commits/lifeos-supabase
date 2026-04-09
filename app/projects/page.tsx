import { redirect } from "next/navigation";
import { addProject, toggleProjectStatus } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "../components/top-nav";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { EnvSetupCard } from "../components/env-setup-card";

export default async function ProjectsPage() {
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

  const { data: projects } = await supabase
    .from("projects")
    .select("id,name,category,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-zinc-900">项目管理</h1>
        <p className="mt-2 text-sm text-zinc-500">将工作与生活目标拆成可执行项目</p>
      </header>
      <TopNav />

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">新增项目</h2>
        <form action={addProject} className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_100px]">
          <input
            name="name"
            required
            placeholder="例如：Q2 产品迭代"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <select
            name="category"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          >
            <option value="work">工作</option>
            <option value="life">生活</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            添加
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">项目列表</h2>
        <ul className="mt-4 space-y-3">
          {projects?.length ? (
            projects.map((project) => (
              <li
                key={project.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-3"
              >
                <div>
                  <p className="font-medium text-zinc-900">{project.name}</p>
                  <p className="text-xs text-zinc-500">
                    {project.category === "work" ? "工作" : "生活"} ·{" "}
                    {project.status === "active" ? "进行中" : "已归档"}
                  </p>
                </div>
                <form action={toggleProjectStatus}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="status" value={project.status} />
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-900"
                  >
                    {project.status === "active" ? "归档" : "重新激活"}
                  </button>
                </form>
              </li>
            ))
          ) : (
            <li className="rounded-lg bg-zinc-50 px-3 py-6 text-center text-sm text-zinc-500">
              暂无项目，先创建一个
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
