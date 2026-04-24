'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TransactionWithRelations } from '@/types';

interface UseTransactionsOptions {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'expense' | 'income' | 'all';
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('transactions')
        .select(
          `
          *,
          currencies(*),
          categories(*),
          transaction_tags(subcategories(*)),
          trips(*)
        `
        )
        .order('date', { ascending: false });

      if (options.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('date', options.endDate);
      }

      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options.type && options.type !== 'all') {
        query = query.eq('type', options.type);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setTransactions(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [options.startDate, options.endDate, options.categoryId, options.type]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}
