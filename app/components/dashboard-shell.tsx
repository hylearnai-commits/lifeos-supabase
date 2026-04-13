import Link from "next/link";
import { signOut } from "../actions";

const navItems = [
  { href: "/", label: "今日总览", icon: "◉" },
  { href: "/projects", label: "项目管理", icon: "▣" },
  { href: "/notes", label: "笔记记录", icon: "✦" },
  { href: "/habits", label: "习惯打卡", icon: "✓" },
];

export function DashboardShell({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath: string;
}) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 shrink-0 border-r border-default-200 bg-gradient-to-b from-background via-background to-default-50/60 p-4 md:flex md:flex-col">
        <div className="rounded-2xl border border-default-200 bg-content1 p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-500">Workspace</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">LifeOS</h2>
          <p className="mt-1 text-xs text-default-500">个人工作生活面板</p>
        </div>
        <nav className="mt-4 flex-1 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={currentPath === item.href ? "page" : undefined}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                currentPath === item.href
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-default-600 hover:bg-default-100 hover:text-foreground"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs ${
                  currentPath === item.href
                    ? "bg-white/20 text-white"
                    : "bg-default-100 text-default-500 group-hover:bg-default-200"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <form action={signOut} className="pt-3">
          <button
            type="submit"
            className="w-full rounded-xl border border-danger-200 bg-danger-50 px-3 py-2.5 text-left text-sm font-semibold text-danger-600 transition-colors hover:bg-danger-100"
          >
            退出登录
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
