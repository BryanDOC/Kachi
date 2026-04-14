'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FixedExpenseWithRelations } from '@/types';

export function useFixedExpenses() {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpenseWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFixedExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('fixed_expenses')
        .select(
          `
          *,
          currencies(*),
          categories(*)
        `
        )
        .order('is_active', { ascending: false })
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setFixedExpenses(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFixedExpenses();
  }, [fetchFixedExpenses]);

  const totalActiveAmount = fixedExpenses
    .filter((fe) => fe.is_active)
    .reduce((sum, fe) => sum + fe.amount, 0);

  return {
    fixedExpenses,
    isLoading,
    error,
    refetch: fetchFixedExpenses,
    totalActiveAmount,
  };
}
