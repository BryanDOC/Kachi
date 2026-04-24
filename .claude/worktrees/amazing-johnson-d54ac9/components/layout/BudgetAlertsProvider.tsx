'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getMonthDateRange } from '@/lib/utils/date';
import { format } from 'date-fns';

export interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  spent: number;
  limit: number;
  pct: number;
}

interface BudgetAlertsContextType {
  alerts: BudgetAlert[];
  dismissedIds: Set<string>;
  dismiss: (categoryId: string) => void;
  dismissAll: () => void;
}

const BudgetAlertsContext = createContext<BudgetAlertsContextType>({
  alerts: [],
  dismissedIds: new Set(),
  dismiss: () => {},
  dismissAll: () => {},
});

export function useBudgetAlerts() {
  return useContext(BudgetAlertsContext);
}

const LS_KEY = 'budget_alerts_dismissed';

function loadDismissed(): Set<string> {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (!stored) return new Set();
    const { date, ids } = JSON.parse(stored);
    if (date === format(new Date(), 'yyyy-MM-dd')) return new Set<string>(ids as string[]);
  } catch {}
  return new Set();
}

function saveDismissed(ids: Set<string>) {
  localStorage.setItem(
    LS_KEY,
    JSON.stringify({ date: format(new Date(), 'yyyy-MM-dd'), ids: Array.from(ids) })
  );
}

export function BudgetAlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDismissedIds(loadDismissed());
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { start, end } = getMonthDateRange();

      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, budget_limit')
        .not('budget_limit', 'is', null)
        .gt('budget_limit', 0);

      if (!categories?.length) return;

      const { data: transactions } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('type', 'expense')
        .gte('date', start)
        .lte('date', end);

      const spendingMap: Record<string, number> = {};
      (transactions || []).forEach((t) => {
        if (t.category_id) spendingMap[t.category_id] = (spendingMap[t.category_id] || 0) + t.amount;
      });

      const newAlerts: BudgetAlert[] = [];
      categories.forEach((cat) => {
        const spent = spendingMap[cat.id] || 0;
        const pct = (spent / cat.budget_limit) * 100;
        if (pct >= 80) {
          newAlerts.push({ categoryId: cat.id, categoryName: cat.name, spent, limit: cat.budget_limit, pct });
        }
      });

      setAlerts(newAlerts.sort((a, b) => b.pct - a.pct));
    };
    fetch();
  }, []);

  const dismiss = useCallback((categoryId: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(categoryId);
      saveDismissed(next);
      return next;
    });
  }, []);

  const dismissAll = useCallback(() => {
    setDismissedIds((prev) => {
      const next = new Set([...Array.from(prev), ...alerts.map((a) => a.categoryId)]);
      saveDismissed(next);
      return next;
    });
  }, [alerts]);

  return (
    <BudgetAlertsContext.Provider value={{ alerts, dismissedIds, dismiss, dismissAll }}>
      {children}
    </BudgetAlertsContext.Provider>
  );
}
