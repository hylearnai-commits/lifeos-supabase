import { redirect } from "next/navigation";
import { addNote } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "../components/top-nav";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { EnvSetupCard } from "../components/env-setup-card";

export default async function NotesPage() {
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

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-zinc-900">笔记与记录</h1>
        <p className="mt-2 text-sm text-zinc-500">随时记录灵感、复盘和会议纪要</p>
      </header>
      <TopNav />

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">新增记录</h2>
        <form action={addNote} className="mt-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <input
              name="title"
              placeholder="标题（可选）"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
            <select
              name="type"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            >
              <option value="note">普通笔记</option>
              <option value="journal">日记复盘</option>
              <option value="meeting">会议纪要</option>
            </select>
          </div>
          <textarea
            name="content"
            rows={4}
            placeholder="写下内容..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            保存
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">最近记录</h2>
        <ul className="mt-4 space-y-3">
          {notes?.length ? (
            notes.map((note) => (
              <li key={note.id} className="rounded-lg border border-zinc-200 px-3 py-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900">{note.title || "无标题"}</p>
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {note.type}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{note.content}</p>
              </li>
            ))
          ) : (
            <li className="rounded-lg bg-zinc-50 px-3 py-6 text-center text-sm text-zinc-500">
              暂无记录，先写下第一条
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
