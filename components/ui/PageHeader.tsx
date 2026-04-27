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
  const { setSidebarOpen, userProfile } = useUI();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 rounded-full overflow-hidden border border-border flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          {userProfile?.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-bg-input flex items-center justify-center text-text2">
              {userProfile?.fullName ? (
                <span className="text-[14px] font-semibold">
                  {userProfile.fullName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={17} />
              )}
            </div>
          )}
        </button>
        <div>
          <h1 className="font-sans text-[20px] font-bold text-text1 leading-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-text3 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
