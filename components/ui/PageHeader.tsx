'use client';

import { ReactNode } from 'react';
import { useUI } from '@/lib/context/ui-context';
import { User } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const { setSidebarOpen } = useUI();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 rounded-full bg-bg-input border border-border flex items-center justify-center text-text2 hover:text-text1 transition-colors flex-shrink-0"
        >
          <User size={17} />
        </button>
        <div>
          <h1 className="font-display text-[26px] font-extrabold text-text1 tracking-tight leading-none">
            {title}
          </h1>
          {subtitle && <p className="text-[13px] text-text3 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
