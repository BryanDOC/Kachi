'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBudgetAlerts } from './BudgetAlertsProvider';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { alerts, dismissedIds, dismiss, dismissAll } = useBudgetAlerts();
  const active = alerts.filter((a) => !dismissedIds.has(a.categoryId));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {active.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold leading-none"
          >
            {active.length > 9 ? '9+' : active.length}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-50 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-white">
                  Notificaciones
                  {active.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-zinc-500">
                      {active.length} activa{active.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  {active.length > 0 && (
                    <button
                      onClick={dismissAll}
                      className="text-xs text-zinc-500 hover:text-amber-500 transition-colors"
                    >
                      Marcar todo leído
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {active.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={28} className="mx-auto text-zinc-700 mb-3" />
                  <p className="text-zinc-500 text-sm">Sin notificaciones pendientes</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/50">
                  {active.map((alert) => (
                    <div
                      key={alert.categoryId}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/40 transition-colors"
                    >
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full flex-shrink-0 mt-1.5',
                          alert.pct >= 100 ? 'bg-red-500' : 'bg-yellow-500'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm leading-snug',
                            alert.pct >= 100 ? 'text-red-300' : 'text-yellow-300'
                          )}
                        >
                          {alert.pct >= 100
                            ? `¡Superaste el presupuesto de ${alert.categoryName}!`
                            : `${Math.round(alert.pct)}% del presupuesto de ${alert.categoryName}`}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {formatCurrency(alert.spent, 'PEN')} /{' '}
                          {formatCurrency(alert.limit, 'PEN')}
                        </p>
                      </div>
                      <button
                        onClick={() => dismiss(alert.categoryId)}
                        className="text-zinc-600 hover:text-zinc-400 flex-shrink-0 mt-0.5 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
