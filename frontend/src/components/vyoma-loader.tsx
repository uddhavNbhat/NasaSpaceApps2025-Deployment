"use client";
import { useEffect, useState } from "react";

export default function VyomaLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800); // 1.8s splash
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-blue-900 to-indigo-900 animate-fade-in">
        <h1 className="text-6xl font-extrabold tracking-tight text-white mb-4 animate-pulse drop-shadow-lg">vyoma</h1>
        <div className="flex items-end gap-2 h-10 mb-2">
          <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce-dot" style={{animationDelay: '0ms'}}></span>
          <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce-dot" style={{animationDelay: '150ms'}}></span>
          <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce-dot" style={{animationDelay: '300ms'}}></span>
        </div>
        <span className="text-white/80 text-lg tracking-wide">Loading...</span>
      </div>
    );
  }
  return <>{children}</>;
}
