'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { UpcomingExpensesSection } from '@/components/dashboard/UpcomingExpensesSection';
import { RecentTransactionsSection, Transaction } from '@/components/dashboard/RecentTransactionsSection';
import { useUI } from '@/lib/context/ui-context';
import { useUpcomingFixedExpenses } from '@/lib/hooks/useUpcomingFixedExpenses';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { openTxSheet, txVersion } = useUI();
  const { upcoming } = useUpcomingFixedExpenses();

  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
  const lastMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');
  const lastMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const today = format(now, 'yyyy-MM-dd');
  const lastWeekStart = format(startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const lastWeekEnd = format(endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { transactions: allRecent, isLoading } = useTransactions({
    startDate: lastMonthStart,
    version: txVersion,
  });

  const currencyCode = allRecent.find((t) => t.currencies?.code)?.currencies?.code ?? 'PEN';
  const fmt = (v: number) => formatCurrency(v, currencyCode);

  const thisMonth = useMemo(
    () => allRecent.filter((t) => t.date >= monthStart && t.date <= monthEnd),
    [allRecent, monthStart, monthEnd]
  );
  const lastMonthTxs = useMemo(
    () => allRecent.filter((t) => t.date >= lastMonthStart && t.date <= lastMonthEnd),
    [allRecent, lastMonthStart, lastMonthEnd]
  );
  const thisWeekTxs = useMemo(
    () => allRecent.filter((t) => t.date >= weekStart && t.date <= today),
    [allRecent, weekStart, today]
  );
  const lastWeekTxs = useMemo(
    () => allRecent.filter((t) => t.date >= lastWeekStart && t.date <= lastWeekEnd),
    [allRecent, lastWeekStart, lastWeekEnd]
  );

  const balance = useMemo(
    () =>
      thisMonth.reduce((acc, tx) => (tx.type === 'income' ? acc + tx.amount : acc - tx.amount), 0),
    [thisMonth]
  );
  const thisMonthExp = useMemo(
    () => thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [thisMonth]
  );
  const lastMonthExp = useMemo(
    () => lastMonthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [lastMonthTxs]
  );
  const thisWeekExp = useMemo(
    () => thisWeekTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [thisWeekTxs]
  );
  const lastWeekExp = useMemo(
    () => lastWeekTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [lastWeekTxs]
  );

  const expDiffPct = lastMonthExp > 0 ? ((thisMonthExp - lastMonthExp) / lastMonthExp) * 100 : null;
  const weekDiffPct = lastWeekExp > 0 ? ((thisWeekExp - lastWeekExp) / lastWeekExp) * 100 : null;

  const period = format(now, 'MMMM yyyy', { locale: es });

  const recentTransactions: Transaction[] = thisMonth.slice(0, 5).map((tx) => ({
    id: tx.id,
    description: tx.description,
    date: formatDate(tx.date, 'd MMM'),
    category: tx.categories?.name,
    iconName: tx.categories?.icon ?? null,
    amount: fmt(tx.amount),
    type: tx.type as 'income' | 'expense',
  }));

  const showSkeleton = isLoading && allRecent.length === 0;

  return (
    <div className="space-y-5 max-w-lg mx-auto lg:max-w-none">
      <BalanceCard balance={isLoading ? '...' : fmt(balance)} period={period} />

      {showSkeleton ? (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
          <div className="h-[88px] bg-bg-input rounded-[20px]" />
          <div className="h-[88px] bg-bg-input rounded-[20px]" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-input/50 border border-border rounded-[20px] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text3 mb-2">
              Este mes
            </p>
            <p className="text-[18px] font-bold text-text1 leading-none tabular-nums">
              {fmt(thisMonthExp)}
            </p>
            {expDiffPct !== null ? (
              <div className="flex items-center gap-1 mt-2">
                {expDiffPct > 0 ? (
                  <TrendingUp size={11} className="text-[#FF6B6B] flex-shrink-0" />
                ) : (
                  <TrendingDown size={11} className="text-[#10b981] flex-shrink-0" />
                )}
                <span
                  className={cn(
                    'text-[11px] font-medium',
                    expDiffPct > 0 ? 'text-[#FF6B6B]' : 'text-[#10b981]'
                  )}
                >
                  {expDiffPct > 0 ? '+' : ''}
                  {expDiffPct.toFixed(1)}% vs anterior
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-text3 mt-2">{fmt(lastMonthExp)} mes ant.</p>
            )}
          </div>

          <div className="bg-bg-input/50 border border-border rounded-[20px] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text3 mb-2">
              Esta semana
            </p>
            <p className="text-[18px] font-bold text-text1 leading-none tabular-nums">
              {fmt(thisWeekExp)}
            </p>
            {weekDiffPct !== null ? (
              <div className="flex items-center gap-1 mt-2">
                {weekDiffPct > 0 ? (
                  <TrendingUp size={11} className="text-[#FF6B6B] flex-shrink-0" />
                ) : (
                  <TrendingDown size={11} className="text-[#10b981] flex-shrink-0" />
                )}
                <span
                  className={cn(
                    'text-[11px] font-medium',
                    weekDiffPct > 0 ? 'text-[#FF6B6B]' : 'text-[#10b981]'
                  )}
                >
                  {weekDiffPct > 0 ? '+' : ''}
                  {weekDiffPct.toFixed(1)}% vs sem. ant.
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-text3 mt-2">{fmt(lastWeekExp)} sem. ant.</p>
            )}
          </div>
        </div>
      )}

      <UpcomingExpensesSection expenses={upcoming} />
      <RecentTransactionsSection
        transactions={recentTransactions}
        isLoading={isLoading}
        onCreateClick={openTxSheet}
      />
    </div>
  );
}
