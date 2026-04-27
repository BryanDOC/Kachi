'use client';

import { useFixedExpenses } from '@/lib/hooks/useFixedExpenses';
import { getUpcomingExpenses, UpcomingExpenseItem } from '@/lib/utils/upcomingExpenses';

export function useUpcomingFixedExpenses(windowDays = 7): {
  upcoming: UpcomingExpenseItem[];
  isLoading: boolean;
} {
  const { fixedExpenses, isLoading } = useFixedExpenses();
  const upcoming = isLoading ? [] : getUpcomingExpenses(fixedExpenses, windowDays);
  return { upcoming, isLoading };
}
