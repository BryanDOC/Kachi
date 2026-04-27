'use client';

import { useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function GlobalError({
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
    <html>
      <body className="bg-[#0A0A0A]">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Algo salió mal</h2>
            <p className="text-zinc-400 text-sm">
              {error.message || 'Ocurrió un error inesperado'}
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium"
            >
              <RefreshCw size={16} />
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
