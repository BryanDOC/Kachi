import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BudgetAlertsProvider } from '@/components/layout/BudgetAlertsProvider';
import { BudgetAlerts } from '@/components/layout/BudgetAlerts';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { PageTransition } from '@/components/layout/PageTransition';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <BudgetAlertsProvider>
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top bar */}
          <div className="flex justify-end px-8 lg:px-12 pt-5 pb-1 flex-shrink-0">
            <NotificationBell />
          </div>

          {/* Budget alert banners */}
          <BudgetAlerts />

          <main className="flex-1 px-8 lg:px-12 pb-12 pt-3">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </BudgetAlertsProvider>
    </div>
  );
}
