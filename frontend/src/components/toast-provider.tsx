"use client";
import { useState, useCallback, createContext, useContext } from "react";

interface Toast {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
}

const ToastContext = createContext<{
  showToast: (message: string, type?: Toast["type"]) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type?: Toast["type"]) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[9999] flex flex-col gap-3 items-center pointer-events-none" style={{transform: 'translateX(-50%)'}}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-2xl shadow-xl text-base font-semibold animate-toast-in bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 pointer-events-auto transition-all duration-300 ${toast.type === "error" ? "text-red-600 border-red-200 dark:border-red-700" : "text-indigo-600 border-indigo-200 dark:border-indigo-700"}`}
            style={{minWidth: 180, maxWidth: 320, letterSpacing: 0.01}}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes toast-in {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          60% { opacity: 1; transform: translateY(-6px) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast-in {
          animation: toast-in 0.7s cubic-bezier(.22,1,.36,1) both;
        }
      `}</style>
    </ToastContext.Provider>
  );
}
