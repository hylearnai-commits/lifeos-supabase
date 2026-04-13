import { redirect } from "next/navigation";
import { addNote, deleteNote } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { EnvSetupCard } from "../components/env-setup-card";
import { DashboardShell } from "../components/dashboard-shell";
import { Card, CardHeader, CardBody, Button, Input, Textarea, Chip } from "../components/nextui";

type NotesPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
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

  const { data: notes } = await supabase
    .from("notes")
    .select("id,title,content,type,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const { message } = await searchParams;

  return (
    <DashboardShell currentPath="/notes">
      <main className="min-h-screen w-full px-6 py-12 md:px-8 md:py-20 xl:px-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary-500 tracking-wider uppercase">NOTES</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">笔记与记录</h1>
          <p className="mt-2 text-sm text-default-500">随时记录灵感、复盘和会议纪要</p>
        </div>
      </header>
      {message ? (
        <div className="mb-4 rounded-lg bg-primary-50 p-4 text-sm text-primary-700">
          {message}
        </div>
      ) : null}

      <Card className="mt-8 border-none" shadow="sm">
        <CardHeader className="px-6 pt-6 pb-0">
          <h2 className="text-xl font-bold">新增记录</h2>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <form action={addNote} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <Input
                name="title"
                placeholder="标题（可选）"
                variant="flat"
                radius="lg"
                classNames={{
                  inputWrapper: "bg-default-100 hover:bg-default-200 transition-colors h-12",
                }}
              />
              <div className="relative">
                <select
                  name="type"
                  className="h-12 w-full appearance-none rounded-lg bg-default-100 px-4 text-sm outline-none transition-colors hover:bg-default-200 focus:bg-default-100 focus:ring-2 focus:ring-primary/50"
                  aria-label="分类"
                >
                  <option value="note">📝 普通笔记</option>
                  <option value="journal">📓 日记复盘</option>
                  <option value="meeting">🤝 会议纪要</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-default-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <Textarea
              name="content"
              placeholder="写下你的想法、灵感或纪要..."
              minRows={4}
              variant="flat"
              radius="lg"
              classNames={{
                inputWrapper: "bg-default-100 hover:bg-default-200 transition-colors",
              }}
            />
            <div className="flex justify-end">
              <Button type="submit" color="primary" className="font-semibold h-10 px-8 shadow-md">
                保存记录
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-8 border-none" shadow="sm">
        <CardHeader className="px-6 pt-6 pb-0 flex justify-between items-center">
          <h2 className="text-xl font-bold">最近记录</h2>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <ul className="flex flex-col gap-4">
            {notes?.length ? (
              notes.map((note) => {
                const isJournal = note.type === "journal";
                const isMeeting = note.type === "meeting";
                
                return (
                  <li 
                    key={note.id} 
                    className="group relative overflow-hidden rounded-2xl border border-default-200 bg-background p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-foreground">
                            {note.title || "无标题"}
                          </p>
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            color={isJournal ? "secondary" : isMeeting ? "warning" : "default"}
                            classNames={{ base: "border-none h-5" }}
                          >
                            {note.type === "journal" ? "日记复盘" : note.type === "meeting" ? "会议纪要" : "普通笔记"}
                          </Chip>
                        </div>
                        <p className="text-xs text-default-400">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <form action={deleteNote}>
                          <input type="hidden" name="id" value={note.id} />
                          <Button
                            type="submit"
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            aria-label="删除笔记"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </form>
                      </div>
                    </div>
                    <div className="rounded-xl bg-default-50 p-4">
                      <p className="whitespace-pre-wrap text-sm text-default-700 leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default-200 bg-default-50 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-100 mb-3 text-default-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>
                </div>
                <p className="text-sm font-medium text-default-500">暂无记录</p>
                <p className="text-xs text-default-400 mt-1">在上方输入框写下你的第一条灵感吧</p>
              </li>
            )}
          </ul>
        </CardBody>
      </Card>
      </main>
    </DashboardShell>
  );
}
