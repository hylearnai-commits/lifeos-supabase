import Link from "next/link";

const links = [
  { href: "/", label: "总览" },
  { href: "/projects", label: "项目" },
  { href: "/notes", label: "笔记" },
  { href: "/habits", label: "习惯" },
];

export function TopNav() {
  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-900"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
