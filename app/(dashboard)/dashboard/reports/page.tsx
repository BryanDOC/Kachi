'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useCategories } from '@/lib/hooks/useCategories';
import { formatCurrency } from '@/lib/utils/currency';
import { getMonthDateRange, getQuarterDateRange, getYearDateRange } from '@/lib/utils/date';
import { cn } from '@/lib/utils';
import {
  format,
  eachMonthOfInterval,
  eachWeekOfInterval,
  parseISO,
  isWithinInterval,
  endOfMonth,
  endOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
} from 'recharts';

type Period = 'month' | 'quarter' | 'year' | 'custom';

const PERIOD_LABELS: Record<Period, string> = {
  month: 'Este mes',
  quarter: 'Último trimestre',
  year: 'Este año',
  custom: 'Personalizado',
};

const DEFAULT_COLORS = [
  '#f59e0b',
  '#3b82f6',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#f97316',
  '#06b6d4',
  '#84cc16',
  '#ec4899',
  '#14b8a6',
];

function getDateRange(period: Period, customStart?: string, customEnd?: string) {
  if (period === 'month') return getMonthDateRange();
  if (period === 'quarter') return getQuarterDateRange();
  if (period === 'year') return getYearDateRange();
  if (customStart && customEnd) return { start: customStart, end: customEnd };
  return getMonthDateRange();
}

const CurrencyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
      <p className="text-zinc-400 text-xs mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }} className="text-sm font-medium">
          {entry.name}: {formatCurrency(entry.value, 'PEN')}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

  const { start, end } = useMemo(
    () => getDateRange(period, customStart, customEnd),
    [period, customStart, customEnd]
  );

  const { transactions, isLoading } = useTransactions({ startDate: start, endDate: end });
  const { categories } = useCategories();

  const expenses = useMemo(() => transactions.filter((t) => t.type === 'expense'), [transactions]);
  const incomeList = useMemo(() => transactions.filter((t) => t.type === 'income'), [transactions]);
  const totalExpenses = useMemo(() => expenses.reduce((s, t) => s + t.amount, 0), [expenses]);

  // A. Monthly Balance
  const monthlyData = useMemo(() => {
    try {
      const startDate = parseISO(start);
      const endDate = parseISO(end);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      return months.map((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const interval = { start: monthStart, end: monthEnd };
        const monthIncome = incomeList
          .filter((t) => isWithinInterval(parseISO(t.date), interval))
          .reduce((s, t) => s + t.amount, 0);
        const monthExpenses = expenses
          .filter((t) => isWithinInterval(parseISO(t.date), interval))
          .reduce((s, t) => s + t.amount, 0);
        return {
          month: format(monthStart, 'MMM', { locale: es }),
          Ingresos: monthIncome,
          Gastos: monthExpenses,
          Balance: monthIncome - monthExpenses,
        };
      });
    } catch {
      return [];
    }
  }, [expenses, incomeList, start, end]);

  // B. Donut chart data
  const categoryDonutData = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};
    expenses.forEach((t) => {
      const cat = t.categories;
      if (!cat) return;
      if (!map[cat.id]) {
        map[cat.id] = {
          name: cat.name,
          value: 0,
          color: cat.color || DEFAULT_COLORS[Object.keys(map).length % DEFAULT_COLORS.length],
        };
      }
      map[cat.id].value += t.amount;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // C. Category trend
  const trendCategories = useMemo(
    () => [...new Set(expenses.map((t) => t.categories?.name).filter(Boolean))] as string[],
    [expenses]
  );

  const categoryColors = useMemo(() => {
    const map: Record<string, string> = {};
    trendCategories.forEach((name, i) => {
      const cat = categories.find((c) => c.name === name);
      map[name] = cat?.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
    });
    return map;
  }, [trendCategories, categories]);

  const trendData = useMemo(() => {
    try {
      const startDate = parseISO(start);
      const endDate = parseISO(end);
      const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const useWeeks = diffDays <= 45;

      const buckets = useWeeks
        ? eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 })
        : eachMonthOfInterval({ start: startDate, end: endDate });

      return buckets.map((bucketStart, i) => {
        const bucketEnd = useWeeks
          ? endOfWeek(bucketStart, { weekStartsOn: 1 })
          : endOfMonth(bucketStart);
        const interval = { start: bucketStart, end: bucketEnd };
        const label = useWeeks
          ? `S${i + 1} ${format(bucketStart, 'dd/MM')}`
          : format(bucketStart, 'MMM', { locale: es });

        const entry: Record<string, string | number> = { period: label };
        trendCategories.forEach((name) => {
          entry[name] = expenses
            .filter(
              (t) =>
                t.categories?.name === name && isWithinInterval(parseISO(t.date), interval)
            )
            .reduce((s, t) => s + t.amount, 0);
        });
        return entry;
      });
    } catch {
      return [];
    }
  }, [expenses, trendCategories, start, end]);

  // D. Top tags
  const subcategoryData = useMemo(() => {
    const map: Record<string, { name: string; category: string; total: number }> = {};
    expenses.forEach((t) => {
      (t.transaction_tags || []).forEach(({ subcategories: sub }) => {
        if (!sub) return;
        if (!map[sub.id]) {
          map[sub.id] = { name: sub.name, category: t.categories?.name || '—', total: 0 };
        }
        map[sub.id].total += t.amount;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .map((row) => ({
        ...row,
        pct: totalExpenses > 0 ? (row.total / totalExpenses) * 100 : 0,
      }));
  }, [expenses, totalExpenses]);

  // E. Fixed vs Variable
  const fixedTotal = useMemo(
    () => expenses.filter((t) => t.fixed_expense_id).reduce((s, t) => s + t.amount, 0),
    [expenses]
  );
  const variableTotal = useMemo(
    () => expenses.filter((t) => !t.fixed_expense_id).reduce((s, t) => s + t.amount, 0),
    [expenses]
  );

  // Budget progress
  const budgetCategories = useMemo(
    () =>
      categories
        .filter((c) => c.budget_limit !== null && c.budget_limit > 0)
        .map((cat) => {
          const spent = expenses
            .filter((t) => t.category_id === cat.id)
            .reduce((s, t) => s + t.amount, 0);
          const pct = (spent / cat.budget_limit!) * 100;
          return { ...cat, spent, pct };
        }),
    [categories, expenses]
  );

  const toggleLine = (key: string) => {
    setHiddenLines((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const DonutTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    const pct = totalExpenses > 0 ? ((entry.value / totalExpenses) * 100).toFixed(1) : '0';
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
        <p className="text-white text-sm font-medium">{entry.name}</p>
        <p className="text-zinc-300 text-sm">{formatCurrency(entry.value, 'PEN')}</p>
        <p className="text-zinc-500 text-xs">{pct}% del total</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-zinc-900 rounded-lg animate-pulse w-48" />
        <div className="h-10 bg-zinc-900 rounded-lg animate-pulse w-96" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 bg-zinc-900 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Reportes</h1>
        <p className="text-zinc-400">Visualización de gastos e ingresos por período</p>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        {(['month', 'quarter', 'year', 'custom'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              period === p
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
            />
            <span className="text-zinc-500">—</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
            />
          </div>
        )}
      </div>

      {/* E. Fixed vs Variable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm mb-1">Gastos fijos</p>
          <p className="text-2xl font-serif font-bold text-white">
            {formatCurrency(fixedTotal, 'PEN')}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm mb-1">Gastos variables</p>
          <p className="text-2xl font-serif font-bold text-white">
            {formatCurrency(variableTotal, 'PEN')}
          </p>
        </div>
      </div>

      {/* A. Monthly Balance Bar Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Balance mensual</h2>
        {monthlyData.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">Sin datos para el período</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                axisLine={{ stroke: '#3f3f46' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                axisLine={{ stroke: '#3f3f46' }}
                tickLine={false}
                tickFormatter={(v) => `S/ ${v}`}
              />
              <Tooltip content={<CurrencyTooltip />} />
              <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
              <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={48} />
              <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={48} />
              <Line
                dataKey="Balance"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                type="monotone"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* B. Donut + C. Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* B. Category Donut */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Gastos por categoría</h2>
          {categoryDonutData.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">Sin gastos en el período</p>
          ) : (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius="52%"
                      outerRadius="78%"
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={2}
                    >
                      {categoryDonutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xs text-zinc-500">Total</p>
                  <p className="text-base font-bold text-white">
                    {formatCurrency(totalExpenses, 'PEN')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                {categoryDonutData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-zinc-400">{entry.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* C. Category Trend Line Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Tendencia por categoría</h2>
          {trendCategories.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">Sin gastos en el período</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={{ stroke: '#3f3f46' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={{ stroke: '#3f3f46' }}
                    tickLine={false}
                    tickFormatter={(v) => `S/ ${v}`}
                  />
                  <Tooltip content={<CurrencyTooltip />} />
                  {trendCategories.map((name) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={categoryColors[name]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: categoryColors[name] }}
                      hide={hiddenLines.has(name)}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4">
                {trendCategories.map((name) => (
                  <button
                    key={name}
                    onClick={() => toggleLine(name)}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-opacity hover:opacity-80',
                      hiddenLines.has(name) ? 'opacity-30' : 'opacity-100'
                    )}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: categoryColors[name] }}
                    />
                    <span className="text-zinc-400">{name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* D. Top Subcategories Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Top subcategorías</h2>
        {subcategoryData.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">Sin subcategorías en el período</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-3 text-left text-zinc-500 font-medium">Subcategoría</th>
                  <th className="pb-3 text-left text-zinc-500 font-medium">Categoría</th>
                  <th className="pb-3 text-right text-zinc-500 font-medium">Total</th>
                  <th className="pb-3 text-right text-zinc-500 font-medium">% del total</th>
                </tr>
              </thead>
              <tbody>
                {subcategoryData.map((row) => (
                  <tr
                    key={row.name}
                    className={cn(
                      'border-b border-zinc-800/50',
                      row.pct > 20 && 'bg-amber-500/5'
                    )}
                  >
                    <td className="py-3 text-white font-medium">
                      {row.name}
                      {row.pct > 20 && <span className="ml-2 text-amber-500 text-xs">▲</span>}
                    </td>
                    <td className="py-3 text-zinc-400">{row.category}</td>
                    <td className="py-3 text-right text-white">
                      {formatCurrency(row.total, 'PEN')}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          'font-medium',
                          row.pct > 20 ? 'text-amber-500' : 'text-zinc-400'
                        )}
                      >
                        {row.pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Budget progress bars */}
      {budgetCategories.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Progreso de presupuesto</h2>
          <div className="space-y-5">
            {budgetCategories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-300">{cat.name}</span>
                  <span className="text-sm text-zinc-500">
                    {formatCurrency(cat.spent, 'PEN')} / {formatCurrency(cat.budget_limit!, 'PEN')}
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      cat.pct < 60 ? 'bg-green-500' : cat.pct < 90 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(cat.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
