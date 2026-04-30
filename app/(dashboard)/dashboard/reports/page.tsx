'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useUI } from '@/lib/context/ui-context';
import { useCategories } from '@/lib/hooks/useCategories';
import { formatCurrency } from '@/lib/utils/currency';
import { getMonthDateRange, getQuarterDateRange, getYearDateRange } from '@/lib/utils/date';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { X, Tag } from 'lucide-react';
import { TransactionWithRelations } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';

const ACTIVE_STYLE = { background: 'var(--card-bg)' } as const;

type Period = 'month' | 'quarter' | 'year' | 'custom';

const PERIOD_LABELS: Record<Period, string> = {
  month: 'Este mes',
  quarter: 'Trimestre',
  year: 'Este año',
  custom: 'Custom',
};

const FALLBACK_COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6',
  '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#14b8a6',
];

function getDateRange(period: Period, customStart?: string, customEnd?: string) {
  if (period === 'month') return getMonthDateRange();
  if (period === 'quarter') return getQuarterDateRange();
  if (period === 'year') return getYearDateRange();
  if (customStart && customEnd) return { start: customStart, end: customEnd };
  return getMonthDateRange();
}

function getTxTagIds(t: TransactionWithRelations): string[] {
  const ids: string[] = [];
  t.transaction_tags?.forEach((tt) => {
    if (tt.subcategories) ids.push(tt.subcategories.id);
  });
  if (t.subcategories) ids.push(t.subcategories.id);
  return ids.filter((id, i) => ids.indexOf(id) === i);
}

function getTxTagNames(t: TransactionWithRelations): string[] {
  const names: string[] = [];
  t.transaction_tags?.forEach((tt) => {
    if (tt.subcategories) names.push(tt.subcategories.name);
  });
  if (t.subcategories && !names.includes(t.subcategories.name)) names.push(t.subcategories.name);
  return names;
}

export default function ReportsPage() {
  const { txVersion } = useUI();
  const [period, setPeriod] = useState<Period>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const { start, end } = useMemo(
    () => getDateRange(period, customStart, customEnd),
    [period, customStart, customEnd]
  );

  const { transactions, isLoading } = useTransactions({
    startDate: start,
    endDate: end,
    version: txVersion,
  });
  const { categories } = useCategories();

  const expenses = useMemo(() => transactions.filter((t) => t.type === 'expense'), [transactions]);
  const incomeList = useMemo(() => transactions.filter((t) => t.type === 'income'), [transactions]);
  const totalExpenses = useMemo(() => expenses.reduce((s, t) => s + t.amount, 0), [expenses]);
  const totalIncome = useMemo(() => incomeList.reduce((s, t) => s + t.amount, 0), [incomeList]);

  const defaultCurrency = transactions[0]?.currencies?.code || 'PEN';
  const fmt = (v: number) => formatCurrency(v, defaultCurrency);

  // Category breakdown data (all expenses, no filter)
  const categoryData = useMemo(() => {
    const map: Record<string, { id: string; name: string; value: number; color: string }> = {};
    expenses.forEach((t) => {
      const cat = t.categories;
      if (!cat) return;
      if (!map[cat.id]) {
        map[cat.id] = {
          id: cat.id,
          name: cat.name,
          value: 0,
          color: cat.color || FALLBACK_COLORS[Object.keys(map).length % FALLBACK_COLORS.length],
        };
      }
      map[cat.id].value += t.amount;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Expenses filtered only by category (for tag totals)
  const categoryFilteredExpenses = useMemo(
    () => expenses.filter((t) => !selectedCategoryId || t.category_id === selectedCategoryId),
    [expenses, selectedCategoryId]
  );

  // All unique tags appearing in categoryFilteredExpenses
  const availableTags = useMemo(() => {
    const map: Record<string, { id: string; name: string }> = {};
    categoryFilteredExpenses.forEach((t) => {
      t.transaction_tags?.forEach((tt) => {
        if (tt.subcategories && !map[tt.subcategories.id]) {
          map[tt.subcategories.id] = { id: tt.subcategories.id, name: tt.subcategories.name };
        }
      });
      if (t.subcategories && !map[t.subcategories.id]) {
        map[t.subcategories.id] = { id: t.subcategories.id, name: t.subcategories.name };
      }
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryFilteredExpenses]);

  // Expenses filtered by category + tags (union on tags)
  const filteredExpenses = useMemo(() => {
    if (selectedTagIds.length === 0) return categoryFilteredExpenses;
    return categoryFilteredExpenses.filter((t) =>
      getTxTagIds(t).some((id) => selectedTagIds.includes(id))
    );
  }, [categoryFilteredExpenses, selectedTagIds]);

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((s, t) => s + t.amount, 0),
    [filteredExpenses]
  );

  // Per-tag totals from categoryFilteredExpenses (independent of tag filter)
  const tagBreakdown = useMemo(() => {
    const map: Record<string, { id: string; name: string; total: number }> = {};
    categoryFilteredExpenses.forEach((t) => {
      getTxTagIds(t).forEach((tagId) => {
        const tag = availableTags.find((at) => at.id === tagId);
        if (!tag) return;
        if (!map[tagId]) map[tagId] = { id: tagId, name: tag.name, total: 0 };
        map[tagId].total += t.amount;
      });
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [categoryFilteredExpenses, availableTags]);

  const hasFilters = selectedCategoryId !== null || selectedTagIds.length > 0;

  const toggleTag = (id: string) =>
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const selectCategory = (id: string | null) => {
    setSelectedCategoryId(id);
    setSelectedTagIds([]);
  };

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedTagIds([]);
  };

  const inputDateClass =
    'flex-1 px-3 py-2 bg-bg-input border border-border rounded-[12px] text-[13px] text-text1 focus:outline-none focus:border-border-focus transition-colors';

  return (
    <div className="space-y-4">
      <PageHeader title="Reportes" subtitle="Análisis de tus gastos" />

      {/* Period selector */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none -mx-4 px-4">
        {(['month', 'quarter', 'year', 'custom'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={period === p ? ACTIVE_STYLE : undefined}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-colors',
              period === p
                ? 'text-bg'
                : 'bg-bg-input border border-border text-text2 hover:border-border-focus'
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="flex gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className={inputDateClass}
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className={inputDateClass}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-[84px] bg-bg-input rounded-[20px]" />
            <div className="h-[84px] bg-bg-input rounded-[20px]" />
          </div>
          <div className="h-[80px] bg-bg-input rounded-[20px]" />
          <div className="h-[320px] bg-bg-input rounded-[20px]" />
        </div>
      ) : (
      <>
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-input/50 border border-border rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text3 mb-1.5">
            Gastos
          </p>
          <p className="text-[20px] font-bold text-text1 leading-none">{fmt(totalExpenses)}</p>
        </div>
        <div className="bg-bg-input/50 border border-border rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text3 mb-1.5">
            Ingresos
          </p>
          <p className="text-[20px] font-bold text-[#10b981] leading-none">{fmt(totalIncome)}</p>
        </div>
      </div>

      {/* Category filter */}
      <section className="bg-bg-input/50 border border-border rounded-[20px] p-4 space-y-3">
        <span className="text-[13px] font-semibold text-text1">Categorías</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => selectCategory(null)}
            style={!selectedCategoryId ? ACTIVE_STYLE : undefined}
            className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors',
              !selectedCategoryId
                ? 'text-bg'
                : 'bg-bg-input border border-border text-text2 hover:border-border-focus'
            )}
          >
            Todas
          </button>
          {categories.map((cat) => {
            const catData = categoryData.find((c) => c.id === cat.id);
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => selectCategory(isActive ? null : cat.id)}
                style={isActive ? ACTIVE_STYLE : undefined}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors',
                  isActive
                    ? 'text-bg'
                    : 'bg-bg-input border border-border text-text2 hover:border-border-focus'
                )}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color || '#888' }}
                />
                {cat.name}
                {catData && (
                  <span className={cn('text-[11px]', isActive ? 'opacity-70' : 'text-text3')}>
                    {fmt(catData.value)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tag filter */}
      {availableTags.length > 0 && (
        <section className="bg-bg-input/50 border border-border rounded-[20px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-text1 flex items-center gap-2">
              <Tag size={13} className="text-accent" />
              Tags
            </span>
            {selectedTagIds.length > 0 && (
              <button
                onClick={() => setSelectedTagIds([])}
                className="text-[12px] text-text3 hover:text-text2 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isActive = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  style={isActive ? ACTIVE_STYLE : undefined}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors',
                    isActive
                      ? 'text-bg'
                      : 'bg-bg-input border border-border text-text2 hover:border-border-focus'
                  )}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Filtered result card */}
      {hasFilters && (
        <div className="bg-bg-input/50 border border-border rounded-[20px] p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text3">
              {selectedTagIds.length > 0
                ? `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? 's' : ''} seleccionado${selectedTagIds.length > 1 ? 's' : ''}`
                : categories.find((c) => c.id === selectedCategoryId)?.name}
            </p>
            <p className="text-[22px] font-bold text-text1 mt-0.5 leading-none">{fmt(filteredTotal)}</p>
            <p className="text-[12px] text-text3 mt-1">
              {filteredExpenses.length} transacción{filteredExpenses.length !== 1 ? 'es' : ''}
              {totalExpenses > 0 &&
                ` · ${((filteredTotal / totalExpenses) * 100).toFixed(1)}% del total`}
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="p-2 bg-bg-input border border-border rounded-[10px] text-text3 hover:text-text2 hover:border-border-focus transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Category breakdown — shown when no specific category selected */}
      {!selectedCategoryId && categoryData.length > 0 && (
        <section className="bg-bg-input/50 border border-border rounded-[20px] p-4 space-y-4">
          <h2 className="text-[13px] font-semibold text-text1">Por categoría</h2>

          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="72%"
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const e = payload[0];
                    const pct =
                      totalExpenses > 0
                        ? (((e.value as number) / totalExpenses) * 100).toFixed(1)
                        : '0';
                    return (
                      <div className="bg-bg-input border border-border rounded-[12px] p-2.5 shadow-xl">
                        <p className="text-[13px] font-medium text-text1">{e.name}</p>
                        <p className="text-[12px] text-text2">
                          {fmt(e.value as number)} · {pct}%
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] text-text3">Total</p>
              <p className="text-[14px] font-bold text-text1">{fmt(totalExpenses)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {categoryData.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[13px] text-text1 truncate">{cat.name}</span>
                    <span className="text-[13px] font-semibold text-text1 flex-shrink-0">
                      {fmt(cat.value)}
                    </span>
                  </div>
                  <div className="h-1 bg-bg-input rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-[11px] text-text3 w-8 text-right flex-shrink-0">
                  {totalExpenses > 0 ? ((cat.value / totalExpenses) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tag breakdown */}
      {tagBreakdown.length > 0 && (
        <section className="bg-bg-input/50 border border-border rounded-[20px] p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-text1">Por tag</h2>
          <div className="space-y-3">
            {tagBreakdown.map((tag) => {
              const base = selectedCategoryId
                ? categoryFilteredExpenses.reduce((s, t) => s + t.amount, 0)
                : totalExpenses;
              const pct = base > 0 ? (tag.total / base) * 100 : 0;
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <div key={tag.id} className="flex items-center gap-3">
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0" />
                  )}
                  {!isSelected && <div className="w-2.5 h-2.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={cn(
                          'text-[13px] truncate',
                          isSelected ? 'text-text1 font-medium' : 'text-text2'
                        )}
                      >
                        {tag.name}
                      </span>
                      <span className="text-[13px] font-semibold text-text1 flex-shrink-0">
                        {fmt(tag.total)}
                      </span>
                    </div>
                    <div className="h-1 bg-bg-input rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isSelected ? 'bg-accent' : 'bg-text3/40'
                        )}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-text3 w-8 text-right flex-shrink-0">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filtered transactions list (when tags selected) */}
      {selectedTagIds.length > 0 && filteredExpenses.length > 0 && (
        <section className="bg-bg-input/50 border border-border rounded-[20px] p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-text1">
            Transacciones ({filteredExpenses.length})
          </h2>
          <div className="space-y-2">
            {filteredExpenses.map((t) => {
              const tagNames = getTxTagNames(t);
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-text1 truncate">{t.description}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {t.categories && (
                        <span className="text-[11px] text-text3">{t.categories.name}</span>
                      )}
                      {tagNames.map((name) => (
                        <span
                          key={name}
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                            selectedTagIds.some(
                              (id) => availableTags.find((at) => at.id === id)?.name === name
                            )
                              ? 'bg-accent/15 text-accent'
                              : 'bg-bg-input text-text3'
                          )}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-semibold text-text1">{fmt(t.amount)}</p>
                    <p className="text-[11px] text-text3">{t.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {expenses.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-[14px] text-text3">Sin gastos en este período</p>
        </div>
      )}
      </>
      )}
    </div>
  );
}
