"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./nextui";
import { signOut } from "../actions";

const links = [
  { 
    href: "/", 
    label: "今日总览",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    )
  },
  { 
    href: "/projects", 
    label: "项目管理",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    )
  },
  { 
    href: "/notes", 
    label: "笔记记录",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
    )
  },
  { 
    href: "/habits", 
    label: "习惯打卡",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
    )
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-r border-default-200 bg-background/50 backdrop-blur-md flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          LifeOS
        </h2>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Button
              key={link.href}
              as={Link}
              href={link.href}
              variant={isActive ? "flat" : "light"}
              color={isActive ? "primary" : "default"}
              className="w-full justify-start font-medium h-12 text-sm"
              startContent={link.icon}
            >
              {link.label}
            </Button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-default-200">
        <form action={signOut}>
          <Button 
            type="submit" 
            variant="light" 
            color="danger" 
            className="w-full justify-start font-medium h-12 text-sm"
            startContent={
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            }
          >
            退出登录
          </Button>
        </form>
      </div>
    </aside>
  );
}
