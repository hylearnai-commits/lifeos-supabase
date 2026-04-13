import Link from "next/link";
import { signOut } from "../actions";

const navItems = [
  { href: "/", label: "今日总览" },
  { href: "/projects", label: "项目管理" },
  { href: "/notes", label: "笔记记录" },
  { href: "/habits", label: "习惯打卡" },
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
      <aside className="hidden w-56 shrink-0 border-r border-default-200 bg-background/70 p-4 backdrop-blur md:flex md:flex-col">
        <div className="px-3 py-4 text-xl font-extrabold tracking-tight">LifeOS</div>
        <nav className="mt-2 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={currentPath === item.href ? "page" : undefined}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentPath === item.href
                  ? "bg-primary-100 text-primary-700"
                  : "text-default-600 hover:bg-default-100 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="pt-3">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-danger-600 transition-colors hover:bg-danger-50"
          >
            退出登录
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
