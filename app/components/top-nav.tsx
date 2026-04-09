"use client";

import Link from "next/link";
import { Button } from "./nextui";

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
        <Button
          key={link.href}
          as={Link}
          href={link.href}
          variant="flat"
          size="sm"
          color="default"
          className="font-medium"
        >
          {link.label}
        </Button>
      ))}
    </nav>
  );
}
