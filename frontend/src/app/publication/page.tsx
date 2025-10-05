"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PublicationPage() {
  // Placeholder for publication details
  return (
  <main className="max-w-2xl mx-auto py-16 px-4 bg-gray-100/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 my-8" style={{boxShadow: '0 4px 24px 0 rgba(80, 80, 120, 0.10), 0 1.5px 6px 0 rgba(120, 120, 180, 0.08)'}}>
      <div className="bg-white/80 dark:bg-black/30 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-black italic tracking-tight mb-4 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>Publication Title</h2>
        <p className="mb-2 text-lg font-medium text-muted-foreground bg-white/60 dark:bg-black/20 rounded-xl px-4 py-2 shadow-md backdrop-blur-md" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>Summary and experiment details will appear here.</p>
        <div className="mb-4 text-base" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>AI-generated insights, related publications, and knowledge graph visualization coming soon.</div>
        <Link href="/search" className="text-blue-600 hover:underline" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}> Back to Search</Link>
      </div>
    </main>
  );
}
