'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  txSheetOpen: boolean;
  txTripId: string | null;
  openTxSheet: (tripId?: string) => void;
  closeTxSheet: () => void;
}

const UIContext = createContext<UIContextValue>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  txSheetOpen: false,
  txTripId: null,
  openTxSheet: () => {},
  closeTxSheet: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [txSheetOpen, setTxSheetOpen] = useState(false);
  const [txTripId, setTxTripId] = useState<string | null>(null);

  const openTxSheet = (tripId?: string) => {
    setTxTripId(tripId ?? null);
    setTxSheetOpen(true);
  };

  const closeTxSheet = () => {
    setTxSheetOpen(false);
    setTxTripId(null);
  };

  return (
    <UIContext.Provider value={{ sidebarOpen, setSidebarOpen, txSheetOpen, txTripId, openTxSheet, closeTxSheet }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}
