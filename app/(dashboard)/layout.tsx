import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">{children}</main>
    </div>
  );
}
