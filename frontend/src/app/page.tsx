"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] text-center fade-in bg-gray-100/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl mx-2 sm:mx-4 my-4 sm:my-8 p-4 sm:p-8 border border-white/30" style={{boxShadow: '0 4px 24px 0 rgba(80, 80, 120, 0.10), 0 1.5px 6px 0 rgba(120, 120, 180, 0.08)'}}>
      <h1
        className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-extrabold italic bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 drop-shadow-lg"
        style={{
          fontFamily: 'Inter, ui-sans-serif, system-ui',
          lineHeight: 1.15,
          paddingBottom: '0.15em',
        }}
      >
        Welcome to vyoma
      </h1>
      <p className="text-base xs:text-lg md:text-2xl text-muted-foreground max-w-xl sm:max-w-2xl mb-6 sm:mb-8 bg-white/60 dark:bg-black/30 rounded-xl px-3 sm:px-6 py-3 sm:py-4 shadow-md backdrop-blur-md" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
        {"Enable a new era of human space exploration! Discover, search, and visualize NASA's bioscience experiments and publications with AI-powered insights and knowledge graphs."}
      </p>
      <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
        <Link href="/search">
          <Button size="lg" className="rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg hover:brightness-110 hover:scale-105 transition-all duration-200" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
            Explore Publications
          </Button>
        </Link>
        <Link href="/graph">
          <Button variant="outline" size="lg" className="rounded-2xl shadow-md hover:bg-blue-50/60 hover:text-blue-700 transition-all duration-200" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
            Knowledge Graph
          </Button>
        </Link>
      </div>
    </main>
  );
}