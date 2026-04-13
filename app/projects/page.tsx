import { redirect } from "next/navigation";
import { addProject, deleteProject, toggleProjectStatus } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { EnvSetupCard } from "../components/env-setup-card";
import { DashboardShell } from "../components/dashboard-shell";
import { Card, CardHeader, CardBody, Button, Input, Chip, Progress } from "../components/nextui";

type ProjectsPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
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

  const [projectsResult, tasksResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id,name,category,status,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("project_id,status")
      .eq("user_id", user.id)
      .not("project_id", "is", null),
  ]);

  const projects = projectsResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const { message } = await searchParams;

  const statMap = tasks.reduce<Record<string, { total: number; done: number }>>((acc, task) => {
    if (!task.project_id) {
      return acc;
    }
    if (!acc[task.project_id]) {
      acc[task.project_id] = { total: 0, done: 0 };
    }
    acc[task.project_id].total += 1;
    if (task.status === "done") {
      acc[task.project_id].done += 1;
    }
    return acc;
  }, {});

  return (
    <DashboardShell currentPath="/projects">
      <main className="min-h-screen w-full px-6 py-12 md:px-8 md:py-20 xl:px-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary-500 tracking-wider uppercase">PROJECTS</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">项目管理</h1>
          <p className="mt-2 text-sm text-default-500">将工作与生活目标拆成可执行项目</p>
        </div>
      </header>
      {message ? (
        <div className="mb-4 rounded-lg bg-primary-50 p-4 text-sm text-primary-700">
          {message}
        </div>
      ) : null}

      <Card className="mt-8 border-none" shadow="sm">
        <CardHeader className="px-6 pt-6 pb-0">
          <h2 className="text-xl font-bold">新增项目</h2>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <form action={addProject} className="grid gap-4 md:grid-cols-[1fr_180px_100px] items-start">
            <Input
              name="name"
              isRequired
              placeholder="例如：Q2 产品迭代"
              variant="flat"
              radius="lg"
              classNames={{
                inputWrapper: "bg-default-100 hover:bg-default-200 transition-colors h-12",
              }}
            />
            <div className="relative">
              <select
                name="category"
                className="h-12 w-full appearance-none rounded-lg bg-default-100 px-4 text-sm outline-none transition-colors hover:bg-default-200 focus:bg-default-100 focus:ring-2 focus:ring-primary/50"
                aria-label="分类"
              >
                <option value="work">💼 工作</option>
                <option value="life">☕ 生活</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-default-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <Button type="submit" color="primary" className="font-semibold h-12 shadow-md">
              添加
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-8 border-none" shadow="sm">
        <CardHeader className="px-6 pt-6 pb-0 flex justify-between items-center">
          <h2 className="text-xl font-bold">项目列表</h2>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <ul className="flex flex-col gap-4">
            {projects.length ? (
              projects.map((project) => {
                const total = statMap[project.id]?.total ?? 0;
                const done = statMap[project.id]?.done ?? 0;
                const progress = total === 0 ? 0 : Math.round((done / total) * 100);
                const isArchived = project.status !== "active";

                return (
                  <li
                    key={project.id}
                    className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                      isArchived
                        ? "border-transparent bg-default-50 opacity-60"
                        : "border-default-200 bg-background hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-lg font-bold ${isArchived ? "text-default-500" : "text-foreground"}`}>
                            {project.name}
                          </p>
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            color={project.category === "work" ? "primary" : "secondary"}
                            classNames={{ base: "border-none h-5" }}
                          >
                            {project.category === "work" ? "工作" : "生活"}
                          </Chip>
                          {isArchived && (
                            <Chip size="sm" variant="flat" color="default" classNames={{ base: "border-none h-5" }}>
                              已归档
                            </Chip>
                          )}
                        </div>
                        <p className="text-xs text-default-400">
                          创建于 {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <form action={toggleProjectStatus}>
                          <input type="hidden" name="id" value={project.id} />
                          <input type="hidden" name="status" value={project.status} />
                          <Button
                            type="submit"
                            size="sm"
                            variant={isArchived ? "solid" : "flat"}
                            color={isArchived ? "primary" : "default"}
                            className="font-medium"
                          >
                            {isArchived ? "重新激活" : "归档"}
                          </Button>
                        </form>
                        <form action={deleteProject}>
                          <input type="hidden" name="id" value={project.id} />
                          <Button
                            type="submit"
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            aria-label="删除项目"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </form>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between mb-1 text-xs font-medium text-default-500">
                        <span>任务进度</span>
                        <span>{done} / {total} ({progress}%)</span>
                      </div>
                      <Progress 
                        size="sm" 
                        value={progress} 
                        color={progress === 100 ? "success" : "primary"}
                        classNames={{
                          track: "bg-default-100",
                          indicator: isArchived ? "bg-default-400" : ""
                        }}
                      />
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default-200 bg-default-50 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-100 mb-3 text-default-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                </div>
                <p className="text-sm font-medium text-default-500">暂无项目</p>
                <p className="text-xs text-default-400 mt-1">在上方输入框创建一个新项目吧</p>
              </li>
            )}
          </ul>
        </CardBody>
      </Card>
      </main>
    </DashboardShell>
  );
}
