import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { BudgetAlertsProvider } from '@/components/layout/BudgetAlertsProvider';
import { BudgetAlerts } from '@/components/layout/BudgetAlerts';
import { PageTransition } from '@/components/layout/PageTransition';
import { UIProvider } from '@/lib/context/ui-context';
import { NewTransactionSheet } from '@/components/layout/NewTransactionSheet';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
        <defs>
          <linearGradient id="icon-card-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--icon-grad-start)" />
            <stop offset="100%" stopColor="var(--icon-grad-end)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <BudgetAlertsProvider>
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 lg:pb-0">
            <BudgetAlerts />
            <main className="flex-1 px-5 lg:px-12 pb-12 pt-5">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </BudgetAlertsProvider>
        <BottomNav />
        <NewTransactionSheet />
      </div>
    </UIProvider>
  );
}
