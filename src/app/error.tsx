"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-body selection:bg-accent-cyan selection:text-black">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-neutral-800 space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono text-rose-400 uppercase tracking-widest block mb-1">
            CONEXIÓN / RENDER ERROR
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">
            OCURRIÓ UN INCONVENIENTE
          </h1>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Verifica que la variable <code className="text-accent-cyan font-mono bg-neutral-900 px-1 py-0.5 rounded">DATABASE_URL</code> esté agregada en el panel de Vercel.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="btn-pill bg-white text-black font-bold text-xs hover:bg-accent-cyan transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
          <Link
            href="/dashboard"
            className="btn-pill glass-panel text-white font-medium text-xs border border-neutral-700 hover:border-accent-pink transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Panel Admin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
