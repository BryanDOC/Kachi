'use client';

import { useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Error al cargar la página</h2>
        <p className="text-zinc-400 text-sm">
          {error.message || 'Ocurrió un error inesperado'}
          {error.digest && (
            <span className="block mt-1 text-xs text-zinc-600">Código: {error.digest}</span>
          )}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium text-sm"
          >
            <RefreshCw size={15} />
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
          >
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
