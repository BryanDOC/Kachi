import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { BudgetAlertsProvider } from '@/components/layout/BudgetAlertsProvider';
import { BudgetAlerts } from '@/components/layout/BudgetAlerts';
import { PageTransition } from '@/components/layout/PageTransition';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
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
    </div>
  );
}
