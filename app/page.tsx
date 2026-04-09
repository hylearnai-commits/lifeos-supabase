import { redirect } from "next/navigation";
import { addTask, deleteTask, signOut, toggleTask } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "./components/top-nav";
import { EnvSetupCard } from "./components/env-setup-card";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { Card, CardBody, CardHeader, Button, Input, Chip } from "./components/nextui";

type HomePageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
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

  const [tasksResult, notesResult, habitsResult, projectsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id,title,status,priority,project_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("habit_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("projects")
      .select("id,name,status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const tasks = tasksResult.data ?? [];
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const todoCount = tasks.length - doneCount;
  const notesCount = notesResult.count ?? 0;
  const habitCheckinCount = habitsResult.count ?? 0;
  const projects = projectsResult.data ?? [];
  const activeProjects = projects.filter((project) => project.status === "active");
  const projectMap = new Map(projects.map((project) => [project.id, project.name]));
  const { message } = await searchParams;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 md:py-20">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary-500 tracking-wider uppercase">WELCOME BACK</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">LifeOS 今日总览</h1>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="light" color="danger" className="font-medium">
            退出登录
          </Button>
        </form>
      </header>
      <TopNav />
      {message ? (
        <div className="mb-4 rounded-lg bg-danger-50 p-4 text-sm text-danger">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 md:grid-cols-3">
        <Card shadow="sm" className="bg-primary-50 border-none">
          <CardBody className="gap-2 p-6">
            <div className="flex items-center gap-2 text-primary-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <p className="text-sm font-medium">待办任务</p>
            </div>
            <p className="text-4xl font-bold text-primary-900 mt-2">{todoCount}</p>
          </CardBody>
        </Card>

        <Card shadow="sm" className="bg-success-50 border-none">
          <CardBody className="gap-2 p-6">
            <div className="flex items-center gap-2 text-success-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              </div>
              <p className="text-sm font-medium">已完成任务</p>
            </div>
            <p className="text-4xl font-bold text-success-900 mt-2">{doneCount}</p>
          </CardBody>
        </Card>

        <Card shadow="sm" className="bg-secondary-50 border-none">
          <CardBody className="gap-2 p-6">
            <div className="flex items-center gap-2 text-secondary-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <p className="text-sm font-medium">记录总数</p>
            </div>
            <p className="text-4xl font-bold text-secondary-900 mt-2">
              {notesCount + habitCheckinCount}
            </p>
          </CardBody>
        </Card>
      </section>

      <Card className="mt-8 border-none" shadow="sm">
        <CardHeader className="px-6 pt-6 pb-0">
          <h2 className="text-xl font-bold">快速新增任务</h2>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <form action={addTask} className="grid gap-4 md:grid-cols-[1fr_140px_180px_100px] items-start">
            <Input
              name="title"
              isRequired
              placeholder="输入今天要完成的一件事..."
              variant="flat"
              radius="lg"
              classNames={{
                inputWrapper: "bg-default-100 hover:bg-default-200 transition-colors h-12",
              }}
            />
            <div className="relative">
              <select
                name="priority"
                defaultValue="medium"
                className="h-12 w-full appearance-none rounded-lg bg-default-100 px-4 text-sm outline-none transition-colors hover:bg-default-200 focus:bg-default-100 focus:ring-2 focus:ring-primary/50"
                aria-label="优先级"
              >
                <option value="high">🔥 高优先级</option>
                <option value="medium">⚡ 中优先级</option>
                <option value="low">🌱 低优先级</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-default-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <div className="relative">
              <select
                name="projectId"
                defaultValue="none"
                className="h-12 w-full appearance-none rounded-lg bg-default-100 px-4 text-sm outline-none transition-colors hover:bg-default-200 focus:bg-default-100 focus:ring-2 focus:ring-primary/50"
                aria-label="关联项目"
              >
                <option value="none">📁 不关联项目</option>
                {activeProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    📁 {project.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-default-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <Button type="submit" color="primary" className="font-semibold h-12 shadow-md">
              添加任务
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-8 border-none" shadow="sm">
        <CardHeader className="px-6 pt-6 pb-0 flex justify-between items-center">
          <h2 className="text-xl font-bold">最近任务</h2>
          <span className="text-sm text-default-400">{todoCount} 项待办</span>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <ul className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <li className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default-200 bg-default-50 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-100 mb-3 text-default-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <p className="text-sm font-medium text-default-500">还没有任务</p>
                <p className="text-xs text-default-400 mt-1">在上方输入框添加你的第一个任务吧</p>
              </li>
            ) : (
              tasks.map((task) => {
                const projectName = task.project_id ? projectMap.get(task.project_id) : undefined;
                const isDone = task.status === "done";

                return (
                  <li
                    key={task.id}
                    className={`group flex items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
                      isDone 
                        ? "border-transparent bg-default-50 opacity-60" 
                        : "border-default-200 bg-background hover:border-primary/30 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <form action={toggleTask}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="status" value={task.status} />
                        <button 
                          type="submit" 
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                            isDone 
                              ? "border-success bg-success text-white" 
                              : "border-default-300 hover:border-primary hover:bg-primary/10 text-transparent hover:text-primary"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </button>
                      </form>
                      <div className="flex flex-col">
                        <p className={`text-base transition-colors ${isDone ? "text-default-500 line-through" : "text-foreground font-medium"}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            classNames={{
                              base: "h-5 px-1 border-none",
                              content: "text-[10px] font-medium"
                            }}
                            color={task.priority === "high" ? "danger" : task.priority === "low" ? "success" : "warning"}
                          >
                            {task.priority === "high" ? "高优" : task.priority === "low" ? "低优" : "中优"}
                          </Chip>
                          {projectName ? (
                            <Chip 
                              size="sm" 
                              variant="flat" 
                              color="default"
                              classNames={{
                                base: "h-5 px-1 border-none bg-default-100",
                                content: "text-[10px] font-medium text-default-500"
                              }}
                            >
                              {projectName}
                            </Chip>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                      <form action={deleteTask}>
                        <input type="hidden" name="id" value={task.id} />
                        <Button 
                          type="submit" 
                          isIconOnly 
                          size="sm" 
                          variant="light" 
                          color="danger" 
                          aria-label="删除任务"
                          className="text-danger-400 hover:text-danger hover:bg-danger-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </Button>
                      </form>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </CardBody>
      </Card>
    </main>
  );
}
