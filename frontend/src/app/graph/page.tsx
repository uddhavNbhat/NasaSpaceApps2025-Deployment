
"use client";

import dynamic from "next/dynamic";

const KnowledgeGraph3D = dynamic(() => import("./KnowledgeGraph3D"), { ssr: false });

export default function KnowledgeGraphPage() {
  return (
    <main className="max-w-[95vw] mx-auto py-8 px-4 sm:px-8 bg-gray-100/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 my-4 sm:my-8 flex flex-col items-center" style={{boxShadow: '0 4px 24px 0 rgba(80, 80, 120, 0.10), 0 1.5px 6px 0 rgba(120, 120, 180, 0.08)'}}>
  <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black italic tracking-tight mb-4 sm:mb-8 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl leading-tight pb-2" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>Knowledge Graph</h1>
      <p className="mb-4 sm:mb-6 text-base sm:text-lg font-medium text-muted-foreground bg-white/60 dark:bg-black/30 rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-md backdrop-blur-md text-center" style={{fontFamily: 'Inter, ui-sans-serif, system-ui'}}>Visualize relationships between experiments, topics, and results. Interact with the 3D NASA Knowledge Graph below.</p>
      <style jsx global>{`
        .graph-tooltip {
          max-width: 320px;
          white-space: pre-line;
          word-break: break-word;
          font-size: 1rem;
          line-height: 1.4;
          padding: 0.5em 0.75em;
          background: rgba(30,30,40,0.95);
          color: #fff;
          border-radius: 0.5em;
          box-shadow: 0 2px 12px 0 rgba(0,0,0,0.18);
          pointer-events: none;
        }
      `}</style>
      <div className="w-full flex-1 flex items-center justify-center">
        <KnowledgeGraph3D />
      </div>
    </main>
  );
}
