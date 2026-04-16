'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useFixedExpenses } from '@/lib/hooks/useFixedExpenses';
import { getMonthDateRange } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Plus, Clock, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';

function daysUntilBilling(billingDay: number): number {
  const today = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  if (billingDay >= today) return billingDay - today;
  return daysInMonth - today + billingDay;
}

export default function DashboardPage() {
  const { start, end } = getMonthDateRange();
  const { transactions, isLoading } = useTransactions({ startDate: start, endDate: end });
  const { fixedExpenses } = useFixedExpenses();

  const upcomingFixed = useMemo(() => {
    return fixedExpenses
      .filter((fe) => fe.is_active && fe.billing_day !== null && daysUntilBilling(fe.billing_day) <= 5)
      .sort((a, b) => daysUntilBilling(a.billing_day!) - daysUntilBilling(b.billing_day!));
  }, [fixedExpenses]);

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const recentTransactions = transactions.slice(0, 10);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Dashboard</h1>
          <p className="text-zinc-400">Resumen del mes actual</p>
        </div>
        <Link
          href="/dashboard/transactions/new"
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
        >
          <Plus size={20} />
          Nuevo gasto
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-900/40 to-green-950/40 border border-green-800/50 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <h3 className="text-zinc-400 text-sm font-medium">Ingresos</h3>
          </div>
          <p className="text-3xl font-serif font-bold text-white">
            {formatCurrency(income, 'PEN')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-900/40 to-red-950/40 border border-red-800/50 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <TrendingDown className="text-red-400" size={24} />
            </div>
            <h3 className="text-zinc-400 text-sm font-medium">Gastos</h3>
          </div>
          <p className="text-3xl font-serif font-bold text-white">
            {formatCurrency(expenses, 'PEN')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'bg-gradient-to-br rounded-xl p-6 border',
            balance >= 0
              ? 'from-amber-900/40 to-amber-950/40 border-amber-800/50'
              : 'from-zinc-900/40 to-zinc-950/40 border-zinc-800/50'
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn('p-3 rounded-lg', balance >= 0 ? 'bg-amber-500/20' : 'bg-zinc-500/20')}
            >
              <DollarSign className={balance >= 0 ? 'text-amber-400' : 'text-zinc-400'} size={24} />
            </div>
            <h3 className="text-zinc-400 text-sm font-medium">Balance</h3>
          </div>
          <p
            className={cn(
              'text-3xl font-serif font-bold',
              balance >= 0 ? 'text-white' : 'text-zinc-400'
            )}
          >
            {formatCurrency(balance, 'PEN')}
          </p>
        </motion.div>
      </div>

      {/* Fixed expense reminders */}
      {upcomingFixed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-zinc-900 border border-amber-800/40 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-amber-500" />
            <h2 className="text-base font-semibold text-white">Gastos fijos próximos</h2>
            <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-medium">
              {upcomingFixed.length}
            </span>
          </div>
          <div className="space-y-2">
            {upcomingFixed.map((fe) => {
              const days = daysUntilBilling(fe.billing_day!);
              return (
                <div
                  key={fe.id}
                  className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Clock
                      size={14}
                      className={days === 0 ? 'text-red-400' : days <= 2 ? 'text-amber-400' : 'text-zinc-500'}
                    />
                    <span className="text-sm text-zinc-200">{fe.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500">
                      {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} días`}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(fe.amount, fe.currencies?.code || 'PEN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/dashboard/fixed"
            className="block mt-3 text-xs text-zinc-500 hover:text-amber-500 transition-colors"
          >
            Ver todos los gastos fijos →
          </Link>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Transacciones recientes</h2>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">No hay transacciones este mes</p>
            <Link
              href="/dashboard/transactions/new"
              className="inline-block mt-4 text-amber-500 hover:text-amber-400 font-medium"
            >
              Crear primera transacción
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-zinc-500">{formatDate(transaction.date)}</p>
                    {transaction.categories && (
                      <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
                        {transaction.categories.name}
                      </span>
                    )}
                  </div>
                </div>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, transaction.currencies?.code || 'PEN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
