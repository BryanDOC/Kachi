'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Subcategory } from '@/types';

export function useTags() {
  const [tags, setTags] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('subcategories')
      .select('*')
      .order('name');
    setTags(data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, isLoading, refetch: fetchTags };
}
