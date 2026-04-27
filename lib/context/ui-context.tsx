'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  fullName: string | null;
  avatarUrl: string | null;
}

interface UIContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  txSheetOpen: boolean;
  txTripId: string | null;
  openTxSheet: (tripId?: string) => void;
  closeTxSheet: () => void;
  userProfile: UserProfile | null;
}

const UIContext = createContext<UIContextValue>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  txSheetOpen: false,
  txTripId: null,
  openTxSheet: () => {},
  closeTxSheet: () => {},
  userProfile: null,
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [txSheetOpen, setTxSheetOpen] = useState(false);
  const [txTripId, setTxTripId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          // Prefer profiles table, fallback to auth user_metadata (Google/OAuth avatars)
          const avatarUrl =
            data?.avatar_url ||
            (user.user_metadata?.avatar_url as string | null) ||
            null;
          const fullName =
            data?.full_name ||
            (user.user_metadata?.full_name as string | null) ||
            (user.user_metadata?.name as string | null) ||
            null;
          setUserProfile({ fullName, avatarUrl });
        });
    });
  }, []);

  const openTxSheet = (tripId?: string) => {
    setTxTripId(tripId ?? null);
    setTxSheetOpen(true);
  };

  const closeTxSheet = () => {
    setTxSheetOpen(false);
    setTxTripId(null);
  };

  return (
    <UIContext.Provider value={{ sidebarOpen, setSidebarOpen, txSheetOpen, txTripId, openTxSheet, closeTxSheet, userProfile }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}
