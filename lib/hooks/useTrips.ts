'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trip } from '@/types';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrips = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTrips(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const activeTrips = trips.filter((t) => t.status === 'active');
  const completedTrips = trips.filter((t) => t.status === 'completed');
  const cancelledTrips = trips.filter((t) => t.status === 'cancelled');

  return {
    trips,
    activeTrips,
    completedTrips,
    cancelledTrips,
    isLoading,
    error,
    refetch: fetchTrips,
  };
}

export function useTrip(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrip = useCallback(async () => {
    if (!tripId) return;

    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (fetchError) throw fetchError;

      setTrip(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  return {
    trip,
    isLoading,
    error,
    refetch: fetchTrip,
  };
}

import { TransactionWithRelations } from '@/types';

export function useTripTransactions(tripId: string, version?: number) {
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!tripId) return;

    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select(
          `
          *,
          categories(*),
          currencies(*),
          transaction_tags(subcategories(*))
        `
        )
        .eq('trip_id', tripId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTransactions((data as unknown as TransactionWithRelations[]) || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTransactions, version]);

  const totalSpent = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const byCategory = transactions
    .filter((t) => t.type === 'expense' && t.categories)
    .reduce(
      (acc, t) => {
        const catId = t.categories!.id;
        if (!acc[catId]) {
          acc[catId] = {
            id: catId,
            name: t.categories!.name,
            color: t.categories!.color || '#6b7280',
            total: 0,
          };
        }
        acc[catId].total += t.amount;
        return acc;
      },
      {} as Record<string, { id: string; name: string; color: string; total: number }>
    );

  return {
    transactions,
    totalSpent,
    byCategory: Object.values(byCategory),
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}
