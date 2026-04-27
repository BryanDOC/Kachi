'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useBudgetAlerts } from './BudgetAlertsProvider';
import { formatCurrency } from '@/lib/utils/currency';

export function BudgetAlerts() {
  const { alerts, dismissedIds, dismiss } = useBudgetAlerts();
  const visible = alerts.filter((a) => !dismissedIds.has(a.categoryId));

  if (!visible.length) return null;

  return (
    <div className="px-8 lg:px-12 space-y-2 mb-1">
      <AnimatePresence initial={false}>
        {visible.map((alert) => (
          <motion.div
            key={alert.categoryId}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm overflow-hidden ${
              alert.pct >= 100
                ? 'bg-red-950/60 border-red-700/50 text-red-300'
                : 'bg-yellow-950/60 border-yellow-700/50 text-yellow-300'
            }`}
          >
            <span>
              {alert.pct >= 100
                ? `¡Superaste el presupuesto de ${alert.categoryName}! (${formatCurrency(alert.spent, 'PEN')} de ${formatCurrency(alert.limit, 'PEN')})`
                : `Estás al ${Math.round(alert.pct)}% de tu presupuesto de ${alert.categoryName} este mes`}
            </span>
            <button
              onClick={() => dismiss(alert.categoryId)}
              className="ml-4 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
