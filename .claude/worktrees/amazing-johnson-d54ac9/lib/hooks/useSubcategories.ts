'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Subcategory } from '@/types';

export function useSubcategories(categoryId: string | null) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    const fetchSubcategories = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from('subcategories')
          .select('*')
          .eq('category_id', categoryId)
          .order('name');

        if (fetchError) throw fetchError;

        setSubcategories(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubcategories();
  }, [categoryId]);

  return {
    subcategories,
    isLoading,
    error,
  };
}
