"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/humanize", label: "Editor" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-ink-200/70 dark:border-ink-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl tracking-tight text-ink-900 dark:text-ink-50">
            Humanizer
          </span>
          <span className="hidden font-sans text-[11px] uppercase tracking-[0.18em] text-ink-400 sm:inline">
            Editorial rewriting
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                  active
                    ? "bg-ink-900 text-paper dark:bg-ink-50 dark:text-ink-950"
                    : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
