"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/graph", label: "Knowledge Graph" },
];

export function Navbar() {
  const pathname = usePathname();
    return (
      <nav
        className="w-full max-w-4xl mx-auto mt-4 mb-8 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0 rounded-3xl shadow-2xl bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-gradient-to-br from-blue-300/30 via-fuchsia-300/20 to-pink-200/30"
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(80, 80, 120, 0.13), 0 2px 8px 0 rgba(120, 120, 180, 0.10) inset, 0 1.5px 6px 0 rgba(120, 120, 180, 0.08)",
          borderImage: 'linear-gradient(120deg, #60a5fa33, #d946ef22, #f472b633) 1',
          borderWidth: '1.5px',
        }}
      >
        <Link href="/">
          <div className="text-3xl sm:text-4xl font-black italic tracking-widest bg-gradient-to-r from-blue-500 via-fuchsia-500 to-pink-400 bg-clip-text text-transparent select-none drop-shadow-lg cursor-pointer animate-glow" style={{fontFamily: 'Inter, ui-sans-serif, system-ui', letterSpacing: '0.08em', textShadow: '0 2px 16px #a5b4fc55, 0 1px 2px #f472b655'}}>
            vyoma
          </div>
        </Link>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-6 text-base sm:text-lg font-semibold w-full sm:w-auto">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="flex-1 sm:flex-none">
              <Button
                variant={pathname === link.href ? "default" : "ghost"}
                className={cn(
                  "font-semibold w-full sm:w-auto rounded-xl px-4 py-2 transition-all duration-200 border-none",
                  pathname === link.href
                    ? "bg-gradient-to-r from-blue-500 via-fuchsia-500 to-pink-400 text-white shadow-lg hover:brightness-110 hover:scale-105"
                    : "bg-white/40 dark:bg-black/20 text-gray-700 dark:text-gray-200 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300"
                )}
                style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex justify-center w-full sm:w-auto">
          <ThemeToggle />
        </div>
      </nav>
    );
}
