"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
  <main className="max-w-xl mx-auto py-16 px-4 text-center bg-gray-100/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 my-8" style={{boxShadow: '0 4px 24px 0 rgba(80, 80, 120, 0.10), 0 1.5px 6px 0 rgba(120, 120, 180, 0.08)'}}>
      <h1 className="text-4xl font-black italic tracking-tight mb-4 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>404 - Page Not Found</h1>
      <p className="mb-6 text-lg font-medium text-muted-foreground bg-white/60 dark:bg-black/30 rounded-xl px-6 py-4 shadow-md backdrop-blur-md" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>Sorry, the page you are looking for does not exist.</p>
      <Link href="/">
        <Button className="rounded-2xl shadow-md hover:bg-blue-50/60 hover:text-blue-700 transition-all duration-200" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>Go Home</Button>
      </Link>
    </main>
  );
}
