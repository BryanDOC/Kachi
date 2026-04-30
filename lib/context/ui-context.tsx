'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TransactionWithRelations } from '@/types';

interface UserProfile {
  fullName: string | null;
  avatarUrl: string | null;
}

interface UIContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  txSheetOpen: boolean;
  txTripId: string | null;
  editTx: TransactionWithRelations | null;
  openTxSheet: (tripId?: string) => void;
  openEditTxSheet: (tx: TransactionWithRelations) => void;
  closeTxSheet: () => void;
  userProfile: UserProfile | null;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  txVersion: number;
  notifyTxCreated: () => void;
}

const UIContext = createContext<UIContextValue>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  txSheetOpen: false,
  txTripId: null,
  editTx: null,
  openTxSheet: () => {},
  openEditTxSheet: () => {},
  closeTxSheet: () => {},
  userProfile: null,
  updateUserProfile: () => {},
  txVersion: 0,
  notifyTxCreated: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [txSheetOpen, setTxSheetOpen] = useState(false);
  const [txTripId, setTxTripId] = useState<string | null>(null);
  const [editTx, setEditTx] = useState<TransactionWithRelations | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [txVersion, setTxVersion] = useState(0);

  const notifyTxCreated = () => setTxVersion((v) => v + 1);
  const updateUserProfile = (updates: Partial<UserProfile>) =>
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : (updates as UserProfile)));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
        .then(async ({ data }) => {
          if (!data) {
            await fetch('/api/seed', { method: 'POST' });
          }
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
    setEditTx(null);
    setTxTripId(tripId ?? null);
    setTxSheetOpen(true);
  };

  const openEditTxSheet = (tx: TransactionWithRelations) => {
    setTxTripId(null);
    setEditTx(tx);
    setTxSheetOpen(true);
  };

  const closeTxSheet = () => {
    setTxSheetOpen(false);
    setTxTripId(null);
    setEditTx(null);
  };

  return (
    <UIContext.Provider value={{ sidebarOpen, setSidebarOpen, txSheetOpen, txTripId, editTx, openTxSheet, openEditTxSheet, closeTxSheet, userProfile, updateUserProfile, txVersion, notifyTxCreated }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}
